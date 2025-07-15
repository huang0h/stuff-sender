import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import { ItemMessage, MessageTypes } from "../types/types";
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);

const clientConnections: Map<string, WebSocket[]> = new Map();
const socketLookup: Map<WebSocket, string> = new Map();

const socketServer = new WebSocketServer({ server });

function sendCountMessage(socket: WebSocket, count: number) {
  socket.send(JSON.stringify({ type: MessageTypes.COUNT, count }));
}

function handlePong(socket, data) {
  const { userId } = data;

  const existingConnections = clientConnections.get(userId);

  let newConnections: WebSocket[];
  if (!existingConnections) {
    newConnections = [socket];
  } else {
    newConnections = [...existingConnections, socket];
  }
  clientConnections.set(userId, newConnections);
  socketLookup.set(socket, userId);

  for (let conn of newConnections) {
    sendCountMessage(conn, newConnections.length);
  }
}

socketServer.on("connection", (socket, req) => {
  console.log("new connection");

  socket.send(
    JSON.stringify({
      type: MessageTypes.PING,
    })
  );

  socket.on("message", (data, isBinary) => {
    let body = JSON.parse(data as unknown as string);

    // All messages sent by the client need an identifying user ID
    if (body.userId === undefined || body.type === undefined) {
      // TODO: replace console.warns with actual error handling
      console.warn(`Received invalid message: `, body);
      return;
    }

    // Pong message means client wants to connect to server
    if (body.type === MessageTypes.PONG) {
      handlePong(socket, body);
      return;
    }

    // Otherwise, message is an uploaded artifact and data is required
    if (body.type !== MessageTypes.ITEM || body.payload === undefined) {
      // TODO: replace console.warns with actual error handling
      console.warn(`Received invalid message: `, body);
      return;
    }

    const { name: itemName, type: itemType, data: itemData } = body.payload;
    if (itemName === undefined || itemType === undefined || itemData === undefined) {
      console.warn('Received item message with invalid fields');
      return;
    }

    const userConnections = clientConnections.get(body.userId);
    if (userConnections === undefined || userConnections.length < 2) {
      console.warn("No connections available to send to");
      return;
    }

    const forwardMessageBody: ItemMessage = {
      userId: body.userId,
      type: MessageTypes.ITEM,
      payload: {
        name: itemName,
        type: itemType,
        data: itemData,
      },
    };

    // console.info('Forwarding message:', forwardMessageBody);

    for (let sock of userConnections) {
      if (sock !== socket) {
        sock.send(JSON.stringify(forwardMessageBody));
      }
    }
  });

  socket.on("close", (code, reason) => {
    const socketUser = socketLookup.get(socket);
    if (socketUser === undefined) {
      console.error(`ERROR: found socket with no user`);
      return;
    }

    const userConnections = clientConnections.get(socketUser);
    if (userConnections === undefined) {
      console.error("ERROR: unable to find socket connections for user");
      return;
    }

    // Clean up connections: delete from both userId -> socket and socket -> userId maps
    console.log(`Closing connection for ${socketUser} | code: ${code} | reason: ${reason}`);

    const remainingConnections = userConnections.filter((s) => s !== socket);
    if (remainingConnections.length === 0) {
      clientConnections.delete(socketUser);
    } else {
      clientConnections.set(socketUser, remainingConnections);
    }
    socketLookup.delete(socket);

    for (let sock of remainingConnections) {
      sendCountMessage(sock, remainingConnections.length);
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

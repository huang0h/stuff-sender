import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';
import http from 'http'
import { PongPayload } from '../types/types';
import { existsSync } from 'fs';

const app = express();
const port = 3000;

const server = http.createServer(app)

const clientConnections: Map<string, WebSocket[]> = new Map();
const socketLookup: Map<WebSocket, string> = new Map();

const socketServer = new WebSocketServer({ server });

socketServer.on('connection', (socket, req) => {
  console.log('new connection');
  
  socket.send(JSON.stringify({
    type: 'ping',
  }));

  socket.on('pong', (data) => {
    const body = JSON.parse(data.toString('utf-8')) as PongPayload;
    const { userId } = body;

    const existingConnections = clientConnections.get(userId);
    if (!existingConnections) {
      clientConnections.set(userId, [socket]);
    } else {
      clientConnections.set(userId, [...existingConnections, socket]);
    }
    socketLookup.set(socket, userId);

    socket.send(JSON.stringify({
      type: 'count',
      count: clientConnections.get(userId)?.length ?? 0,
    }));
  });

  socket.on('message', (data, isBinary) => {
    let body = JSON.parse(data as unknown as string);
    
    if (body.userId === undefined || body.type === undefined || body.data === undefined) {
      // TODO: replace console.warns with actual error handling
      console.warn(`Received invalid message: ${body}`);
      return;
    }

    const userConnections = clientConnections.get(body.userId);
    if (userConnections === undefined || userConnections.length < 2) {
      console.warn('No connections available to send to');
      return;
    }

    const messageBody = { userId: body.userId, type: body.type, data: body.type };
    for (let sock of userConnections) {
      if (sock !== socket) {
        sock.send(JSON.stringify(messageBody));
      }
    }
  });

  socket.on('close', () => {
    const socketUser = socketLookup.get(socket);
    if (socketUser === undefined) {
      console.error(`ERROR: found socket with no user`);
      return;
    }

    const userConnections = clientConnections.get(socketUser);
    if (userConnections === undefined) {
      console.error('ERROR: unable to find socket connections for user');
      return;
    }

    // Clean up connections: delete from both userId -> socket and socket -> userId maps
    const remainingConnections = userConnections.filter((s) => s !== socket);
    if (remainingConnections.length === 0) {
      clientConnections.delete(socketUser);
    } else {
      clientConnections.set(socketUser, remainingConnections);
    }
    socketLookup.delete(socket);
  });
})

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
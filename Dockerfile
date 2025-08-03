FROM node:24-alpine

WORKDIR /usr/local/app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci

COPY backend/ ./backend/
COPY types/ ./types/

WORKDIR /usr/local/app/backend

EXPOSE 3000
CMD ["npm", "run", "start"]

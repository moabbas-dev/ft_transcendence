# backend/Dockerfile
FROM node:22-alpine

RUN apk add --no-cache make gcc g++ python3

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm rebuild sqlite3

COPY . .

EXPOSE 3003

CMD ["node", "index.js"]
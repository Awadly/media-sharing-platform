FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

CMD ["sh", "-c", "npx knex migrate:latest --env development && node dist/src/server.js"]

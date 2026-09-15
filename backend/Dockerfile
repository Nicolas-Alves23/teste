FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

# node:20-alpine já traz um usuário "node" não-root pronto para uso
RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["node", "src/server.js"]

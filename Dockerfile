FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

ENV NODE_ENV=production
ENV PORT=3000
ENV MAX_PLAYLIST_MB=50
ENV PLAYLIST_TIMEOUT_MS=60000
EXPOSE 3000

CMD ["npm", "start"]

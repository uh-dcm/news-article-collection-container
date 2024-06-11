FROM node:22-bookworm-slim

WORKDIR /app/client

COPY . .

RUN npm install

RUN npm run build

EXPOSE 4000

CMD sh -c "npm run dev"
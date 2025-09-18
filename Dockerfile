
FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install -g ts-node
RUN npm install

COPY . .

RUN npx prisma generate

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

COPY initial-setup.sh .
RUN chmod +x initial-setup.sh

CMD ["./entrypoint.sh"]
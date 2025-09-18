
FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install -g ts-node
RUN npm install

COPY . .

RUN npx prisma generate

CMD ["npm", "run", "dev"]
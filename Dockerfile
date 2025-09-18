
# FROM node:18

# WORKDIR /app

# COPY package*.json ./

# RUN npm install -g ts-node
# RUN npm install

# COPY . .

# RUN npx prisma generate

# COPY entrypoint.sh .
# RUN chmod +x entrypoint.sh

# CMD ["./entrypoint.sh"]

FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

CMD ["npm", "run", "dev"]
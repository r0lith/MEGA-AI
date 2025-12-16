FROM node:20-bullseye

WORKDIR /root/mega-md

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]

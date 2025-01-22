FROM node:20-buster

RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp \
  libnss3 && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

COPY package.json . 

RUN npm install && npm install qrcode-terminal

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]

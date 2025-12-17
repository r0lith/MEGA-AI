FROM node:20-bullseye

WORKDIR /root/mega-md

# Install ffmpeg (required for sticker command)
RUN apt-get update \
 && apt-get install -y ffmpeg \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]

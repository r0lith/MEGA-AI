FROM node:20-buster

RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp \
  libnss3 \
  libatk1.0-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libatk-bridge2.0-0 \
  libxkbcommon0 \
  libwayland-client0 \
  libwayland-cursor0 \
  libwayland-egl1 \
  libepoxy0 \
  libcups2 \
  fonts-liberation \
  libfontconfig1 \
  libjpeg62-turbo \
  libxshmfence1 && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

COPY package.json . 

RUN npm install && npm install qrcode-terminal

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]



FROM quay.io/qasimtech/mega-bot:latest

RUN git clone https://github.com/GlobalTechInfo/MEGA-AI /root/mega-ai && \
    rm -rf /root/mega-ai/.git

WORKDIR /root/mega-ai
RUN npm install || yarn install

EXPOSE 5000
CMD ["npm", "start"]

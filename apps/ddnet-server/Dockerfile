FROM node:20.7.0-slim
# the image comes with a node user:
USER node

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY dest/index.js .

CMD ["node","index.js"]

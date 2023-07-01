FROM node:19-slim
# the image comes with a node user:
USER node

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node dest/index.js .

CMD ["node","index.js"]

FROM node:16.17

RUN mkdir -p /app
WORKDIR /app
ADD . /app

RUN yarn
    # yarn run build && \
    # yarn cache clean

EXPOSE 3000
EXPOSE 9000
EXPOSE 9090

CMD [ "yarn", "client" ]
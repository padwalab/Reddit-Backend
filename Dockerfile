FROM  node:latest

WORKDIR /usr/src/reddit-backend

COPY packag*.json ./

RUN npm i

EXPOSE 8000

CMD [ "npm", "run", "start:dev" ]
FROM  node:latest

WORKDIR /usr/src/reddit-backend

COPY packag*.json ./

COPY . .

RUN npm i nodemon -g

RUN npm i

EXPOSE 8000

CMD [ "npm", "run", "start:dev" ]
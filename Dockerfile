FROM node:19

WORKDIR /usr/src/app

COPY package*.json ./

COPY ./node_modules ./node_modules

COPY index.js ./

EXPOSE 3000

CMD ["node", "index.js"]
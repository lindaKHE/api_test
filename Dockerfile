FROM node:18 AS builder

ARG PORT=3000

# RUN apk add openssl

WORKDIR /var/www

COPY . .

RUN yarn config set registry http://npm.airweb.fr
RUN yarn install --non-interactive 
RUN yarn run build

EXPOSE ${PORT}

CMD yarn start:prod

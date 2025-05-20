## Description

Template API

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod

# docker dev mode
$ docker build -t <image_tag> . && docker run -p 0.0.0.0:3000:3000 -v ./:/var/www --name TemplateApi <image_tag> 
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

# ct-iot-things-lambda

## Description
The `ct-iot-things-lambda` reads/writes `things` to a database, and is placed behind an API Gateway.

[Flow chart and sequence diagrams](./docs/DIAGRAMS.md)

## Run

### Lint
```
npm run lint
```

### Test
```
docker-compose up
npm run test
```

## Package
The following NPM run scripts zip and move the packages to `../ct-iot-serverless-infrastructure` for deployment via 
terraform
```
# development
npm run dev:package-create
npm run dev:package-read
# or
npm run dev:package-all

# production
npm run prod:package-create
npm run prod:package-read
# or
npm run prod:package-all
```

## Deployment
Must be deployed **after** the `things` Database.

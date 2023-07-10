# ct-iot-things-lambda

## Run

### Lint
```
npm run lint
```
### Build
```
npm run build
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

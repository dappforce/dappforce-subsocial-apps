FROM node:10-slim as builder

WORKDIR /apps
COPY . .

RUN yarn
RUN NODE_ENV=production yarn build:www

FROM node:10-slim

RUN apt-get update && apt-get -y install nginx

COPY --from=builder /apps/packages/apps/build /var/www/html

EXPOSE 3002

CMD ["nginx", "-g", "daemon off;"]

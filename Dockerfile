FROM node:10.13-slim as builder

WORKDIR /apps

COPY package.json yarn.lock* ./
RUN yarn install --no-optional

COPY . .
RUN yarn && yarn cache clean --force
RUN NODE_ENV=production yarn build

FROM node:10.13-slim

RUN apt-get update && apt-get -y install nginx

COPY --from=builder /apps/packages/apps/build /var/www/html

EXPOSE 3002

CMD ["nginx", "-g", "daemon off;"]

FROM node:10.13 as builder

RUN git clone -b df-pre-ipfs https://github.com/dappforce/dappforce-subsocial-ui.git

WORKDIR /dappforce-subsocial-ui
RUN yarn
RUN NODE_ENV=production yarn build

FROM node:10.13

RUN apt-get update && apt-get -y install nginx

COPY --from=builder /dappforce-subsocial-ui/packages/apps/build /var/www/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

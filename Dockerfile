FROM node as builder

RUN git clone https://github.com/dappforce/dappforce-subsocial-ui.git

WORKDIR /dappforce-subsocial-ui
RUN yarn
RUN NODE_ENV=production yarn start

FROM node

RUN apt-get update && apt-get -y install nginx

COPY --from=builder /dappforce-subsocial-ui/packages/apps/build /var/www/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

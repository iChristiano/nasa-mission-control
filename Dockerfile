# docker login
# docker  build . -t ichristianohub/nasa-mission-control
# docker push

# docker run -it -p 8000:8000 ichristianohub/nasa-mission-control

FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

COPY client/package*.json client/
RUN npm run install-client --only=production

COPY server/package*.json server/
RUN npm run install-server --only=production

COPY client/ client/
RUN npm run build --prefix client

COPY server/ server/

USER node

CMD ["npm", "start", "--prefix", "server"]

EXPOSE 8000
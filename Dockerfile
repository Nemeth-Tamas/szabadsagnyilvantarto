FROM node:19.4.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=0 /app/dist /usr/share/nginx/html

ENV VITE_APPWRITE_ENDPOINT=${VITE_APPWRITE_ENDPOINT}
ENV VITE_APPWRITE_PROJECT=${VITE_APPWRITE_PROJECT}

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
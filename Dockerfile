FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_VERTEX_API_KEY
ARG VITE_VERTEX_PROJECT
ARG VITE_VERTEX_LOCATION
ENV VITE_VERTEX_API_KEY=${VITE_VERTEX_API_KEY}
ENV VITE_VERTEX_PROJECT=${VITE_VERTEX_PROJECT}
ENV VITE_VERTEX_LOCATION=${VITE_VERTEX_LOCATION}
RUN npm run build
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN echo 'server { listen 8080; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

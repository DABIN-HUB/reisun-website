ARG NGINX_RUNTIME_IMAGE=nginx:stable-alpine
FROM node:lts AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm install

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG SITE_RELEASE_ID=local
RUN SITE_ENV=production SITE_RELEASE_ID="$SITE_RELEASE_ID" npm run build

# Export only the generated website; no runtime image/container update is needed.
FROM scratch AS static-artifact
COPY --from=build /app/dist/ /

# Long-lived hot-publish runtime. Mount the entire release parent at /srv/site.
FROM ${NGINX_RUNTIME_IMAGE} AS hot-runtime
LABEL io.reisun.static-hot-publish="1"
COPY ./nginx/hot-publish.conf /etc/nginx/nginx.conf
EXPOSE 8080

# Keep the original standalone image as the default build target.
FROM nginx:stable-alpine AS deploy
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

FROM node:16-alpine3.16 as build
WORKDIR /app

RUN apk add curl
RUN curl -fsSL "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linuxstatic-x64" -o /bin/pnpm; chmod +x /bin/pnpm;

COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm install

COPY . .
RUN pnpm build

FROM nginx:stable-alpine
COPY nginx/ /etc/nginx/
COPY --from=build /app/dist /usr/share/nginx/html
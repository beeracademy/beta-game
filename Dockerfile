FROM node:26-alpine AS build
WORKDIR /app

RUN npm install -g pnpm@11.22.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:stable-alpine
COPY nginx/ /etc/nginx/
COPY --from=build /app/dist /usr/share/nginx/html

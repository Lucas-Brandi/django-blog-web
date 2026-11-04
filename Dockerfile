# syntax=docker/dockerfile:1
ARG NODE_VERSION=22

# ---------- base ----------
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
# Evita que o script "prepare" do husky rode dentro do container
ENV HUSKY=0

# ---------- deps ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---------- dev (hot reload) ----------
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---------- build ----------
FROM deps AS build
# Variáveis VITE_* são embutidas no bundle em tempo de build
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=${VITE_API_URL}
COPY . .
RUN npm run build

# ---------- prod (nginx) ----------
FROM nginx:alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
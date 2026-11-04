FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
# HUSKY=0 evita erro do script "prepare" (não existe .git no container)
RUN HUSKY=0 npm ci
COPY . .

# ---- dev ----
FROM base AS dev
EXPOSE 5173
CMD ["npm", "run", "dev"]

# ---- build ----
FROM base AS build
RUN npm run build

# ---- prod ----
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
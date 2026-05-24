# --- BUILD STAGE ---
FROM node:20-alpine AS build
WORKDIR /app

# Copy package requirements and lock files
COPY package*.json ./
RUN npm ci

# Copy all source files and compile
COPY . .
RUN npm run build

# --- PRODUCTION STAGE ---
FROM nginx:stable-alpine
# Copy compiled static assets from build stage to Nginx directory
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

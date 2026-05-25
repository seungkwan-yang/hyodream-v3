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
FROM node:20-alpine AS production
WORKDIR /app

# Install production dependencies only (keep container super light)
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled assets from build stage and backend server file
COPY --from=build /app/dist ./dist
COPY server.js ./

EXPOSE 8080
ENV NODE_ENV=production

# Run our express backend server directly on Cloud Run
CMD ["node", "server.js"]

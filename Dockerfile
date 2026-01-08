# Multi-stage build for Node + TypeScript + Prisma
FROM node:18-alpine AS build
WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Prisma generate before build
COPY prisma ./prisma
RUN npx prisma generate

# Compile TS
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Runtime image
FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Postgres client to allow pg_isready/waits if needed
RUN apk add --no-cache postgresql-client

# Copy runtime assets
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]

FROM node:20-bookworm-slim

WORKDIR /app

# Install system dependencies for Prisma and health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install app dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copy source and build
COPY . .

RUN npx prisma generate
RUN npm run build

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]

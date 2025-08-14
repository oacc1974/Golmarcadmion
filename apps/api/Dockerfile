FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Copy source code
COPY apps/api ./apps/api
COPY libs ./libs

# Install dependencies
RUN npm install

# Build the application
RUN npm run build:api

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files and built application
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose the port
EXPOSE 3001

# Start the application
CMD ["node", "dist/apps/api/main"]

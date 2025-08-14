FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Copy source code
COPY apps/web ./apps/web

# Install dependencies
RUN npm install

# Build the application
RUN npm run build:web

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files and built application
COPY package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/public ./apps/web/public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:web"]

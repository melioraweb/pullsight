# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies (including dev dependencies for building)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .
COPY .env.docker .env

# Build the application
RUN yarn build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Copy node_modules from builder stage (includes all dependencies)
COPY --from=builder /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy environment file and private key (with error checking)
COPY .env ./
COPY app.private-key.pem ./app.private-key.pem

# # Debug: List files to verify they were copied
# RUN ls -la /app/ && \
#     echo "Checking if private key exists:" && \
#     test -f /app/app.private-key.pem && echo "Private key file exists" || echo "Private key file NOT found"

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3001

CMD ["node", "dist/main.js"]
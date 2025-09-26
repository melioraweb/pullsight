# 1. Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY . .
COPY .env.docker .env

# Read the NEXT_PUBLIC_API_URL from the .env file during build
RUN yarn install --frozen-lockfile
RUN yarn build

# 2. Run stage
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]

# CMD ["yarn", "start"]

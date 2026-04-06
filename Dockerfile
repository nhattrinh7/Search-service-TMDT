# 1. Stage deps: tải Production Dependencies ĐỂ DÀNH
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

# 2. Stage builder: cài full tĩnh và build code
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# 3. Stage runner
FROM node:20-alpine AS runner
ENV NODE_ENV='production'
WORKDIR /app

# Lấy 'node_modules' SẠCH từ tầng 'deps'
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

CMD ["yarn", "start:prod"]

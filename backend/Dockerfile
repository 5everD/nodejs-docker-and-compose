FROM node:16-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:16-alpine AS production

WORKDIR /app

COPY --from=builder /app/package*.json ./

COPY --from=builder /app/ecosystem.config.js ./

RUN npm install -g pm2 \
    && npm ci --omit=dev --no-audit --no-fund

COPY --from=builder /app/dist ./dist/

EXPOSE 3000

ENTRYPOINT ["pm2-runtime", "start", "ecosystem.config.js"]
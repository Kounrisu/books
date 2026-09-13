FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate --config prisma7.config.ts
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma7.config.ts ./prisma7.config.ts
COPY --from=build /app/src/generated ./dist/src/generated
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy --config prisma7.config.ts && node dist/src/main.js"]

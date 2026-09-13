FROM node:24-alpine AS build
WORKDIR /app
ARG CONFIGURATION=production
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration=$CONFIGURATION

FROM node:24-alpine AS runtime
WORKDIR /app
RUN npm install -g http-server
COPY --from=build /app/dist/frontend/browser ./browser
EXPOSE 4200
CMD ["http-server", "browser", "-p", "4200", "--proxy", "http://localhost:4200?"]

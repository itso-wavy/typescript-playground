FROM node:24-bookworm-slim AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=4173
WORKDIR /app
COPY package.json package-lock.json ./
# The API invokes the pinned TypeScript compiler and esbuild for each check.
# Keep optional platform packages so the Linux esbuild binary is installed.
RUN npm ci
COPY --from=builder --chown=node:node /app/dist ./dist
USER node
EXPOSE 4173
CMD ["node", "dist/server.mjs"]

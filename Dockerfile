FROM node:24-slim AS build
RUN corepack enable
WORKDIR /src
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY e2e/package.json e2e/
RUN pnpm install --frozen-lockfile --filter api --filter web
COPY apps ./apps
RUN pnpm --filter api build && pnpm --filter web build \
 && pnpm --filter api deploy --prod --legacy /out

FROM node:24-slim
ENV NODE_ENV=production PORT=3000 WEB_DIR=/app/public
WORKDIR /app
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /out/package.json ./
COPY --from=build /src/apps/api/dist ./dist
COPY --from=build /src/apps/web/dist ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main.js"]

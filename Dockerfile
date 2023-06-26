FROM node:lts-alpine
WORKDIR /usr/src/app
ENV PORT=3000 \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs public ./public/
COPY --chown=nextjs:nodejs .next/static ./.next/static

USER nextjs
EXPOSE 3000

ENV NODE_OPTIONS="--no-experimental-fetch"
CMD ["node", "server.js"]
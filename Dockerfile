FROM node:lts-alpine
WORKDIR /usr/src/app
ENV PORT=3000 \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --chown=nextjs:nodejs node_modules ./node_modules
COPY --chown=nextjs:nodejs next.config.js ./
COPY --chown=nextjs:nodejs next-logger.config.mjs ./
COPY --chown=nextjs:nodejs public ./public/
COPY --chown=nextjs:nodejs .next ./.next

USER nextjs
EXPOSE 3000

ENV NODE_OPTIONS '-r next-logger'

CMD ["./node_modules/next/dist/bin/next", "start"]

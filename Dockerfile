FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /app

COPY /.next/standalone /app
COPY /.next/static /app/.next/static
COPY /public /app/public

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

CMD ["server.js"]

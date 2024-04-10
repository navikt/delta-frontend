import pino from "pino";

export const logger = (defaultConfig) =>
  pino({
    ...defaultConfig,
    timestamp: false,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
  });

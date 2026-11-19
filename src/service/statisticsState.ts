import { createLoader, createParser, parseAsInteger } from "nuqs/server";

export const statisticsYearParser = createParser({
  parse(value) {
    const year = parseAsInteger.parse(value);
    return year !== null && year >= 2000 && year <= 2100 ? year : null;
  },
  serialize: String,
});

export const loadStatisticsState = createLoader({ year: statisticsYearParser });

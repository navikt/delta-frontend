import { createParser, parseAsInteger } from "nuqs/server";

export const parseAsYear = createParser({
  parse(value) {
    const year = parseAsInteger.parse(value);
    return year !== null && year >= 2000 && year <= 2100 ? year : null;
  },
  serialize: String,
});

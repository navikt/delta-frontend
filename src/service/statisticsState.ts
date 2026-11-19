import { createLoader } from "nuqs/server";
import { parseAsYear } from "./yearState.ts";

export const statisticsYearParser = parseAsYear;

export const loadStatisticsState = createLoader({ year: statisticsYearParser });

import { addWeeks, addMonths } from "date-fns";

export type RecurrenceFrequency = "weekly" | "biweekly" | "monthly";

export type RecurrenceEndCondition =
  | { type: "date"; endDate: Date }
  | { type: "count"; count: number };

export function generateOccurrenceDates(
  startDate: Date,
  frequency: RecurrenceFrequency,
  endCondition: RecurrenceEndCondition,
): Date[] {
  const dates: Date[] = [startDate];

  const addInterval = (date: Date): Date => {
    switch (frequency) {
      case "weekly":
        return addWeeks(date, 1);
      case "biweekly":
        return addWeeks(date, 2);
      case "monthly":
        return addMonths(date, 1);
    }
  };

  if (endCondition.type === "count") {
    for (let i = 1; i < endCondition.count; i++) {
      dates.push(addInterval(dates[dates.length - 1]));
    }
  } else {
    let next = addInterval(startDate);
    while (next <= endCondition.endDate) {
      dates.push(next);
      next = addInterval(next);
    }
  }

  return dates;
}

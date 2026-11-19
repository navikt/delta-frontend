"use client";

import { Select } from "@navikt/ds-react";

export default function YearSelector({
  selectedYear,
  years,
  onChange,
}: {
  selectedYear: number;
  years: number[];
  onChange: (year: number) => void;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4">
        <Select
          label="Velg år"
          value={selectedYear.toString()}
          onChange={event => onChange(Number(event.target.value))}
          className="max-w-xs"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

"use client";

import { Select } from "@navikt/ds-react";
import { useRouter } from "next/navigation";

export default function YearSelector({
  selectedYear,
  currentYear,
}: {
  selectedYear: number;
  currentYear: number;
}) {
  const router = useRouter();

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = event.target.value;
    router.push(`/stats?year=${year}`);
  };

  // Generate years from 2024 to current year
  const years = [];
  for (let year = 2024; year <= currentYear; year++) {
    years.push(year);
  }

  return (
    <div className="mb-6">
      <Select
        label="Velg år"
        value={selectedYear.toString()}
        onChange={handleYearChange}
        className="max-w-xs"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </Select>
    </div>
  );
}

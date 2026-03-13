"use client";

import { Select, Loader } from "@navikt/ds-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function YearSelector({
  selectedYear,
  currentYear,
}: {
  selectedYear: number;
  currentYear: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = event.target.value;
    startTransition(() => {
      router.push(`/statistikk?year=${year}`);
    });
  };

  // Generate years from 2024 to current year
  const years = [];
  for (let year = 2024; year <= currentYear; year++) {
    years.push(year);
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4">
        <Select
          label="Velg år"
          value={selectedYear.toString()}
          onChange={handleYearChange}
          className="max-w-xs"
          disabled={isPending}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>
        {isPending && (
          <div className="flex items-center gap-2 mt-6">
            <Loader size="small" title="Laster statistikk..." />
            <span className="text-sm text-ax-neutral-700">Laster...</span>
          </div>
        )}
      </div>
    </div>
  );
}

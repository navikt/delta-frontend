"use client";

import { Pagination, Table } from "@navikt/ds-react";
import Link from "next/link";
import { useState } from "react";
import { UserWrappedStats } from "@/service/wrappedActions";

type MimretidClientProps = {
  stats: UserWrappedStats;
  year: number;
  nowMs: number;
};

export default function MimretidClient({ stats, year, nowMs }: MimretidClientProps) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ orderBy: string; direction: "ascending" | "descending" }>({
    orderBy: "date",
    direction: "ascending",
  });
  const rowsPerPage = 10;
  const events = (stats.attendedEvents || []).filter((event) => new Date(event.date).getTime() <= nowMs);
  const count = events.length;
  const totalPages = Math.ceil(count / rowsPerPage);

  const sortedEvents = [...events].sort((a, b) => {
    if (sort.orderBy !== "date") return 0;
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sort.direction === "ascending" ? dateA - dateB : dateB - dateA;
  });

  const displayedEvents = sortedEvents.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSort = (sortKey: string) => {
    setSort((prev) => ({
      orderBy: sortKey,
      direction: prev.orderBy === sortKey && prev.direction === "ascending" ? "descending" : "ascending",
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-ax-neutral-800">År:</span>
        <YearLinks selectedYear={year} />
      </div>
      <div className="bg-ax-bg-neutral-soft border border-ax-neutral-300 rounded-lg px-4 py-3">
        <p className="text-sm text-ax-neutral-800">Totalt antall arrangementer</p>
        <p className="text-2xl font-ax-bold text-ax-neutral-1000">{count}</p>
      </div>

      {count === 0 ? (
        <p className="text-ax-neutral-900">Ingen arrangementer funnet for {year}.</p>
      ) : (
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-ax-neutral-300 min-h-[600px] flex flex-col">
          <Table size="large" sort={sort} onSortChange={handleSort}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell onClick={() => handleSort("date")} className="cursor-pointer select-none">
                  Dato
                  {sort.orderBy === "date" && <span className="ml-2">{sort.direction === "ascending" ? "↓" : "↑"}</span>}
                </Table.HeaderCell>
                <Table.HeaderCell>Arrangement</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {displayedEvents.map((event) => {
                const date = new Date(event.date);
                const dateString = date.toLocaleDateString("nb-NO", {
                  day: "numeric",
                  month: "long",
                });

                return (
                  <Table.Row key={event.id} className="h-16">
                    <Table.DataCell className="whitespace-nowrap capitalize align-middle">{dateString}</Table.DataCell>
                    <Table.DataCell className="align-middle">
                      {event.isPublic ? (
                        <a href={`/event/${event.id}`} className="font-semibold text-indigo-700 hover:underline line-clamp-2">
                          {event.title}
                        </a>
                      ) : (
                        <span className="font-semibold line-clamp-2">{event.title}</span>
                      )}
                    </Table.DataCell>
                  </Table.Row>
                );
              })}
              {Array.from({ length: Math.max(0, rowsPerPage - displayedEvents.length) }).map((_, index) => (
                <Table.Row key={`empty-${index}`} className="h-16">
                  <Table.DataCell className="whitespace-nowrap capitalize" aria-hidden="true">
                    &nbsp;
                  </Table.DataCell>
                  <Table.DataCell aria-hidden="true">&nbsp;</Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination page={page} onPageChange={setPage} count={totalPages} size="small" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function YearLinks({ selectedYear }: { selectedYear: number }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: Math.max(1, currentYear - 2023 + 1) }, (_, i) => currentYear - i);

  return (
    <div className="flex flex-wrap gap-2">
      {years.map((year) => (
        <Link
          key={year}
          href={`/mimretid?year=${year}`}
          className={`px-3 py-1 rounded-full border text-sm ${
            year === selectedYear
              ? "bg-ax-meta-purple-700 text-white border-ax-meta-purple-700"
              : "bg-white text-ax-neutral-900 border-ax-neutral-400 hover:bg-ax-bg-neutral-soft"
          }`}
        >
          {year}
        </Link>
      ))}
    </div>
  );
}

"use client";

import { BodyShort, Box, Heading, Link, Pagination, Table, ToggleGroup } from "@navikt/ds-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UserWrappedStats } from "@/service/wrappedActions";

const EMPTY_ROW_KEYS = Array.from({ length: 10 }, (_, index) => `empty-${index}`);

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
      <YearToggle selectedYear={year} />
      <Box background="neutral-soft" borderColor="neutral-subtle" borderWidth="1" borderRadius="8" paddingInline="space-16" paddingBlock="space-12">
        <BodyShort size="small" textColor="subtle">Totalt antall arrangementer</BodyShort>
        <Heading as="p" size="medium">{count}</Heading>
      </Box>

      {count === 0 ? (
        <BodyShort>Ingen arrangementer funnet for {year}.</BodyShort>
      ) : (
        <Box background="raised" borderColor="neutral-subtle" borderWidth="1" borderRadius="12" padding="space-24" className="min-h-[600px] flex flex-col">
          <Table size="large" sort={sort} onSortChange={handleSort}>
            <caption className="sr-only">Arrangementer i {year}</caption>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader sortKey="date" sortable>
                  Dato
                </Table.ColumnHeader>
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
                        <Link as={NextLink} href={`/event/${event.id}`} className="font-ax-bold">
                          <span className="line-clamp-2">{event.title}</span>
                        </Link>
                      ) : (
                        <span className="font-ax-bold line-clamp-2">{event.title}</span>
                      )}
                    </Table.DataCell>
                  </Table.Row>
                );
              })}
              {EMPTY_ROW_KEYS.slice(0, Math.max(0, rowsPerPage - displayedEvents.length)).map((key) => (
                // Filler rows keep the page height stable and are hidden from assistive tech.
                <Table.Row key={key} className="h-16" aria-hidden="true">
                  <Table.DataCell className="whitespace-nowrap capitalize">&nbsp;</Table.DataCell>
                  <Table.DataCell>&nbsp;</Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination page={page} onPageChange={setPage} count={totalPages} size="small" />
            </div>
          )}
        </Box>
      )}
    </div>
  );
}

function YearToggle({ selectedYear }: { selectedYear: number }) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: Math.max(1, currentYear - 2023 + 1) }, (_, i) => currentYear - i);

  return (
    <ToggleGroup
      label="År:"
      size="small"
      value={String(selectedYear)}
      onChange={(year) => router.push(`/mimretid?year=${year}`)}
    >
      {years.map((year) => (
        <ToggleGroup.Item key={year} value={String(year)} label={year} />
      ))}
    </ToggleGroup>
  );
}

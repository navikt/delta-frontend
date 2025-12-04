"use client";

import { Modal, Table, Pagination, Tabs, Search } from "@navikt/ds-react";
import { ArrowUpIcon, ArrowDownIcon } from "@navikt/aksel-icons";
import Link from "next/link";
import { CategoryEvent } from "@/service/statsActions";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { useState } from "react";

const ITEMS_PER_PAGE = 10;

export default function CategoryModal({
  isOpen,
  onClose,
  categoryName,
  events,
}: {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  events: CategoryEvent[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("detaljer");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortState, setSortState] = useState<{
    orderBy: string;
    direction: "ascending" | "descending";
  }>({
    orderBy: "startTime",
    direction: "descending",
  });

  // Filter events based on search
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortState.orderBy === "startTime") {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return sortState.direction === "ascending"
        ? dateA - dateB
        : dateB - dateA;
    } else {
      return sortState.direction === "ascending"
        ? a.participants - b.participants
        : b.participants - a.participants;
    }
  });

  const handleSort = (sortKey: string) => {
    setSortState((prev) => ({
      orderBy: sortKey,
      direction:
        prev.orderBy === sortKey && prev.direction === "descending"
          ? "ascending"
          : "descending",
    }));
  };

  // Pagination
  const totalPages = Math.ceil(sortedEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEvents = sortedEvents.slice(startIndex, endIndex);

  // Monthly stats calculation
  const monthlyStats = events.reduce((acc, event) => {
    const date = new Date(event.startTime);
    const monthKey = format(date, "yyyy-MM");
    const monthName = format(date, "MMMM yyyy", { locale: nb });

    if (!acc[monthKey]) {
      acc[monthKey] = { name: monthName, count: 0, date: date };
    }
    acc[monthKey].count += 1;
    return acc;
  }, {} as Record<string, { name: string; count: number; date: Date }>);

  const sortedMonthlyStats = Object.values(monthlyStats).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  const SortIcon = ({ column }: { column: string }) => {
    if (sortState.orderBy !== column) return null;
    return sortState.direction === "ascending" ? (
      <ArrowUpIcon className="ml-1" aria-hidden />
    ) : (
      <ArrowDownIcon className="ml-1" aria-hidden />
    );
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      header={{ heading: `${categoryName} - Arrangementer` }}
      width="medium"
    >
      <Modal.Body>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="detaljer" label="Detaljer" />
            <Tabs.Tab value="maaned" label="Antall arrangementer per måned" />
          </Tabs.List>

          <Tabs.Panel value="detaljer" className="pt-4">
            <div className="mb-4">
              <Search
                label="Søk etter arrangement"
                variant="simple"
                placeholder="Søk etter arrangement..."
                onChange={setSearchQuery}
                value={searchQuery}
              />
            </div>

            {events.length === 0 ? (
              <p className="text-gray-600">Ingen arrangementer funnet i denne kategorien.</p>
            ) : (
              <>
                <Table
                  size="small"
                >
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Arrangement</Table.HeaderCell>
                      <Table.HeaderCell
                        onClick={() => handleSort("startTime")}
                        className="cursor-pointer select-none"
                      >
                        <div className="flex items-center">
                          Dato
                          <SortIcon column="startTime" />
                        </div>
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        align="right"
                        onClick={() => handleSort("participants")}
                        className="cursor-pointer select-none"
                      >
                        <div className="flex items-center justify-end">
                          Deltakere
                          <SortIcon column="participants" />
                        </div>
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {currentEvents.map((event, index) => (
                      <Table.Row key={`${event.id}-${index}`}>
                        <Table.DataCell>
                          {event.isPublic ? (
                            <Link
                              href={`/event/${event.id}`}
                              className="text-blue-700 hover:text-blue-800 hover:underline"
                            >
                              {event.title}
                            </Link>
                          ) : (
                            <span className="text-gray-700">{event.title}</span>
                          )}
                        </Table.DataCell>
                        <Table.DataCell style={{ whiteSpace: "nowrap" }}>
                          {format(new Date(event.startTime), "d. MMM yyyy", {
                            locale: nb,
                          })}
                        </Table.DataCell>
                        <Table.DataCell align="right">
                          {event.participants.toLocaleString("nb-NO")}
                        </Table.DataCell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <Pagination
                      page={currentPage}
                      onPageChange={setCurrentPage}
                      count={totalPages}
                      size="small"
                    />
                  </div>
                )}
              </>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="maaned" className="pt-4">
            <Table size="small">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Måned</Table.HeaderCell>
                  <Table.HeaderCell align="right">Antall arrangementer</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sortedMonthlyStats.map((stat) => (
                  <Table.Row key={stat.name}>
                    <Table.DataCell className="capitalize">
                      {stat.name}
                    </Table.DataCell>
                    <Table.DataCell align="right">
                      {stat.count}
                    </Table.DataCell>
                  </Table.Row>
                ))}
                {sortedMonthlyStats.length === 0 && (
                  <Table.Row>
                    <Table.DataCell colSpan={2} className="text-center text-gray-500">
                      Ingen data tilgjengelig
                    </Table.DataCell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </Tabs.Panel>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
}

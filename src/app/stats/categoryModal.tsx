"use client";

import { Modal, Table } from "@navikt/ds-react";
import Link from "next/link";
import { CategoryEvent } from "@/service/statsActions";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

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
  // Sort events by start time (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      header={{ heading: `${categoryName} - Arrangementer` }}
      width="medium"
    >
      <Modal.Body>
        {events.length === 0 ? (
          <p className="text-gray-600">Ingen arrangementer funnet i denne kategorien.</p>
        ) : (
          <Table size="small">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Arrangement</Table.HeaderCell>
                <Table.HeaderCell>Dato</Table.HeaderCell>
                <Table.HeaderCell align="right">Deltakere</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortedEvents.map((event, index) => (
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
                  <Table.DataCell>
                    {format(new Date(event.startTime), "d. MMMM yyyy", {
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
        )}
      </Modal.Body>
    </Modal>
  );
}

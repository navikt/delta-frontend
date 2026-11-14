"use client";

import { useState, useTransition } from "react";
import { Button, Heading, LocalAlert, Modal, Table } from "@navikt/ds-react";
import type { WaitlistEntry } from "@/types/event";
import { removeWaitlistEntry } from "@/service/waitlistActions";

export default function WaitlistManager({ eventId, initialEntries }: {
  eventId: string; initialEntries: WaitlistEntry[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [selected, setSelected] = useState<WaitlistEntry | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const remove = () => {
    if (!selected) return;
    startTransition(async () => {
      const result = await removeWaitlistEntry(eventId, selected.email);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setEntries(result.data);
      setSelected(null);
      setError("");
    });
  };

  return <section aria-label="Venteliste" className="flex flex-col gap-4">
    <Heading level="2" size="medium">Venteliste ({entries.length})</Heading>
    <p>Delta melder automatisk på den første i køen når en plass blir ledig før fristen.
      Ventelisten er bare synlig for arrangører.</p>
    {entries.length === 0 ? <p>Ingen står på ventelisten.</p>
      : <div className="overflow-x-auto">
        <Table size="small">
          <caption className="sr-only">Venteliste i kø-rekkefølge</caption>
          <Table.Header><Table.Row>
            <Table.HeaderCell scope="col">Plass i køen</Table.HeaderCell>
            <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
            <Table.HeaderCell scope="col">E-post</Table.HeaderCell>
            <Table.HeaderCell scope="col">Handling</Table.HeaderCell>
          </Table.Row></Table.Header>
          <Table.Body>{entries.map((entry) => <Table.Row key={entry.email}>
            <Table.DataCell>{entry.position}</Table.DataCell>
            <Table.HeaderCell scope="row">{entry.name}</Table.HeaderCell>
            <Table.DataCell>{entry.email}</Table.DataCell>
            <Table.DataCell><Button size="small" variant="tertiary" data-color="danger"
              onClick={() => { setSelected(entry); setError(""); }}
              aria-label={`Fjern ${entry.name} fra ventelisten`}>Fjern</Button></Table.DataCell>
          </Table.Row>)}</Table.Body>
        </Table>
      </div>}
    <Modal open={selected !== null} onClose={() => { if (!pending) setSelected(null); }}
      header={{ heading: "Fjern fra ventelisten" }}>
      <Modal.Body>
        <p>Vil du fjerne {selected?.name} fra ventelisten? Hvis personen melder seg på ventelisten igjen, havner hen bakerst.</p>
        {error && <LocalAlert status="error" role="alert"><LocalAlert.Content>{error}</LocalAlert.Content></LocalAlert>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" data-color="danger" loading={pending} onClick={remove}>Ja, fjern</Button>
        <Button variant="secondary" disabled={pending} onClick={() => setSelected(null)}>Avbryt</Button>
      </Modal.Footer>
    </Modal>
  </section>;
}

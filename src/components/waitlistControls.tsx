"use client";

import { useState, useTransition } from "react";
import { Button, Checkbox, LocalAlert, Modal } from "@navikt/ds-react";
import { changeWaitlist } from "@/service/waitlistActions";
import { getEventRegistrationState } from "@/service/eventInteractiveReads";
import type { WaitlistState } from "@/types/event";

type RegistrationState = Awaited<ReturnType<typeof getEventRegistrationState>>;

export default function WaitlistControls({ eventId, state, onUpdated }: {
  eventId: string;
  state: WaitlistState;
  onUpdated: (state: RegistrationState) => void;
}) {
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const queued = state.position !== null;

  const submit = () => startTransition(async () => {
    const result = await changeWaitlist(eventId, queued);
    if (!result.ok) {
      setFailed(true);
      setMessage(result.message);
      return;
    }
    onUpdated(result.data);
    setOpen(false);
    setConsent(false);
    setFailed(false);
    setMessage(queued ? "Du er fjernet fra ventelisten." : "Du står nå på ventelisten.");
  });

  return <div className="flex flex-col gap-2">
    <div role="status">
      {queued
        ? `Du er nummer ${state.position} på ventelisten. ${state.open ? "Du blir automatisk påmeldt hvis du får plass." : "Fristen er utløpt. Du blir ikke automatisk påmeldt."}`
        : `${state.count} på ventelisten`}
    </div>
    {(queued || state.open) && <Button variant="secondary" onClick={() => setOpen(true)}>
      {queued ? "Forlat ventelisten" : "Sett meg på venteliste"}
    </Button>}
    {message && <LocalAlert status={failed ? "error" : "success"} size="small" role={failed ? "alert" : "status"}>
      <LocalAlert.Content>{message}</LocalAlert.Content>
    </LocalAlert>}
    <Modal open={open} onClose={() => { if (!pending) setOpen(false); }}
      header={{ heading: queued ? "Forlat ventelisten" : "Sett deg på venteliste" }}>
      <Modal.Body>
        {failed && message && <LocalAlert status="error" role="alert">
          <LocalAlert.Content>{message}</LocalAlert.Content>
        </LocalAlert>}
        {failed && <Button variant="secondary" onClick={() => window.location.reload()}>Oppdater siden</Button>}
        {queued ? <p>Hvis du melder deg på ventelisten igjen, havner du bakerst i køen.</p>
          : <Checkbox checked={consent} onChange={(event) => setConsent(event.target.checked)}>
            Jeg godtar at Delta lagrer navnet og e-postadressen min og melder meg på automatisk hvis jeg får plass før påmeldingsfristen, eller før start hvis ingen frist er satt.
            Jeg får beskjed på e-post når jeg får plass.
          </Checkbox>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" loading={pending} disabled={!queued && !consent} onClick={submit}>
          {queued ? "Ja, forlat ventelisten" : "Godta og sett meg på venteliste"}
        </Button>
        <Button variant="secondary" disabled={pending} onClick={() => setOpen(false)}>Avbryt</Button>
      </Modal.Footer>
    </Modal>
  </div>;
}

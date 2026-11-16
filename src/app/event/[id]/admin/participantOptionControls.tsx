"use client";

import { useState, useTransition } from "react";
import { BodyLong, Button, LocalAlert, Modal, Radio, RadioGroup, Select, VStack } from "@navikt/ds-react";
import { changeParticipantChecked } from "@/service/eventActions";
import type { SignupOption } from "@/types/event";
import { optionCapacityText } from "@/service/signupOptions";

/** Lets an organizer move a participant to another signup option. The backend refuses full options. */
export function ParticipantOptionSelect({ eventId, name, email, options, currentOptionId }: {
  eventId: string;
  name: string;
  email: string;
  options: SignupOption[];
  currentOptionId?: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Select
      size="small"
      label={`Hvordan ${name} deltar`}
      hideLabel
      value={currentOptionId ?? ""}
      readOnly={pending}
      error={error}
      onChange={(e) => {
        const signupOptionId = e.target.value;
        if (!signupOptionId) return;
        startTransition(async () => {
          const result = await changeParticipantChecked(eventId, { email, type: "PARTICIPANT", signupOptionId });
          if (result.ok) window.location.reload();
          else setError(result.message);
        });
      }}
    >
      {!currentOptionId && <option value="">Velg alternativ</option>}
      {options.map((option) => (
        <option key={option.id} value={option.id}>{option.label}</option>
      ))}
    </Select>
  );
}

/** "Fjern arrangør" on an event with signup options: the former host must be placed in an option. */
export function DemoteHostButton({ eventId, name, email, options, onDone }: {
  eventId: string;
  name: string;
  email: string;
  options: SignupOption[];
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [optionId, setOptionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const confirm = () => {
    if (!optionId) {
      setError("Velg hvordan personen skal delta");
      return;
    }
    startTransition(async () => {
      const result = await changeParticipantChecked(eventId, { email, type: "PARTICIPANT", signupOptionId: optionId });
      if (result.ok) {
        setOpen(false);
        onDone();
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <>
      <Button data-color="danger" size="small" onClick={() => { setError(null); setOpen(true); }}>
        Fjern arrangør
      </Button>
      <Modal
        open={open}
        onClose={() => { if (!pending) setOpen(false); }}
        header={{ heading: `Fjern ${name} som arrangør` }}
        width="small"
      >
        <Modal.Body>
          <VStack gap="space-16">
            <BodyLong>{name} blir deltaker og tar en plass i alternativet du velger.</BodyLong>
            <RadioGroup
              legend="Hvordan skal personen delta?"
              value={optionId}
              onChange={(value: string) => { setOptionId(value); setError(null); }}
              error={error && !optionId ? error : undefined}
            >
              {options.map((option) => (
                <Radio key={option.id} value={option.id} description={optionCapacityText(option)}>
                  {option.label}
                </Radio>
              ))}
            </RadioGroup>
            {error && optionId && (
              <LocalAlert status="error" role="alert"><LocalAlert.Content>{error}</LocalAlert.Content></LocalAlert>
            )}
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button data-color="danger" loading={pending} onClick={confirm}>Fjern som arrangør</Button>
          <Button variant="secondary" disabled={pending} onClick={() => setOpen(false)}>Avbryt</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

"use client";

import { useState, useTransition, type ReactNode } from "react";
import { BodyLong, Button, Checkbox, HStack, InlineMessage, LocalAlert, Modal, Radio, RadioGroup } from "@navikt/ds-react";
import { changeEventRegistration, changeWaitlist, switchSignupOption } from "@/service/waitlistActions";
import type { getEventRegistrationState } from "@/service/eventInteractiveReads";
import {
  isOptionFull,
  optionAvailabilityText,
  optionById,
  requiresWaitlist,
} from "@/service/signupOptions";
import type { SignupOption, WaitlistState } from "@/types/event";

type RegistrationState = Awaited<ReturnType<typeof getEventRegistrationState>>;
export type SignupOptionOutcome = "registered" | "queued" | "switched";

function OptionChoices({ options, value, onChange, error, legend, currentOptionId, reservedOptionId }: {
  options: SignupOption[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
  legend: string;
  currentOptionId?: string | null;
  reservedOptionId?: string | null;
}) {
  return (
    <RadioGroup legend={legend} value={value} onChange={onChange} error={error}>
      {options.map((option) => (
        <Radio key={option.id} value={option.id} description={
          option.id === currentOptionId ? "Du deltar slik nå"
            : option.id === reservedOptionId ? "Du er invitert til å delta slik, og har en reservert plass"
              : optionAvailabilityText(option)
        }>
          {option.label}
        </Radio>
      ))}
    </RadioGroup>
  );
}

/** "Bli med" for events with signup options: choose an option, then register or join its wait list. */
export function SignupOptionJoin({ eventId, options, reservedOptionId, waitlistOpen, disabled, onDone }: {
  eventId: string;
  options: SignupOption[];
  /** The option of the caller's open invitation, which keeps a place even when the option is full. */
  reservedOptionId?: string | null;
  waitlistOpen: boolean;
  disabled?: boolean;
  onDone: (state: RegistrationState | null, outcome: SignupOptionOutcome) => void;
}) {
  const initial = reservedOptionId ?? (options.length === 1 ? options[0].id : "");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(initial);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const option = optionById(options, selected);
  const reserved = !!option && option.id === reservedOptionId;
  const viaWaitlist = !!option && !reserved && requiresWaitlist(option);
  const full = !!option && !reserved && !viaWaitlist && isOptionFull(option);
  const choiceError = full ? "Dette alternativet er fullt. Velg et annet."
    : viaWaitlist && !waitlistOpen ? "Ventelisten for dette alternativet er stengt."
      : undefined;

  const close = () => {
    if (pending) return;
    setOpen(false);
    setError("");
    setConsent(false);
  };

  const submit = () => startTransition(async () => {
    if (!option) {
      setError("Velg hvordan du vil delta.");
      return;
    }
    const result = viaWaitlist
      ? await changeWaitlist(eventId, false, option.id)
      : await changeEventRegistration(eventId, false, option.id);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setOpen(false);
    setError("");
    setConsent(false);
    onDone(result.refreshRequired ? null : result.data, viaWaitlist ? "queued" : "registered");
  });

  return <>
    <Button data-umami-event="påmeldingmodal åpnet" variant="primary" disabled={disabled}
      onClick={() => { setSelected(initial); setOpen(true); }}>
      Bli med
    </Button>
    <Modal open={open} onClose={close} header={{ heading: "Bli med" }}>
      <Modal.Body>
        <OptionChoices legend="Hvordan vil du delta?" options={options} value={selected}
          reservedOptionId={reservedOptionId} error={choiceError}
          onChange={(id) => { setSelected(id); setConsent(false); setError(""); }} />
        {error && <LocalAlert status="error" role="alert" className="mt-4">
          <LocalAlert.Content>{error}</LocalAlert.Content>
        </LocalAlert>}
        {viaWaitlist
          ? <Checkbox className="mt-4" checked={consent} onChange={(event) => setConsent(event.target.checked)}>
            Jeg godtar at Delta lagrer navnet og e-postadressen min og melder meg på automatisk hvis jeg får plass før påmeldingsfristen, eller før start hvis ingen frist er satt.
            Jeg får beskjed på e-post når jeg får plass.
          </Checkbox>
          : <BodyLong className="mt-4">
            Ved å melde deg på arrangementet, godtar du at Delta lagrer ditt navn og din e-postadresse.
          </BodyLong>}
      </Modal.Body>
      <Modal.Footer>
        <Button data-umami-event={viaWaitlist ? "venteliste" : "påmelding"} variant="primary" loading={pending}
          disabled={!!choiceError || (viaWaitlist && !consent)} onClick={submit}>
          {viaWaitlist ? "Godta og sett meg på venteliste" : "Godta og bli med"}
        </Button>
        <Button data-umami-event="avbryter påmelding" variant="secondary" disabled={pending} onClick={close}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  </>;
}

/** Lets a registered participant move to another option before the signup deadline. */
export function SignupOptionSwitch({ eventId, options, currentOptionId, onDone }: {
  eventId: string;
  options: SignupOption[];
  currentOptionId?: string | null;
  onDone: (state: RegistrationState | null, outcome: SignupOptionOutcome) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentOptionId ?? "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const option = optionById(options, selected);
  const unchanged = !option || option.id === currentOptionId;
  const choiceError = !unchanged && isOptionFull(option)
    ? "Dette alternativet er fullt. Du beholder plassen du har." : undefined;

  const close = () => {
    if (pending) return;
    setOpen(false);
    setError("");
  };

  const submit = () => startTransition(async () => {
    if (!option) return;
    const result = await switchSignupOption(eventId, option.id);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setOpen(false);
    setError("");
    onDone(result.refreshRequired ? null : result.data, "switched");
  });

  return <>
    <Button data-umami-event="bytt deltakelse åpnet" variant="secondary"
      onClick={() => { setSelected(currentOptionId ?? ""); setOpen(true); }}>
      Bytt hvordan du deltar
    </Button>
    <Modal open={open} onClose={close} header={{ heading: "Bytt hvordan du deltar" }}>
      <Modal.Body>
        <OptionChoices legend="Hvordan vil du delta?" options={options} value={selected}
          currentOptionId={currentOptionId} error={choiceError}
          onChange={(id) => { setSelected(id); setError(""); }} />
        {error && <LocalAlert status="error" role="alert" className="mt-4">
          <LocalAlert.Content>{error}</LocalAlert.Content>
        </LocalAlert>}
      </Modal.Body>
      <Modal.Footer>
        <Button data-umami-event="bytt deltakelse" variant="primary" loading={pending}
          disabled={unchanged || !!choiceError} onClick={submit}>
          Bytt
        </Button>
        <Button variant="secondary" disabled={pending} onClick={close}>Avbryt</Button>
      </Modal.Footer>
    </Modal>
  </>;
}

/**
 * Hero actions and notice for a non-host on an open event with signup options. Ended events, expired
 * deadlines for non-participants and queued callers are handled by the caller's shared flow.
 */
export function signupOptionRegistration({
  eventId, options, isParticipant, myOptionId, signupDeadline, reservedOptionId, waitlist,
  disabled, leaveButton, interestButton, onDone,
}: {
  eventId: string;
  options: SignupOption[];
  isParticipant: boolean;
  myOptionId?: string | null;
  signupDeadline?: string;
  /** Option of the caller's active invitation reservation, if any. */
  reservedOptionId?: string | null;
  waitlist?: WaitlistState;
  disabled?: boolean;
  leaveButton: ReactNode;
  interestButton: ReactNode;
  onDone: (state: RegistrationState | null, outcome: SignupOptionOutcome) => void;
}): { actions?: ReactNode; notice?: ReactNode } {
  const deadlineOpen = !signupDeadline || new Date(signupDeadline) > new Date();
  if (isParticipant) {
    const current = optionById(options, myOptionId);
    return {
      notice: current && <InlineMessage status="info">Du deltar: {current.label}</InlineMessage>,
      actions: (
        <HStack gap="space-8" wrap>
          {deadlineOpen && options.length > 1 && (
            <SignupOptionSwitch eventId={eventId} options={options} currentOptionId={myOptionId} onDone={onDone} />
          )}
          {leaveButton}
        </HStack>
      ),
    };
  }
  const waitlistOpen = waitlist?.open ?? deadlineOpen;
  const joinable = options.some((option) =>
    option.id === reservedOptionId || !isOptionFull(option) || (option.waitlistEnabled && waitlistOpen));
  if (!joinable) {
    return { notice: <InlineMessage status="warning">Arrangementet er fullt</InlineMessage>, actions: interestButton };
  }
  return {
    actions: <SignupOptionJoin eventId={eventId} options={options} reservedOptionId={reservedOptionId}
      waitlistOpen={waitlistOpen} disabled={disabled} onDone={onDone} />,
  };
}

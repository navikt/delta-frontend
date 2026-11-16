"use client";

import { BodyShort, Button, Heading, LocalAlert, Select, Tag } from "@navikt/ds-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PersonPicker from "@/components/personPicker";
import { invitePeople, revokeInvitation } from "@/service/eventActions";
import { DirectoryPerson, FullDeltaEvent, InvitationStatus } from "@/types/event";
import { optionAvailabilityText, optionById } from "@/service/signupOptions";

type InvitationManagerProps = {
  event: FullDeltaEvent;
  peopleSearchEnabled: boolean;
};

const statusLabels: Record<InvitationStatus, string> = {
  INVITED: "Venter på svar",
  REGISTERED: "Påmeldt",
  DECLINED: "Har takket nei",
  FORWARDED: "Via videresending",
};

const statusColors: Record<InvitationStatus, "neutral" | "success" | "warning" | "info"> = {
  INVITED: "neutral",
  REGISTERED: "success",
  DECLINED: "warning",
  FORWARDED: "info",
};

export default function InvitationManager({
  event: initialEvent,
  peopleSearchEnabled,
}: InvitationManagerProps) {
  const router = useRouter();
  const [event, setEvent] = useState(initialEvent);
  const [selectedPeople, setSelectedPeople] = useState<DirectoryPerson[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [optionId, setOptionId] = useState("");
  const [optionError, setOptionError] = useState<string | null>(null);

  if (event.event.inviteMode !== "SHARED" || event.recurringSeries) return null;

  const invitations = event.invited ?? [];
  const options = event.event.signupOptions ?? [];
  const selectedOption = optionById(options, optionId);
  const excludedEmails = [
    ...event.participants.map((person) => person.email),
    ...event.hosts.map((person) => person.email),
    ...invitations.map((person) => person.email),
  ];

  return (
    <section className="flex flex-col gap-4">
      <div>
        <Heading level="2" size="medium">Inviterte</Heading>
        <BodyShort size="small">
          Invitasjoner reserverer plass fram til påmeldingsfristen. Inviterte får en Outlook-invitasjon fra ikkesvar.delta@nav.no.
        </BodyShort>
      </div>
      {invitations.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {invitations.map((invitation) => (
            <li
              key={invitation.email}
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <span>
                <strong>{invitation.name}</strong>{" "}
                <span className="text-ax-text-neutral-subtle">({invitation.email})</span>
              </span>
              <div className="flex items-center gap-2">
                {optionById(options, invitation.signupOptionId) && (
                  <Tag variant="outline" data-color="neutral" size="small">
                    {optionById(options, invitation.signupOptionId)?.label}
                  </Tag>
                )}
                <Tag
                  variant="moderate"
                  data-color={statusColors[invitation.status]}
                  size="small"
                >
                  {statusLabels[invitation.status]}
                </Tag>
                {invitation.status !== "REGISTERED" && (
                  <Button
                    type="button"
                    size="small"
                    variant="tertiary"
                    data-color="danger"
                    onClick={async () => {
                      setActionError(null);
                      const result = await revokeInvitation(event.event.id, invitation.email);
                      if (result.ok) {
                        setEvent(result.data);
                        router.refresh();
                      } else {
                        setActionError(result.message);
                      }
                    }}
                  >
                    Trekk tilbake
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <BodyShort>Ingen inviterte ennå.</BodyShort>
      )}
      {peopleSearchEnabled ? (
        <>
          <PersonPicker
            selectedPeople={selectedPeople}
            onChange={setSelectedPeople}
            excludedEmails={excludedEmails}
          />
          {options.length > 0 && (
            <Select
              label="De inviterte deltar som"
              value={selectedOption ? optionId : ""}
              onChange={(e) => { setOptionId(e.target.value); setOptionError(null); }}
              error={optionError}
              className="max-w-[21rem]"
            >
              <option value="">Velg alternativ</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} ({optionAvailabilityText(option)})
                </option>
              ))}
            </Select>
          )}
          <Button
            type="button"
            className="w-fit"
            disabled={!selectedPeople.length || saving}
            loading={saving}
            onClick={async () => {
              if (options.length && !selectedOption) {
                setOptionError("Velg hvordan de inviterte skal delta");
                return;
              }
              setSaving(true);
              setActionError(null);
              const result = await invitePeople(
                event.event.id,
                selectedPeople.map(({ email }) => ({
                  email,
                  ...(selectedOption ? { signupOptionId: selectedOption.id } : {}),
                })),
              );
              if (result.ok) {
                setEvent(result.data);
                setSelectedPeople([]);
                router.refresh();
              } else {
                setActionError(result.message);
              }
              setSaving(false);
            }}
          >
            Send invitasjon
          </Button>
        </>
      ) : (
        <BodyShort>Personsøk er ikke tilgjengelig for deg nå.</BodyShort>
      )}
      {actionError && <LocalAlert status="error" role="alert"><LocalAlert.Content>{actionError}</LocalAlert.Content></LocalAlert>}
    </section>
  );
}

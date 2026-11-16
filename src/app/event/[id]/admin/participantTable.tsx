import { changeParticipant, deleteParticipant } from "@/service/eventActions";
import { DeltaEvent, DeltaParticipant } from "@/types/event";
import { User } from "@/types/user";
import {
  BodyLong,
  Button,
  Link,
  Modal,
  Table,
} from "@navikt/ds-react";
import { useState } from "react";
import type { SignupOption } from "@/types/event";
import { DemoteHostButton, ParticipantOptionSelect } from "./participantOptionControls";

function displayName(name: string) {
  return name.split(", ").reverse().join(" ");
}

function OptionCell({ eventId, name, email, isHost, options, currentOptionId }: {
  eventId: string;
  name: string;
  email: string;
  isHost: boolean;
  options: SignupOption[];
  currentOptionId?: string | null;
}) {
  if (isHost) return <span className="text-ax-text-neutral-subtle">Arrangør</span>;
  return <ParticipantOptionSelect eventId={eventId} name={name} email={email}
    options={options} currentOptionId={currentOptionId} />;
}

type ParticipantTableProps = {
  event: DeltaEvent;
  participants: DeltaParticipant[];
  hosts: DeltaParticipant[];
  user: User;
  searchInput: string;
};

export default function ParticipantTable({
  event,
  participants,
  hosts,
  user,
  searchInput,
}: ParticipantTableProps) {
  return (
      <div className="flex flex-col gap-5 rounded pb-2">
        <div className="hidden ax-md:block">
        <Table size="small" zebraStripes>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
              <Table.HeaderCell scope="col">E-post</Table.HeaderCell>
              {!!event.signupOptions?.length && <Table.HeaderCell scope="col">Deltar som</Table.HeaderCell>}
              <Table.HeaderCell scope="col" aria-label="Deltaker-handlinger" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <FullTable
              hosts={hosts}
              participants={participants}
              user={user}
              event={event}
              searchInput={searchInput}
            />
          </Table.Body>
        </Table>
        </div>
        <div className="ax-md:hidden">
          <Table size="small" zebraStripes>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope="col" />
                <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                <Table.HeaderCell scope="col">E-post</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <ExpandedTable
                hosts={hosts}
                participants={participants}
                user={user}
                event={event}
                searchInput={searchInput}
              />
            </Table.Body>
          </Table>
        </div>
        {!participants.length && (
          <p className="w-full italic  mt-4 mb-5">Ingen deltakere ennå — husk å markedsføre arrangementet!</p>
        )}
      </div>
  );
}

function ExpandedTable({
  hosts,
  participants,
  user,
  event,
  searchInput,
}: ParticipantTableProps) {
  const [openConfirmationFor, setOpenConfirmationFor] = useState<string | null>(
    null,
  );
  const toggleConfirmation = (email: string) => {
    setOpenConfirmationFor((currentEmail) =>
      currentEmail === email ? null : email,
    );
  };

  const data = hosts.concat(participants);
  const options = event.signupOptions ?? [];
  const afterDemote = (email: string) => {
    if (email === user.email) window.location.href = `/event/${event.id}`;
    else window.location.reload();
  };

  // Filter the data based on the searchInput
  const filteredData = data.filter(({ name, email }) => {
    const searchValue = searchInput.toLowerCase();
    return (
        name.toLowerCase().includes(searchValue) ||
        email.toLowerCase().includes(searchValue)
    );
  });

  return filteredData.map(({ name, email, signupOptionId }) => {
    return (
      <Table.ExpandableRow
        key={email}
        content={
          <div className="flex flex-wrap gap-2 items-start">
            {options.length > 0 && (
              <OptionCell eventId={event.id} name={displayName(name)} email={email}
                isHost={hosts.some((host) => host.email === email)} options={options} currentOptionId={signupOptionId} />
            )}
            {email === user.email && hosts.length === 1 ? (
              <></>
            ) : hosts.some((host) => host.email === email) ? (
              options.length ? (
                <DemoteHostButton
                  eventId={event.id}
                  name={displayName(name)}
                  email={email}
                  options={options}
                  onDone={() => afterDemote(email)}
                />
              ) : (
              <Button
                data-color="danger"
                size="small"
                onClick={async () => {
                  await changeParticipant(event.id, {
                    email,
                    type: "PARTICIPANT",
                  });
                  afterDemote(email);
                }}
              >
                Fjern arrangør
              </Button>
              )
            ) : (
              <>
                <Button
                  variant="primary"
                  size="small"
                  onClick={async () => {
                    await changeParticipant(event.id, {
                      email,
                      type: "HOST",
                    });
                    window.location.reload();
                  }}
                >
                  Gjør til med-arrangør
                </Button>
                <Button
                  data-color="danger"
                  size="small"
                  onClick={() => toggleConfirmation(email)}
                >
                  Meld av
                </Button>
              </>
            )}
          </div>
        }
      >
        <Table.HeaderCell className="font-normal" scope="row">
          {name.split(", ").reverse().join(" ")}
        </Table.HeaderCell>
        <Table.DataCell>
          <Link href={`mailto:${email} `} className="break-all">
            {email}
          </Link>
        </Table.DataCell>
        <Modal
          open={openConfirmationFor === email}
          onClose={() => toggleConfirmation(email)}
          header={{ heading: `Meld av ${name} fra ${event?.title}?` }}
        >
          <Modal.Body>
            <BodyLong spacing>
              Er du sikker på at du vil melde {name} av arrangementet? Husk å si
              ifra til vedkommende, for de varsles ikke når du melder de av her.
            </BodyLong>
          </Modal.Body>
          <Modal.Footer>
              <Button variant="secondary" onClick={() => toggleConfirmation(email)}>
                Avbryt
              </Button>
              <Button
                data-color="danger"
                className="w-fit h-fit font-ax-bold"
                onClick={async () => {
                  await removeUser(event.id, email);
                  toggleConfirmation(email);
                  window.location.reload();
                }}
              >
                Ja, jeg er sikker
              </Button>
          </Modal.Footer>
        </Modal>
      </Table.ExpandableRow>
    );
  });
}

function FullTable({
  hosts,
  participants,
  user,
  event,
  searchInput,
}: ParticipantTableProps) {
  const [openConfirmationFor, setOpenConfirmationFor] = useState<string | null>(
    null,
  );
  const toggleConfirmation = (email: string) => {
    setOpenConfirmationFor((currentEmail) =>
      currentEmail === email ? null : email,
    );
  };

  const data = hosts.concat(participants);
  const options = event.signupOptions ?? [];
  const afterDemote = (email: string) => {
    if (email === user.email) window.location.href = `/event/${event.id}`;
    else window.location.reload();
  };

  // Filter the data based on the searchInput
  const filteredData = data.filter(({ name, email }) => {
    const searchValue = searchInput.toLowerCase();
    return (
        name.toLowerCase().includes(searchValue) ||
        email.toLowerCase().includes(searchValue)
    );
  });

  return filteredData.map(({ name, email, signupOptionId }) => {
    return (
      <Table.Row key={email}>
        <Table.HeaderCell className="font-normal" scope="row">
          {name.split(", ").reverse().join(" ")}
        </Table.HeaderCell>
        <Table.DataCell>
          <Link href={`mailto:${email}`}>{email}</Link>
        </Table.DataCell>
        {options.length > 0 && (
          <Table.DataCell>
            <OptionCell eventId={event.id} name={displayName(name)} email={email}
              isHost={hosts.some((host) => host.email === email)} options={options} currentOptionId={signupOptionId} />
          </Table.DataCell>
        )}
        <Table.DataCell>
          <div className="flex justify-end gap-2">
            {email === user.email && hosts.length === 1 ? (
              <></>
            ) : hosts.some((host) => host.email === email) ? (
              options.length ? (
                <DemoteHostButton
                  eventId={event.id}
                  name={displayName(name)}
                  email={email}
                  options={options}
                  onDone={() => afterDemote(email)}
                />
              ) : (
              <Button
                data-color="danger"
                size="small"
                onClick={async () => {
                  await changeParticipant(event.id, {
                    email,
                    type: "PARTICIPANT",
                  });
                  afterDemote(email);
                }}
              >
                Fjern arrangør
              </Button>
              )
            ) : (
              <>
                <Button
                  variant="primary"
                  size="small"
                  onClick={async () => {
                    await changeParticipant(event.id, {
                      email,
                      type: "HOST",
                    });
                    window.location.reload();
                  }}
                >
                  Gjør til arrangør
                </Button>
                <Button
                  data-color="danger"
                  size="small"
                  onClick={() => toggleConfirmation(email)}
                >
                  Meld av
                </Button>
              </>
            )}
          </div>
        </Table.DataCell>
        <Modal
          open={openConfirmationFor === email}
          onClose={() => toggleConfirmation(email)}
          header={{ heading: `Meld av ${name} fra ${event?.title}?` }}
        >
          <Modal.Body>
            <BodyLong spacing>
              Er du sikker på at du vil melde {name} av arrangementet? Husk å si
              ifra til vedkommende, for de varsles ikke når du melder de av her.
            </BodyLong>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => toggleConfirmation(email)}>
                Avbryt
              </Button>
              <Button
                data-color="danger"
                className="w-fit h-fit font-ax-bold"
                onClick={async () => {
                  await removeUser(event.id, email);
                  toggleConfirmation(email);
                  window.location.reload();
                }}
              >
                Ja, jeg er sikker
              </Button>
          </Modal.Footer>
        </Modal>
      </Table.Row>
    );
  });
}

async function removeUser(eventId: string, userEmail: string) {
  await deleteParticipant(eventId, userEmail);
}

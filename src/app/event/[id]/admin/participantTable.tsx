import { changeParticipant, deleteParticipant } from "@/service/eventActions";
import { DeltaEvent, DeltaParticipant } from "@/types/event";
import { User } from "@/types/user";
import {
  BodyLong,
  Button,
  Heading,
  Link,
  Modal,
  Table,
} from "@navikt/ds-react";
import { useEffect, useState } from "react";

type ParticipantTableProps = {
  event: DeltaEvent;
  participants: DeltaParticipant[];
  hosts: DeltaParticipant[];
  user: User;
};

export default function ParticipantTable({
  event,
  participants,
  hosts,
  user,
}: ParticipantTableProps) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex flex-col gap-5 bg-bg-subtle rounded p-2">
      <Table size="small" className="">
        <Table.Header>
          <Table.Row>
            {isMobile && <Table.HeaderCell scope="col" />}
            <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
            <Table.HeaderCell scope="col">E-post</Table.HeaderCell>
            {!isMobile && (
              <Table.HeaderCell scope="col" aria-label="Deltaker-handlinger" />
            )}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isMobile ? (
            <ExpandedTable
              hosts={hosts}
              participants={participants}
              user={user}
              event={event}
            />
          ) : (
            <FullTable
              hosts={hosts}
              participants={participants}
              user={user}
              event={event}
            />
          )}
        </Table.Body>
      </Table>
      {!participants.length && (
        <p className="w-full italic ml-3 mt-4 mb-5">Ingen deltakere ennå — husk å markedsføre arrangementet!</p>
      )}
    </div>
  );
}

function ExpandedTable({
  hosts,
  participants,
  user,
  event,
}: ParticipantTableProps) {
  const [openConfirmations, setOpenConfirmations] = useState<boolean[]>(
    participants.map(() => false),
  );
  const toggleConfirmation = (index: number) => {
    const newConfirmations = [...openConfirmations];
    newConfirmations[index] = !newConfirmations[index];
    setOpenConfirmations(newConfirmations);
  };

  const data = hosts.concat(participants);

  return data.map(({ name, email }, i) => {
    return (
      <Table.ExpandableRow
        key={i}
        content={
          <div className="flex gap-2">
            {email === user.email && hosts.length === 1 ? (
              <></>
            ) : hosts.some((host) => host.email === email) ? (
              <Button
                variant="danger"
                size="small"
                onClick={async () => {
                  await changeParticipant(event.id, {
                    email,
                    type: "PARTICIPANT",
                  });
                  email == user.email
                    ? (window.location.href = `/event/${event.id}`)
                    : window.location.reload();
                }}
              >
                Fjern arrangør
              </Button>
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
                  variant="danger"
                  size="small"
                  onClick={() => toggleConfirmation(i)}
                >
                  Meld av
                </Button>
              </>
            )}
          </div>
        }
      >
        <Table.HeaderCell className="font-normal" scope="row">
          {name}
        </Table.HeaderCell>
        <Table.DataCell>
          <Link href={`mailto:${email} `} className="break-all">
            {email}
          </Link>
        </Table.DataCell>
        <Modal
          open={openConfirmations[i]}
          aria-label={`Fjern deltaker ${name} fra arrangementet`}
          aria-labelledby="Fjern deltaker modal"
        >
          <Modal.Body>
            <Heading spacing level="1" size="large" id="modal-heading">
              {`Meld av ${name} fra ${event?.title}?`}
            </Heading>
            <BodyLong spacing>
              Er du sikker på at du vil melde {name} av arrangementet? Husk å si
              ifra til vedkommende, for de varsles ikke når du melder de av her.
            </BodyLong>
          </Modal.Body>
          <Modal.Footer>
              <Button variant="secondary" onClick={() => toggleConfirmation(i)}>
                Avbryt
              </Button>
              <Button
                variant="danger"
                className="w-fit h-fit font-bold"
                onClick={async () => {
                  await removeUser(event.id, email);
                  toggleConfirmation(i);
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
}: ParticipantTableProps) {
  const [openConfirmations, setOpenConfirmations] = useState<boolean[]>(
    participants.map(() => false),
  );
  const toggleConfirmation = (index: number) => {
    const newConfirmations = [...openConfirmations];
    newConfirmations[index] = !newConfirmations[index];
    setOpenConfirmations(newConfirmations);
  };

  const data = hosts.concat(participants);

  return data.map(({ name, email }, i) => {
    return (
      <Table.Row key={i}>
        <Table.HeaderCell className="font-normal" scope="row">
          {name}
        </Table.HeaderCell>
        <Table.DataCell>
          <Link href={`mailto:${email}`}>{email}</Link>
        </Table.DataCell>
        <Table.DataCell>
          <div className="flex justify-end gap-2">
            {email === user.email && hosts.length === 1 ? (
              <></>
            ) : hosts.some((host) => host.email === email) ? (
              <Button
                variant="danger"
                size="small"
                onClick={async () => {
                  await changeParticipant(event.id, {
                    email,
                    type: "PARTICIPANT",
                  });
                  email == user.email
                    ? (window.location.href = `/event/${event.id}`)
                    : window.location.reload();
                }}
              >
                Fjern arrangør
              </Button>
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
                  variant="danger"
                  size="small"
                  onClick={() => toggleConfirmation(i)}
                >
                  Meld av
                </Button>
              </>
            )}
          </div>
        </Table.DataCell>
        <Modal
          open={openConfirmations[i]}
          aria-label={`Fjern deltaker ${name} fra arrangementet`}
          aria-labelledby="Fjern deltaker modal"
        >
          <Modal.Body>
            <Heading spacing level="1" size="large" id="modal-heading">
              {`Meld av ${name} fra ${event?.title}?`}
            </Heading>
            <BodyLong spacing>
              Er du sikker på at du vil melde {name} av arrangementet? Husk å si
              ifra til vedkommende, for de varsles ikke når du melder de av her.
            </BodyLong>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => toggleConfirmation(i)}>
                Avbryt
              </Button>
              <Button
                variant="danger"
                className="w-fit h-fit font-bold"
                onClick={async () => {
                  await removeUser(event.id, email);
                  toggleConfirmation(i);
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

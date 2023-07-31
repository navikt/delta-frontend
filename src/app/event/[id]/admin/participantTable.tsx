import { changeParticipant, deleteParticipant } from "@/service/eventActions";
import { DeltaEvent, DeltaParticipant } from "@/types/event";
import { User } from "@/types/user";
import { BodyLong, Button, Heading, Modal, Table } from "@navikt/ds-react";
import { useState } from "react";

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
  const [openConfirmations, setOpenConfirmations] = useState<boolean[]>(
    participants.map(() => false),
  );

  const toggleConfirmation = (index: number) => {
    const newConfirmations = [...openConfirmations];
    newConfirmations[index] = !newConfirmations[index];
    setOpenConfirmations(newConfirmations);
  };

  const data = hosts.concat(participants);
  return (
    <div className="flex flex-col gap-5 bg-bg-subtle rounded p-2">
      <Table size="small">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
            <Table.HeaderCell scope="col">Epost</Table.HeaderCell>
            <Table.HeaderCell scope="col" aria-label="Deltaker handlinger" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map(({ name, email }, i) => {
            return (
              <Table.Row key={i}>
                <Table.HeaderCell className="font-normal" scope="row">
                  {name}
                </Table.HeaderCell>
                <Table.DataCell>{email}</Table.DataCell>
                <Table.DataCell>
                  <div className="flex justify-end gap-2">
                    {email === user.email && hosts.length === 1 ? (
                      <></>
                    ) : hosts.some((host) => host.email === email) ? (
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() =>
                          changeParticipant(event.id, {
                            email,
                            type: "PARTICIPANT",
                          })
                        }
                      >
                        Fjern arrangør
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() =>
                            changeParticipant(event.id, { email, type: "HOST" })
                          }
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
                  onClose={() => toggleConfirmation(i)}
                  closeButton={false}
                  aria-labelledby="Fjern deltaker modal"
                  className="w-4/5 max-w-[30rem] max-h-[50rem]"
                >
                  <Modal.Content>
                    <Heading spacing level="1" size="large" id="modal-heading">
                      {`Meld av ${name} fra ${event?.title}?`}
                    </Heading>
                    <BodyLong spacing>
                      Er du sikker på at du vil melde {name} av arrangementet?
                      Husk å si ifra til vedkommende, for de varsles ikke når du
                      melder de av her.
                    </BodyLong>
                    <div className="flex flex-row justify-end gap-4">
                      <Button
                        variant="secondary"
                        onClick={() => toggleConfirmation(i)}
                      >
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
                    </div>
                  </Modal.Content>
                </Modal>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      {!participants.length && (
        <p className="text-center w-full italic">Ingen deltakere</p>
      )}
    </div>
  );
}

async function removeUser(eventId: string, userEmail: string) {
  await deleteParticipant(eventId, userEmail);
}

"use client";
import {FullDeltaEvent} from "@/types/event";
import {BodyLong, Button, Heading, Modal, Search} from "@navikt/ds-react";
import ParticipantTable from "./participantTable";
import ExportParticipants from "../exportParticipants";
import Link from "next/link";
import {deleteEvent} from "@/service/eventActions";
import {useEffect, useState} from "react";
import {CalendarIcon, ClockIcon, LocationPinIcon, TrashIcon} from "@navikt/aksel-icons";
import {User} from "@/types/user";
import {formatEventDates, formatEventDuration} from "@/service/format";
import InvitationManager from "./invitationManager";

type ParticipantPageProps = {
    fullEvent: FullDeltaEvent;
    user: User;
    peopleSearchEnabled?: boolean;
};

export default function ParticipantPage({
                                      fullEvent: eventWithParticipants,
                                      user,
                                      peopleSearchEnabled = false,
                                  }: ParticipantPageProps) {
    const [openConfirmation, setOpenConfirmation] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const {event, participants, hosts}: FullDeltaEvent = eventWithParticipants;

    return (
        <div className="flex flex-col gap-10">
      <span className="w-full flex flex-row justify-end">
        <span className="flex w-full ax-md:w-fit flex-col ax-md:flex-row gap-4">
  {/*        <Button
              as={Link}
              href={`/event/${event.id}/edit`}
              className="w-full h-fit whitespace-nowrap"
          >
            Rediger arrangement
          </Button>
          <Button
              as={Link}
              href={`/event/new?template=${event.id}`}
              variant="secondary"
              data-color="neutral"
              className="w-full h-fit whitespace-nowrap"
          >
            Bruk som mal
          </Button>*/}
            <ExportParticipants participants={participants}/>
            {/*          <Button
              type="button"
              data-color="danger"
              className="w-full h-fit"
              icon={<TrashIcon aria-hidden/>}
              onClick={() => setOpenConfirmation((x) => !x)}
          >
            Slett
          </Button>*/}
        </span>
      </span>
            <Modal
                open={openConfirmation}
                onClose={() => setOpenConfirmation(false)}
                header={{ heading: `Slett «${event.title}»?` }}
                width="small"
            >
                <Modal.Body>
                    <BodyLong spacing>
                        {`Er du sikker på at du vil slette "${event?.title}"? Dette kan ikke angres.`}
                    </BodyLong>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={async () => setOpenConfirmation((x) => !x)}
                    >
                        Avbryt
                    </Button>
                    <Button
                        data-color="danger"
                        className="w-fit h-fit"
                        onClick={() => deleteAndRedirect(event?.id!!)}
                    >
                        Ja, jeg vil slette arrangementet
                    </Button>
                </Modal.Footer>
            </Modal>
            <form>
                <Search
                    className="pt-0 -mt-4 -mb-2 ax-sm:w-64"
                    label="Søk alle deltakere"
                    variant="simple"
                    size="small"
                    value={searchInput}
                    onChange={(e) => {
                        setSearchInput(e);
                    }}
                />
            </form>
            <ParticipantTable
                participants={participants}
                hosts={hosts}
                event={event}
                user={user}
                searchInput={searchInput}
            />
            {event.inviteMode === "SHARED" && (
              <div className="flex flex-col gap-4">
                <InvitationManager
                  event={eventWithParticipants}
                  peopleSearchEnabled={peopleSearchEnabled}
                />
              </div>
            )}
            <Heading level="2" size="medium">Detaljer</Heading>
            <span className="flex flex-col ax-md:flex-row justify-start gap-2 -mt-6 mb-5 items-center">
              <CalendarIcon aria-hidden />
              {formatEventDates(event)}
              <ClockIcon aria-hidden />
              {`${event.startTime.substring(11, 16)} – ${event.endTime.substring(11, 16)}`}
              <LocationPinIcon aria-hidden />
              {event.location}
            </span>
        </div>
    );
}

async function deleteAndRedirect(eventId: string) {
    await deleteEvent(eventId);
    window.location.href = "/";
}

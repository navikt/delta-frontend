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

type ParticipantPageProps = {
    fullEvent: FullDeltaEvent;
    user: User;
};

export default function ParticipantPage({
                                      fullEvent: eventWithParticipants,
                                      user,
                                  }: ParticipantPageProps) {
    const [openConfirmation, setOpenConfirmation] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const {event, participants, hosts}: FullDeltaEvent = eventWithParticipants;

    return (
        <div className="flex flex-col gap-10">
      <span className="w-full flex flex-row justify-end">
        <span className="flex w-full ax-md:w-fit flex-col ax-md:flex-row gap-4">
  {/*        <Link
              href={`/event/${event.id}/edit`}
              className="w-full h-fit aksel-button whitespace-nowrap" data-variant="primary"
          >
            Rediger arrangement
          </Link>
          <Link
              href={`/event/new?template=${event.id}`}
              className="w-full h-fit aksel-button whitespace-nowrap" data-variant="primary" data-color="neutral"
          >
            Bruk som mal
          </Link>*/}
            <ExportParticipants participants={participants}/>
            {/*          <Button
              type="submit"
              variant="danger"
              className="w-full h-fit font-ax-bold"
              onClick={() => setOpenConfirmation((x) => !x)}
          >
            <span className="flex items-center gap-1">
              <TrashIcon/> Slett
            </span>
          </Button>*/}
        </span>
      </span>
            <Modal
                open={openConfirmation}
                onClose={() => setOpenConfirmation(false)}
                aria-label="Slett arrangement modal"
                className="w-4/5 max-w-[30rem] max-h-[50rem]"
            >
                <Modal.Body>
                    <Heading spacing level="1" size="large">
                        {`Slett: "${event?.title}?"`}
                    </Heading>
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
                        variant="danger"
                        className="w-fit h-fit font-ax-bold"
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
            <h2 className="aksel-heading aksel-heading--medium">Detaljer</h2>
            <span className="flex flex-col ax-md:flex-row justify-start gap-2 -mt-6 mb-5 items-center">
              <CalendarIcon aria-label="dato"/>
              {formatEventDates(event)}
              <ClockIcon aria-label="tid"/>
              {`${event.startTime.substring(11, 16)} – ${event.endTime.substring(11, 16)}`}
              <LocationPinIcon aria-label="sted"/>
              {event.location}
            </span>
        </div>
    );
}

async function deleteAndRedirect(eventId: string) {
    await deleteEvent(eventId);
    window.location.href = "/";
}

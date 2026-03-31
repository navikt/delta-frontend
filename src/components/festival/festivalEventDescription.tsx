"use client";

import { useMemo, useState } from "react";
import { User } from "@/types/user";
import { FullDeltaEvent, DeltaParticipant } from "@/types/event";
import {
  ClockIcon,
  CalendarIcon,
  PersonCheckmarkIcon,
  PersonCircleIcon,
  HourglassBottomFilledIcon,
  LocationPinIcon,
} from "@navikt/aksel-icons";
import { useRef } from "react";
import { Link, Modal, Search, Button } from "@navikt/ds-react";
import {
  formatEventDates,
  formatEventTimes,
  formatDeadline,
  formatEventDuration,
} from "@/service/format";

type FestivalEventDescriptionProps = FullDeltaEvent & {
  className?: string;
  displayTime: boolean;
  user: User;
  contactName: string;
  contactEmail: string;
};

export default function FestivalEventDescription({
  event,
  participants,
  hosts,
  user,
  className,
  displayTime,
  contactName,
  contactEmail,
}: FestivalEventDescriptionProps) {
  const [openParticipantList, setOpenParticipantList] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const participantsAndHosts = participants.concat(hosts);

  const sortParticipant = (a: DeltaParticipant, b: DeltaParticipant) =>
    a.name.split(", ").reverse()[0] > b.name.split(", ").reverse()[0] ? 1 : -1;

  const filterParticipants = useMemo(() => {
    return [...hosts]
      .sort(sortParticipant)
      .concat([...participants].sort(sortParticipant))
      .filter((p) =>
        p.name
          .split(", ")
          .reverse()
          .join(" ")
          .toLowerCase()
          .includes(searchInput.toLocaleLowerCase()),
      );
  }, [participants, searchInput, hosts]);

  const ref = useRef<HTMLDialogElement>(null);

  function convertTextToLinks(text: string) {
    const urlRegex = /(https?:\/\/\S+)/g;
    const urlTest = /https?:\/\/\S+/;
    const parts = text.split(urlRegex);
    // @ts-ignore
    return parts.map((part, index) => {
      if (urlTest.test(part)) {
        let url = part.trim();
        if (!url.startsWith("http")) {
          url = "https://" + url;
        }
        return (
          <Link
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {url}
          </Link>
        );
      }
      return part;
    });
  }

  return (
    <div className={className || ""}>
      <div>
        {displayTime ? (
          <span className="flex flex-row justify-start gap-2 items-center pb-1 pt-1">
            <CalendarIcon aria-label="dato" />
            {formatEventDates(event)}
          </span>
        ) : (
          <span className="flex flex-row justify-start gap-2 items-center pb-1 pt-1">
            <CalendarIcon aria-label="dato" />
            {formatEventTimes(event)}
          </span>
        )}
      </div>
      <div>
        {displayTime ? (
          <span className="flex flex-row justify-start gap-2 items-center pb-1">
            <ClockIcon aria-label="tid" />
            {`${event.startTime.substring(11, 16)} – ${event.endTime.substring(11, 16)}`}
          </span>
        ) : (
          <span className="flex flex-row justify-start gap-2 items-center pb-1">
            <ClockIcon aria-hidden />
            Varighet: {formatEventDuration(event)}
          </span>
        )}
      </div>
      <div>
        {event.location && (
          <span className="flex flex-row justify-start gap-2 items-center pb-1">
            <LocationPinIcon aria-label="sted" />
            {convertTextToLinks(event.location)}
          </span>
        )}
      </div>
      {event.signupDeadline && (
        <div>
          <label className="flex items-center gap-2">
            <HourglassBottomFilledIcon aria-hidden />
            Påmeldingsfrist:
          </label>
          <span className="flex ml-[0.2rem] pl-6 gap-2 text-ax-danger-700">
            {formatDeadline(event)}{" "}
          </span>
        </div>
      )}
      <div className="pb-1">
        <label className="flex items-center gap-2">
          <PersonCircleIcon aria-hidden />
          Arrangeres av:
        </label>
        <ul className="list-none p-0 m-0">
          <li className="flex ml-[0.2rem] pl-6 gap-2">
            <Link
              title={`Send e-post til ${contactEmail}`}
              href={`mailto:${contactEmail}`}
              className="leading-relaxed"
            >
              {contactName}
            </Link>
          </li>
        </ul>
      </div>
      <span className="flex flex-row justify-start gap-2 items-center cursor-pointer">
        <PersonCheckmarkIcon aria-hidden />
        {participantsAndHosts.length}
        {event.participantLimit == 0 ? "" : ` av ${event.participantLimit}`}
        {" deltakere"}
      </span>
      <div className="flex flex-row ml-[0.3rem] pl-6">
        {hosts.map((h) => h.email).includes(user.email) ? (
          <Link
            className="mb-4 aksel-button aksel-button--xsmall no-underline"
            data-variant="secondary"
            href={`/event/${event.id}/admin`}
          >
            Vis deltakere
          </Link>
        ) : (
          <Button
            variant="secondary"
            onClick={() => setOpenParticipantList(true)}
            className="mb-4"
            size="small"
          >
            Vis deltakere
          </Button>
        )}
      </div>
      <Modal
        open={openParticipantList}
        onClose={() => setOpenParticipantList(false)}
        aria-labelledby="modal-heading"
        ref={ref}
      >
        <Modal.Header>
          <h1 className="aksel-heading aksel-heading--medium">Deltakere</h1>
          <form>
            <Search
              className="pt-4 pb-2"
              label="Søk alle deltakere"
              variant="simple"
              size="small"
              value={searchInput}
              onChange={(e) => setSearchInput(e)}
            />
          </form>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-6">
            <ul className="flex flex-col gap-1 list-none p-0 m-0">
              {filterParticipants.map((p) => (
                <li className="pb-4" key={p.email}>
                  <div className="flex flex-row items-center justify-between w-full gap-2">
                    <span className="flex items-center gap-2">
                      {p.name.split(", ").reverse().join(" ")}
                    </span>
                    {hosts.some((h) => h.email === p.email) && (
                      <span className="bg-ax-neutral-600 text-ax-text-on-inverted cursor-default rounded-xl px-2">
                        arrangør
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

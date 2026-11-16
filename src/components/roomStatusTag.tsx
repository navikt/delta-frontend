import { CheckmarkCircleIcon, ClockIcon, ExclamationmarkTriangleIcon } from "@navikt/aksel-icons";
import { Link, Tag } from "@navikt/ds-react";
import NextLink from "next/link";
import type { RoomStatus } from "@/types/event";
import { OrganizerStatus, OrganizerStatusRow } from "@/components/organizerStatusBox";

const TAG: Record<RoomStatus, { color: "neutral" | "success" | "danger"; text: string }> = {
  PENDING: { color: "neutral", text: "Venter på svar fra rommet" },
  ACCEPTED: { color: "success", text: "Rom booket" },
  DECLINED: { color: "danger", text: "Rommet avslo bookingen" },
};

export function RoomStatusTag({ status }: { status?: RoomStatus | null }) {
  if (!status || !TAG[status]) return null;
  const { color, text } = TAG[status];
  return (
    <Tag variant="moderate" data-color={color} size="xsmall">
      {text}
    </Tag>
  );
}

/** Room booking row for the organizer status box. */
export function RoomStatusRow({ eventId, status }: { eventId: string; status?: RoomStatus | null }) {
  if (!status || !TAG[status]) return null;
  if (status === "ACCEPTED") {
    return (
      <OrganizerStatusRow
        label="Rom"
        status={<OrganizerStatus tone="success" icon={<CheckmarkCircleIcon aria-hidden />}>Booket</OrganizerStatus>}
      />
    );
  }
  if (status === "PENDING") {
    return (
      <OrganizerStatusRow
        label="Rom"
        status={<OrganizerStatus tone="neutral" icon={<ClockIcon aria-hidden />}>Venter på svar</OrganizerStatus>}
      />
    );
  }
  return (
    <OrganizerStatusRow
      label="Rom"
      status={<OrganizerStatus tone="danger" icon={<ExclamationmarkTriangleIcon aria-hidden />}>Avslått</OrganizerStatus>}
    >
      <Link as={NextLink} href={`/event/${eventId}/edit`} className="w-fit text-ax-small">
        Velg et annet rom
      </Link>
    </OrganizerStatusRow>
  );
}

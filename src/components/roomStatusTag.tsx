import { CheckmarkIcon, ClockIcon, ExclamationmarkTriangleIcon } from "@navikt/aksel-icons";
import { HStack, Link, Tag } from "@navikt/ds-react";
import NextLink from "next/link";
import type { RoomStatus } from "@/types/event";
import { OrganizerStatus } from "@/components/organizerBar";

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

/** Room booking status for the organizer bar. */
export function RoomStatusRow({ eventId, status }: { eventId: string; status?: RoomStatus | null }) {
  if (!status || !TAG[status]) return null;
  if (status === "ACCEPTED") {
    return <OrganizerStatus tone="success" icon={<CheckmarkIcon aria-hidden />}>Rom booket</OrganizerStatus>;
  }
  if (status === "PENDING") {
    return <OrganizerStatus tone="neutral" icon={<ClockIcon aria-hidden />}>Rom venter på svar</OrganizerStatus>;
  }
  return (
    <HStack gap="space-8" align="center">
      <OrganizerStatus tone="danger" icon={<ExclamationmarkTriangleIcon aria-hidden />}>Rom avslått</OrganizerStatus>
      <Link as={NextLink} href={`/event/${eventId}/edit`} className="text-ax-small">
        Velg et annet rom
      </Link>
    </HStack>
  );
}

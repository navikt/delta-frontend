import { Tag } from "@navikt/ds-react";
import { RoomStatus } from "@/types/event";

const STATUS: Record<RoomStatus, { variant: "neutral" | "success" | "error"; text: string }> = {
  PENDING: { variant: "neutral", text: "Venter på svar fra rommet" },
  ACCEPTED: { variant: "success", text: "Rom booket" },
  DECLINED: { variant: "error", text: "Rommet avslo bookingen" },
};

export function RoomStatusTag({ status }: { status?: RoomStatus | null }) {
  if (!status || !STATUS[status]) return null;
  const { variant, text } = STATUS[status];
  return (
    <Tag variant={variant} size="xsmall">
      {text}
    </Tag>
  );
}

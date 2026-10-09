import { Tag } from "@navikt/ds-react";
import { Invitation, InvitationStatus } from "@/types/event";

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

export default function InvitationList({ invitations }: { invitations: Invitation[] }) {
  if (invitations.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="aksel-heading aksel-heading--small">Inviterte</h2>
      <ul className="flex flex-col gap-3 list-none p-0 m-0">
        {invitations.map((invitation) => (
          <li
            key={invitation.email}
            className="flex flex-wrap items-center justify-between gap-2"
          >
            <span>{invitation.name}</span>
            <Tag variant="moderate" data-color={statusColors[invitation.status]} size="small">
              {statusLabels[invitation.status]}
            </Tag>
          </li>
        ))}
      </ul>
    </section>
  );
}

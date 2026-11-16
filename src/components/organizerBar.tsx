"use client";

import { EyeSlashIcon } from "@navikt/aksel-icons";
import { Box, Detail, HStack, Page, Tag } from "@navikt/ds-react";
import { Children, type ReactNode } from "react";

type OrganizerBarProps = {
  /** Status tags such as calendar sync and room booking. */
  status?: ReactNode;
  /** Organizer actions such as edit, duplicate and delete. */
  actions?: ReactNode;
};

/**
 * Full-width bar above the page hero with organizer-only status and actions, so the rest of the
 * page looks the same for organizers and participants. Callers must only render it for hosts.
 */
export default function OrganizerBar({ status, actions }: OrganizerBarProps) {
  const hasStatus = Children.toArray(status).length > 0;
  const hasActions = Children.toArray(actions).length > 0;
  if (!hasStatus && !hasActions) return null;
  return (
    <Box
      as="section"
      aria-label="Kun synlig for arrangører"
      background="meta-purple-soft"
      borderColor="meta-purple-subtle"
      borderWidth="0 0 1 0"
      paddingBlock="space-12"
    >
      <Page.Block width="xl" gutters>
        <HStack gap="space-16" justify="space-between" align="center" wrap>
          <HStack gap="space-12" align="center" wrap>
            <HStack gap="space-8" align="center" wrap={false} className="text-ax-text-meta-purple">
              <EyeSlashIcon aria-hidden />
              <Detail as="p" weight="semibold" uppercase>
                Kun synlig for arrangører
              </Detail>
            </HStack>
            {status}
          </HStack>
          {hasActions && <HStack gap="space-8" wrap>{actions}</HStack>}
        </HStack>
      </Page.Block>
    </Box>
  );
}

type OrganizerStatusProps = {
  tone: "success" | "warning" | "danger" | "neutral";
  icon: ReactNode;
  children: ReactNode;
};

/** Status tag with icon and text. Status is never conveyed by color or icon alone. */
export function OrganizerStatus({ tone, icon, children }: OrganizerStatusProps) {
  return (
    <Tag size="small" variant="moderate" data-color={tone} icon={icon}>
      {children}
    </Tag>
  );
}

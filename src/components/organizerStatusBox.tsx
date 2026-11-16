import { EyeSlashIcon } from "@navikt/aksel-icons";
import { BodyShort, Box, Detail, HStack, VStack } from "@navikt/ds-react";
import { Children, type ReactNode } from "react";

/**
 * Groups organizer-only status rows (calendar, room) in one visually distinct box.
 * Renders nothing when no rows are present. Callers must only render it for hosts.
 */
export default function OrganizerStatusBox({ children }: { children?: ReactNode }) {
  if (Children.toArray(children).length === 0) return null;
  return (
    <Box
      as="section"
      aria-label="Kun synlig for arrangører"
      background="meta-purple-soft"
      borderColor="meta-purple"
      borderWidth="1"
      borderRadius="12"
      padding="space-16"
      className="border-dashed"
    >
      <VStack gap="space-12">
        <HStack gap="space-8" align="center" wrap={false} className="text-ax-text-meta-purple">
          <EyeSlashIcon aria-hidden />
          <Detail as="h2" weight="semibold" uppercase>
            Kun synlig for arrangører
          </Detail>
        </HStack>
        <VStack as="ul" gap="space-12">
          {children}
        </VStack>
      </VStack>
    </Box>
  );
}

type OrganizerStatusRowProps = {
  label: string;
  /** Status shown to the right of the label. */
  status: ReactNode;
  /** Optional details below the row, e.g. an error message or a follow-up action. */
  children?: ReactNode;
};

export function OrganizerStatusRow({ label, status, children }: OrganizerStatusRowProps) {
  return (
    <VStack as="li" gap="space-8">
      <HStack gap="space-8" justify="space-between" align="center">
        <BodyShort size="small">{label}</BodyShort>
        {status}
      </HStack>
      {children}
    </VStack>
  );
}

type OrganizerStatusProps = {
  tone: "success" | "warning" | "danger" | "neutral";
  icon?: ReactNode;
  children: ReactNode;
};

/** Status text with an optional icon. Status is never conveyed by color or icon alone. */
export function OrganizerStatus({ tone, icon, children }: OrganizerStatusProps) {
  return (
    <BodyShort as="span" size="small" weight="semibold" textColor="default" data-color={tone}>
      <HStack as="span" gap="space-4" align="center" wrap={false}>
        {icon}
        {children}
      </HStack>
    </BodyShort>
  );
}

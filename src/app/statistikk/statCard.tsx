import { BodyShort, Box, Heading } from "@navikt/ds-react";
import type { ReactNode } from "react";

type StatContentProps = {
  icon?: ReactNode;
  title: string;
  value: number;
  suffix?: string;
  subtitle?: string;
};

export const clickableStatCardClassName =
  "w-full h-full text-left cursor-pointer rounded-ax-12 border border-ax-border-neutral-subtle bg-ax-bg-raised p-6 transition-colors hover:border-ax-border-accent hover:bg-ax-bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ax-border-focus";

export function StatValue({ value, suffix }: { value: number; suffix?: string }) {
  return (
    <Heading as="span" level="3" size="large" className="block">
      {value.toLocaleString("nb-NO")}
      {suffix && (
        <BodyShort as="span" size="large" textColor="subtle" className="ml-1">
          {suffix}
        </BodyShort>
      )}
    </Heading>
  );
}

function StatIcon({ icon }: { icon?: ReactNode }) {
  if (!icon) return null;
  return (
    <span aria-hidden className="mb-3 flex text-ax-text-accent">
      {icon}
    </span>
  );
}

export function StatCard({ icon, title, value, suffix, subtitle }: StatContentProps) {
  return (
    <Box background="raised" borderColor="neutral-subtle" borderWidth="1" borderRadius="12" padding="space-24">
      <StatIcon icon={icon} />
      <BodyShort as="h3" size="small" weight="semibold" textColor="subtle" className="mb-1">
        {title}
      </BodyShort>
      <StatValue value={value} suffix={suffix} />
      {subtitle && (
        <BodyShort size="small" textColor="subtle" className="mt-1">
          {subtitle}
        </BodyShort>
      )}
    </Box>
  );
}

export function ClickableStatCard({
  onClick,
  icon,
  title,
  value,
  suffix,
  subtitle,
}: StatContentProps & { onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={clickableStatCardClassName}>
      <StatIcon icon={icon} />
      <BodyShort as="span" size="small" weight="semibold" textColor="subtle" className="mb-1 block">
        {title}
      </BodyShort>
      <StatValue value={value} suffix={suffix} />
      {subtitle && (
        <BodyShort as="span" size="small" textColor="subtle" className="mt-1 block">
          {subtitle}
        </BodyShort>
      )}
      <BodyShort as="span" size="small" className="mt-2 block text-ax-text-accent">
        Klikk for detaljer
      </BodyShort>
    </button>
  );
}

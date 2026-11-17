"use client";

import { LinkIcon, QrCodeIcon } from "@navikt/aksel-icons";
import { BodyShort, Box, Button, Heading, HStack, Modal, ProgressBar, Tag, VStack } from "@navikt/ds-react";
import { useQRCode } from "next-qrcode";
import { type ReactNode, useState } from "react";
import SecondaryCopyButton from "@/components/SecondaryCopyButton";
import { RecurringBadge } from "@/components/RecurringBadge";
import type { Category, DeltaEvent, RecurringSeriesSummary, SignupOption } from "@/types/event";
import { formatEventSummary, getSeatStatus, seatStatusLabel } from "@/service/eventDetailsFormat";
import { optionCapacityText } from "@/service/signupOptions";

/** White content card used for the info and description columns. */
export function DetailsCard({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <Box
      as="section"
      aria-label={label}
      background="raised"
      borderColor="neutral-subtle"
      borderWidth="1"
      borderRadius="12"
      padding="space-24"
    >
      {children}
    </Box>
  );
}

export function Divider() {
  return <Box borderColor="neutral-subtle" borderWidth="1 0 0 0" />;
}

/** Icon + text row in the info card. Icons are decorative; the text carries the meaning. */
export function InfoRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <HStack as="li" gap="space-12" align="start" wrap={false}>
      <Box as="span" paddingBlock="space-4" className="flex shrink-0 text-ax-text-neutral-subtle">
        {icon}
      </Box>
      <VStack gap="space-2" className="min-w-0 break-words">
        {children}
      </VStack>
    </HStack>
  );
}

export function InfoRows({ children }: { children: ReactNode }) {
  return <VStack as="ul" gap="space-16">{children}</VStack>;
}

/** Hero summary line ("Onsdag 18. november · 14:00–16:00") followed by category and recurrence tags. */
export function EventHeroMeta({
  event,
  categories,
  recurringSeries,
}: {
  event: DeltaEvent;
  categories: Category[];
  recurringSeries?: RecurringSeriesSummary;
}) {
  const hasTags = categories.length > 0 || !!recurringSeries;
  return (
    <VStack gap="space-8">
      <BodyShort size="large">{formatEventSummary(event)}</BodyShort>
      {hasTags && (
        <HStack as="ul" gap="space-8" aria-label="Kategorier">
          {recurringSeries && (
            <li>
              <RecurringBadge frequency={recurringSeries.frequency} />
            </li>
          )}
          {categories.map((category) => (
            <li key={category.id}>
              <Tag variant="moderate" data-color="neutral" size="small">
                {category.name}
              </Tag>
            </li>
          ))}
        </HStack>
      )}
    </VStack>
  );
}

/** "Påmeldte" block for events with signup options: one capacity row per option. Hosts are not counted. */
export function SignupOptionsSummary({ options, action }: { options: SignupOption[]; action: ReactNode }) {
  return (
    <VStack gap="space-12">
      <BodyShort weight="semibold">Påmeldte</BodyShort>
      <VStack as="ul" gap="space-24" aria-label="Påmeldte per alternativ">
        {options.map((option) => {
          const status = seatStatusLabel(getSeatStatus(option.allocatedSeats, option.participantLimit));
          return (
            <VStack as="li" key={option.id} gap="space-8">
              <BodyShort>
                <b>{option.label}</b> · {optionCapacityText(option)}
              </BodyShort>
              {option.participantLimit > 0 && (
                <ProgressBar
                  size="small"
                  value={Math.min(option.allocatedSeats, option.participantLimit)}
                  valueMax={option.participantLimit}
                  aria-label={`${option.label}: ${option.allocatedSeats} av ${option.participantLimit} plasser fylt`}
                />
              )}
              {(status || option.waitlistCount > 0) && (
                <HStack gap="space-4" wrap>
                  {status && <Tag variant="moderate" data-color="warning" size="small">{status}</Tag>}
                  {option.waitlistCount > 0 && (
                    <Tag variant="outline" data-color="info" size="small">{option.waitlistCount} på venteliste</Tag>
                  )}
                </HStack>
              )}
            </VStack>
          );
        })}
      </VStack>
      <HStack justify="end">{action}</HStack>
    </VStack>
  );
}

/** "Påmeldte" block: count, fill level and remaining-seats status. */
export function ParticipantsSummary({
  attendeeCount,
  participantLimit,
  action,
}: {
  attendeeCount: number;
  participantLimit: number;
  /** "Vis deltakere" control. */
  action: ReactNode;
}) {
  const seatStatus = getSeatStatus(attendeeCount, participantLimit);
  const statusLabel = seatStatusLabel(seatStatus);
  const unlimited = seatStatus.kind === "unlimited";
  return (
    <VStack gap="space-12">
      <HStack gap="space-8" justify="space-between" align="baseline">
        <BodyShort weight="semibold">Påmeldte</BodyShort>
        {unlimited ? (
          <BodyShort>{attendeeCount} deltakere</BodyShort>
        ) : (
          <BodyShort>
            <b>{attendeeCount}</b> av {participantLimit} plasser
          </BodyShort>
        )}
      </HStack>
      {!unlimited && (
        <ProgressBar
          size="small"
          value={Math.min(attendeeCount, participantLimit)}
          valueMax={participantLimit}
          aria-label={`${attendeeCount} av ${participantLimit} plasser fylt`}
        />
      )}
      <HStack gap="space-8" justify={statusLabel ? "space-between" : "end"} align="center">
        {statusLabel && (
          <Tag variant="moderate" data-color="warning" size="small">
            {statusLabel}
          </Tag>
        )}
        {action}
      </HStack>
    </VStack>
  );
}

/** "Om arrangementet" card with the description and the share section. */
export function DescriptionCard({
  children,
  shareUrl,
  qrText,
  trackEvents = false,
}: {
  children: ReactNode;
  shareUrl: string;
  qrText: string;
  trackEvents?: boolean;
}) {
  const [openQR, setOpenQR] = useState(false);
  const { Canvas } = useQRCode();
  return (
    <DetailsCard>
      <VStack gap="space-24">
        <VStack gap="space-12">
          <Heading level="2" size="small">
            Om arrangementet
          </Heading>
          <div className="max-w-2xl break-words [&_p]:whitespace-pre-line">{children}</div>
        </VStack>
        <Divider />
        <VStack gap="space-12">
          <Heading level="2" size="xsmall">
            Del arrangementet
          </Heading>
          <HStack gap="space-8">
            <SecondaryCopyButton
              data-color="accent"
              data-umami-event={trackEvents ? "kopierer eventlenke" : undefined}
              copyText={shareUrl}
              text="Kopier lenke"
              size="small"
              icon={<LinkIcon aria-hidden />}
            />
            <Button
              data-umami-event={trackEvents ? "viser qr" : undefined}
              variant="secondary"
              size="small"
              icon={<QrCodeIcon aria-hidden />}
              onClick={() => setOpenQR(true)}
            >
              Vis QR-kode
            </Button>
          </HStack>
        </VStack>
      </VStack>
      <Modal open={openQR} onClose={() => setOpenQR(false)} header={{ heading: "QR-kode til arrangementet" }}>
        <Modal.Body>
          <Heading spacing level="2" size="large">
            Δ Delta
          </Heading>
          <div role="img" aria-label="QR-kode som lenker til arrangementet">
            <Canvas
              text={qrText}
              options={{
                errorCorrectionLevel: "M",
                margin: 3,
                scale: 4,
                width: 200,
                color: {
                  dark: "#000",
                  light: "d9cfe4",
                },
              }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setOpenQR(false)}>
            Lukk
          </Button>
        </Modal.Footer>
      </Modal>
    </DetailsCard>
  );
}

import { Box, Detail, Heading, VStack } from "@navikt/ds-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

type CalendarProps = { dateString: string; displayTime?: boolean };

export default function Calendar({ dateString, displayTime = false }: CalendarProps) {
  const date = new Date(dateString);
  const month = format(date, "MMM", { locale: nb }).substring(0, 3).toUpperCase();
  const day = format(date, "dd");
  const time = format(date, "HH:mm");

  return (
    <Box
      background="raised"
      borderColor="neutral-subtle"
      borderWidth="1"
      borderRadius="8"
      overflow="hidden"
      className="w-fit min-w-14 shrink-0 text-center"
      aria-hidden
    >
      <Box background="accent-strong" paddingInline="space-8" paddingBlock="space-2">
        <Detail as="span" weight="semibold" uppercase textColor="contrast" data-color="accent">
          {month}
        </Detail>
      </Box>
      <VStack paddingInline="space-8" paddingBlock="space-4" align="center">
        <Heading as="span" size="medium">
          {day}
        </Heading>
        {displayTime && <Detail as="span" textColor="subtle">{time}</Detail>}
      </VStack>
    </Box>
  );
}

import { Tag } from "@navikt/ds-react";
import { ArrowsCirclepathIcon } from "@navikt/aksel-icons";
import { RecurrenceFrequency } from "@/types/event";

export function frequencyLabel(frequency: RecurrenceFrequency): string {
    switch (frequency) {
        case "WEEKLY":   return "Ukentlig";
        case "BIWEEKLY": return "Annenhver uke";
        case "MONTHLY":  return "Månedlig";
    }
}

export function RecurringBadge({ frequency }: { frequency: RecurrenceFrequency }) {
    return (
        <Tag variant="info" size="small" className="flex items-center gap-1 w-fit">
            <ArrowsCirclepathIcon aria-hidden />
            {frequencyLabel(frequency)}
        </Tag>
    );
}

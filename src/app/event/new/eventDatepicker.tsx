"use client";

import { CreateEventSchema } from "@/components/createEventForm";
import { DatePicker, DateValidationT, useDatepicker } from "@navikt/ds-react";
import { ReactNode, useState } from "react";
import { Control, FieldErrors, useController } from "react-hook-form";
import { format } from "date-fns";

type EventDatepickerProps = {
  name: "startDate" | "endDate" | "signupDeadlineDate" | "recurrenceUntilDate";
  label: ReactNode;
  invalidMessage: string;
  requiredMessage: string;
  control: Control<CreateEventSchema>;
  errors: FieldErrors<CreateEventSchema>;
  hideLabel: boolean;
  onDateSelected?: (date: Date | undefined) => void;
};

export default function EventDatepicker(props: EventDatepickerProps) {
  const [validationError, setValidationError] =
    useState<DateValidationT | null>(null);

  const { field } = useController<CreateEventSchema, typeof props.name>({
    name: props.name,
    control: props.control,
    rules: {
      validate: (value) => {
        if (validationError?.isInvalid) {
          return props.invalidMessage;
        }
        if (value === null || value === undefined) {
          return props.requiredMessage;
        }
      },
    },
  });

  const { datepickerProps, inputProps } = useDatepicker({
    defaultSelected: field.value,
    fromDate: new Date(),
    onDateChange: (date: Date | undefined) => {
      field.onChange(date);
      props.onDateSelected?.(date);
    },
    onValidate: (validation) => {
      setValidationError(validation);
    },
  });

  const syncedInputProps = {
    ...inputProps,
    value: field.value ? format(field.value, "dd.MM.yyyy") : inputProps.value,
  };

  return (
    <DatePicker {...datepickerProps} style={{ width: "100%" }} key={field.value?.getTime() ?? "empty"}>
      <div className="flex flex-row flex-wrap justify-left gap-4 pb-0 items-end">
        <div className="flex flex-col ax-sm:flex-row items-start ax-sm:items-end gap-4 flex-wrap">
          <DatePicker.Input
            hideLabel={props.hideLabel}
            {...syncedInputProps}
            id={field.name}
            label={props.label}
            error={props.errors[field.name]?.message}
          />
        </div>
      </div>
    </DatePicker>
  );
}

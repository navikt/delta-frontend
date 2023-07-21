"use client";

import { CreateEventSchema } from "@/components/createEventForm";
import { DatePicker, DateValidationT, useDatepicker } from "@navikt/ds-react";
import { useState } from "react";
import { Control, FieldErrors, useController } from "react-hook-form";

type EventDatepickerProps = {
  name: "startDate" | "endDate" | "signupDeadlineDate";
  label: "Fra" | "Til" | "Påmeldingsfrist";
  invalidMessage: string;
  requiredMessage: string;
  control: Control<CreateEventSchema>;
  errors: FieldErrors<CreateEventSchema>;
};

export default function EventDatepicker(props: EventDatepickerProps) {
  const [validationError, setValidationError] =
    useState<DateValidationT | null>(null);

  const { field, fieldState } = useController<
    CreateEventSchema,
    typeof props.name
  >({
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
    },
    onValidate: (validation) => {
      setValidationError(validation);
    },
  });

  return (
    <DatePicker {...datepickerProps} style={{ width: "100%" }}>
      <div className="flex flex-row flex-wrap justify-left gap-4 pb-0 items-end">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 flex-wrap ">
          <DatePicker.Input
            {...inputProps}
            id={field.name}
            label={props.label}
            error={props.errors[field.name]?.message}
          />
        </div>
      </div>
    </DatePicker>
  );
}

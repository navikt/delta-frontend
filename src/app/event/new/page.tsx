"use client";
import {
  Button,
  TextField,
  DatePicker,
  useRangeDatepicker,
} from "@navikt/ds-react";
import { createEvent } from "./createEvent";

export default function NewEvent() {
  const { datepickerProps, toInputProps, fromInputProps, selectedRange } =
    useRangeDatepicker({
      fromDate: new Date("Aug 23 2019"),
      onRangeChange: console.log,
    });

  return (
    <div>
      <form action={createEvent}>
        <TextField label="Tittel" name="title" />
        <TextField label="Beskrivelse" name="description" />
        <DatePicker {...datepickerProps}>
          <div className="flex flex-col justify-center gap-4 pb-0">
            <div className="flex flex-row items-end gap-4">
              <DatePicker.Input
                {...fromInputProps}
                label="Fra"
                name="startTime"
              />
              <div className="navds-form-field navds-form-field--medium">
                <input
                  type="time"
                  name="startClock"
                  className="navds-text-field__input"
                />
              </div>
            </div>
            <div className="flex flex-row items-end gap-4">
              <DatePicker.Input {...toInputProps} label="Til" name="endTime" />
              <div className="navds-form-field navds-form-field--medium">
                <input
                  type="time"
                  name="startClock"
                  className="navds-text-field__input"
                />
              </div>
            </div>
          </div>
        </DatePicker>
        <Button type="submit">Lag event</Button>
      </form>
    </div>
  );
}

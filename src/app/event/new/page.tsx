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
          <div className="flex flex-col justify-center gap-4">
            <div className="flex flex-wrap justify-center gap-4">
              <DatePicker.Input
                {...fromInputProps}
                label="Fra"
                name="startTime"
              />
              <div className="navds-form-field navds-form-field--medium navds-date__field">
                <label
                  htmlFor="startClock"
                  className="navds-form-field__label navds-label flex-shrink"
                ></label>
                <div className="navds-date__field-wrapper">
                  <input
                    type="time"
                    name="startClock"
                    className="navds-date__field-input w-full navds-text-field__input navds-body-short navds-body-medium"
                  />
                </div>
              </div>
            </div>
            <DatePicker.Input {...toInputProps} label="Til" name="endTime" />
          </div>
        </DatePicker>
        <input type="time" name="startClock" />
        <Button type="submit">Lag event</Button>
      </form>
    </div>
  );
}

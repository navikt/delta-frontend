"use client";
import {
  Button,
  TextField,
  DatePicker,
  useRangeDatepicker,
  Textarea,
  Heading,
} from "@navikt/ds-react";
import { createEvent } from "./createEvent";

export default function NewEvent() {
  const { datepickerProps, toInputProps, fromInputProps, selectedRange } =
    useRangeDatepicker({
      fromDate: new Date("Aug 23 2019"),
    });

  return (
    <div className="p-20 max-w-[95%] w-[80rem] m-auto gap-7 flex flex-col">
      <div className="flex flex-col gap-2">
        <Heading level="1" size="large">
          Opprett arrrangement
        </Heading>
        <p className="italic break-words">
          Arrangementet vil være synlig for alle som har tilgang til Delta, og
          vil bli publisert på deltakalenderen.
        </p>
      </div>
      <style>
        {`.navds-date__wrapper {
          max-width: 100%;
        }`}
      </style>
      <form action={createEvent} className="flex flex-col gap-5">
        <TextField label="Tittel" name="title" className="" required />
        <TextField label="Sted" name="location" required />
        <Textarea label="Beskrivelse" name="description" required />
        <DatePicker {...datepickerProps} style={{ width: "100%" }}>
          <div className="flex flex-row flex-wrap justify-left gap-4 pb-0 items-end">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 flex-wrap ">
              <DatePicker.Input
                {...fromInputProps}
                label="Fra"
                name="startDate"
                required
              />
              <div className="navds-form-field navds-form-field--medium">
                <input
                  type="time"
                  name="startTime"
                  className="navds-text-field__input"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 flex-wrap ">
              <DatePicker.Input
                {...toInputProps}
                label="Til"
                name="endDate"
                required
              />
              <div className="navds-form-field navds-form-field--medium">
                <input
                  type="time"
                  name="endTime"
                  className="navds-text-field__input"
                  required
                />
              </div>
            </div>
          </div>
        </DatePicker>
        <Button type="submit" className="w-[19rem] max-w-full">
          Opprett arrangement
        </Button>
      </form>
    </div>
  );
}

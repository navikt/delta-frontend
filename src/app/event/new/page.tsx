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
      onRangeChange: console.log,
    });

  return (
    <div className="p-20 max-w-[90%] w-[80rem] m-auto gap-7 flex flex-col">
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
          width: 100% !important;
        }`}
      </style>
      <form action={createEvent} className="flex flex-col gap-5">
        <TextField label="Tittel" name="title" className="" />
        <TextField label="Sted" name="location" />
        <Textarea label="Beskrivelse" name="description" />
        <DatePicker {...datepickerProps} style={{ width: "100%" }}>
          <div className="flex flex-row flex-wrap justify-left gap-4 pb-0 items-end">
            <div className="flex flex-row items-end gap-4">
              <DatePicker.Input
                {...fromInputProps}
                label="Fra"
                name="startDate"
              />
              <div className="navds-form-field navds-form-field--medium">
                <input
                  type="time"
                  name="startTime"
                  className="navds-text-field__input"
                />
              </div>
            </div>
            <div className="flex flex-row items-end gap-4">
              <DatePicker.Input {...toInputProps} label="Til" name="endDate" />
              <div className="navds-form-field navds-form-field--medium">
                <input
                  type="time"
                  name="endTime"
                  className="navds-text-field__input"
                />
              </div>
            </div>
          </div>
        </DatePicker>
        <Button type="submit" className="w-[19rem]">
          Opprett arrangement
        </Button>
      </form>
    </div>
  );
}

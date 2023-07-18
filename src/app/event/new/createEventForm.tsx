"use client";

import {
  Button,
  DatePicker,
  TextField,
  Textarea,
  useRangeDatepicker,
} from "@navikt/ds-react";
import { Dispatch, SetStateAction, useState } from "react";
import { createEvent } from "./createEvent";
import { redirect } from "next/navigation";

export default function CreateEventForm() {
  const { datepickerProps, toInputProps, fromInputProps } = useRangeDatepicker({
    fromDate: new Date("Aug 23 2019"),
  });

  const [loading, setLoading] = useState(false);
  return (
    <form
      action={(f) => createAndRedirect(f, setLoading)}
      className="flex flex-col gap-5"
    >
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
      <Button type="submit" className="w-[19rem] max-w-full" loading={loading}>
        Opprett arrangement
      </Button>
    </form>
  );
}

async function createAndRedirect(
  formData: FormData,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) {
  setIsLoading(true);
  const event = await createEvent(formData);
  redirect(`/event/${event.id}`);
}

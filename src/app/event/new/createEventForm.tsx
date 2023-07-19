"use client";

import { Button, Textarea, TextField } from "@navikt/ds-react";
import { useState } from "react";
import { createEvent, updateEvent } from "./createEvent";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import EventDatepicker from "./eventDatepicker";
import { DeltaEvent } from "@/types/event";
import { dates } from "@/components/format";
import { format } from "date-fns";

const createEventSchema = z
  .object({
    title: z.string().nonempty({ message: "Du må fylle inn en tittel" }),
    location: z.string().nonempty({ message: "Du må fylle inn et sted" }),
    description: z
      .string()
      .nonempty({ message: "Du må fylle inn en beskrivelse" }),
    startDate: z.date({ required_error: "Du må velge en startdato" }),
    startTime: z.string().regex(/[0-9]{2}:[0-9]{2}/, {
      message: "Verdien må være et gyldig tidspunkt",
    }),
    endDate: z.date({ required_error: "Du må velge en sluttdato" }),
    endTime: z.string().regex(/[0-9]{2}:[0-9]{2}/, {
      message: "Verdien må være et gyldig tidspunkt",
    }),
  })
  .required();

export type CreateEventSchema = z.infer<typeof createEventSchema>;

type CreateEventFormProps = { event?: DeltaEvent };
export default function CreateEventForm({ event }: CreateEventFormProps) {
  const [loading, setLoading] = useState(false);

  const [start, end] = event ? dates(event) : [undefined, undefined];

  const {
    register,
    trigger,
    getValues,
    control,
    formState: { errors },
  } = useForm<CreateEventSchema>({
    defaultValues: !event
      ? undefined
      : ({
          ...event,
          endDate: end,
          startDate: start,
          startTime: format(start!!, "HH:mm"),
          endTime: format(end!!, "HH:mm"),
        } as CreateEventSchema),
    resolver: zodResolver(createEventSchema),
  });

  return (
    <form
      action={async () => {
        const valid = await trigger();
        if (!valid) return;
        setLoading(true);
        if (!event) createAndRedirect(getValues());
        else updateAndRedirect(getValues(), event.id);
        setLoading(false);
      }}
      className="flex flex-col gap-5"
    >
      <TextField
        label="Tittel"
        {...register("title")}
        error={errors.title?.message}
      />
      <TextField
        label="Sted"
        {...register("location")}
        error={errors.location?.message}
      />
      <Textarea
        label="Beskrivelse"
        {...register("description")}
        error={errors.description?.message}
      />
      <div className="flex flex-row flex-wrap justify-left gap-4 pb-0 items-end">
        <EventDatepicker
          name="startDate"
          label="Fra"
          invalidMessage="Du må fylle inn en gyldig startdato"
          requiredMessage="Du må fylle inn en startdato"
          control={control}
          errors={errors}
        />
        <div className="navds-form-field navds-form-field--medium">
          <input
            type="time"
            className="navds-text-field__input w-28"
            {...register("startTime")}
          />
          {errors.startTime && (
            <p className="navds-error-message navds-label">
              {errors.startTime.message}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-row flex-wrap justify-left gap-4 pb-0 items-end">
        <EventDatepicker
          name="endDate"
          label="Til"
          invalidMessage="Du må fylle inn en gyldig sluttdato"
          requiredMessage="Du må fylle inn en sluttdato"
          control={control}
          errors={errors}
        />
        <div className="navds-form-field navds-form-field--medium">
          <input
            type="time"
            className="navds-text-field__input w-28"
            {...register("endTime")}
          />
          {errors.endTime && (
            <p className="navds-error-message navds-label">
              {errors.endTime.message}
            </p>
          )}
        </div>
      </div>
      <Button type="submit" className="w-[19rem] max-w-full" loading={loading}>
        {event ? "Oppdater arrangement" : "Opprett arrangement"}
      </Button>
    </form>
  );
}

async function createAndRedirect(formData: CreateEventSchema) {
  const event = await createEvent(formData);
  window.location.href = `/event/${event.id}`;
}

async function updateAndRedirect(formData: CreateEventSchema, eventId: string) {
  const event = await updateEvent(formData, eventId);
  window.location.href = `/event/${event.id}`;
}

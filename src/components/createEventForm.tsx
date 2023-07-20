"use client";

import {
  Button,
  Textarea,
  TextField,
  Link,
  Checkbox,
  Skeleton,
} from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { createEvent, getEvent, updateEvent } from "@/service/eventActions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import EventDatepicker from "../app/event/new/eventDatepicker";
import { DeltaEvent } from "@/types/event";
import { dates } from "@/service/format";
import { format } from "date-fns";
import { TrashIcon } from "@navikt/aksel-icons";
import { deleteEvent } from "@/service/eventActions";

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
    public: z.boolean(),
  })
  .required();

export type CreateEventSchema = z.infer<typeof createEventSchema>;

type CreateEventFormProps = { eventId?: string };
export default function CreateEventForm({ eventId }: CreateEventFormProps) {
  const [loading, setLoading] = useState(!!eventId);
  const [event, setEvent] = useState(undefined as DeltaEvent | undefined);
  useEffect(() => {
    if (!eventId) return;
    getEvent(eventId)
      .then((e) => setEvent(e.event))
      .then(() => setLoading(false));
  }, [eventId]);

  return loading ? (
    <>
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-full" />
    </>
  ) : (
    <InternalCreateEventForm event={event} />
  );
}

type InternalCreateEventFormProps = { event?: DeltaEvent };
function InternalCreateEventForm({ event }: InternalCreateEventFormProps) {
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
          title: event.title,
          description: event.description,
          location: event.location,
          public: event.public,
          endDate: end!!,
          startDate: start!!,
          startTime: format(start!!, "HH:mm"),
          endTime: format(end!!, "HH:mm"),
        } satisfies CreateEventSchema),
    resolver: zodResolver(createEventSchema),
  });

  return (
    <>
      {event && (
        <span className="flex justify-end">
          <Button
            type="submit"
            variant="danger"
            className="w-fit h-fit font-bold"
            onClick={async () => deleteAndRedirect(event.id)}
          >
            <span className="flex items-center gap-1">
              <TrashIcon /> Slett
            </span>
          </Button>
        </span>
      )}
      <form
        action={async () => {
          const valid = await trigger();
          if (!valid) return;
          if (!event) createAndRedirect(getValues());
          else updateAndRedirect(getValues(), event.id);
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
        <Checkbox {...register("public")}>
          Gjør arrangementet synlig på forsiden
        </Checkbox>
        <div className="flex items-center justify-end gap-4">
          <Link
            className="w-fit h-fit"
            href={event ? `/event/${event.id}` : "/"}
          >
            Avbryt
          </Link>
          <Button type="submit">{event ? "Oppdater" : "Opprett"}</Button>
        </div>
      </form>
    </>
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

async function deleteAndRedirect(eventId: string) {
  await deleteEvent(eventId);
  window.location.href = "/";
}

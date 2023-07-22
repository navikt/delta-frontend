"use client";

import {
  Button,
  Textarea,
  TextField,
  Link,
  Checkbox,
  Skeleton,
  Modal,
  Heading,
  BodyLong,
  DatePicker,
} from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { createEvent, getEvent, updateEvent } from "@/service/eventActions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import EventDatepicker from "../app/event/new/eventDatepicker";
import { DeltaEvent } from "@/types/event";
import { dates } from "@/service/format";
import { format, set } from "date-fns";
import { TrashIcon } from "@navikt/aksel-icons";
import { deleteEvent } from "@/service/eventActions";

function isValidParticipantLimit(limit: string) {
  const limit_int = parseInt(limit);
  return !Number.isNaN(limit_int) && 0 < limit_int && limit_int < 10000;
}

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
    hasParticipantLimit: z.boolean(),
    participantLimit: z.string({
      required_error: "Må velge en antallsbegrensning",
    }),
    signupDeadlineDate: z.date({ required_error: "Du må velge en dato" }),
    signupDeadlineTime: z.string().regex(/[0-9]{2}:[0-9]{2}/, {
      message: "Verdien må være et gyldig tidspunkt",
    }),
  })
  .required()
  .refine((data) => data.endDate >= data.startDate, {
    message: "Sluttdato må være etter startdato",
    path: ["endDate"],
  })
  .refine(
    (data) =>
      data.endDate.getTime() !== data.startDate.getTime() ||
      data.endTime > data.startTime,
    {
      message: "Slutttid må være etter starttid",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => data.signupDeadlineDate.getTime() >= data.startDate.getTime(), {
      message: "Påmeldingsfrist kan ikke være etter startdato",
      path: ["signupDeadlineDate"],
    }
  )
  .refine((data) => isValidParticipantLimit(data.participantLimit), {
    message: "Må være mellom 1 og 9999",
    path: ["participantLimit"],
  });

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
  const [start, end, deadline] = event
    ? dates(event)
    : [undefined, undefined, undefined];
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [hasParticipantLimit, setHasParticipantLimit] = useState(
    (event?.participantLimit || 0) > 0
  );
  const [hasDeadline, setDeadline] = useState(false);

  const {
    register,
    trigger,
    getValues,
    control,
    formState: { errors },
    setValue,
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
          hasParticipantLimit,
          participantLimit: event.participantLimit.toString(),
          signupDeadlineDate: deadline!!,
          signupDeadlineTime: format(deadline!!, "HH:mm"),
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
            onClick={async () => setOpenConfirmation((x) => !x)}
          >
            <span className="flex items-center gap-1">
              <TrashIcon /> Slett
            </span>
          </Button>
        </span>
      )}
      <Modal
        open={openConfirmation}
        aria-label="Slett arrangement modal"
        onClose={() => setOpenConfirmation((x) => !x)}
        closeButton={false}
        aria-labelledby="Slett arrangement modal"
        className="w-4/5 max-w-[30rem] max-h-[50rem]"
      >
        <Modal.Content>
          <Heading spacing level="1" size="large" id="modal-heading">
            {`Slett ${event?.title}?`}
          </Heading>
          <BodyLong spacing>
            {`Er du sikker på at du vil slette ${event?.title}? Dette kan ikke angres.`}
          </BodyLong>
          <div className="flex flex-row justify-end gap-4">
            <Button
              variant="secondary"
              onClick={async () => setOpenConfirmation((x) => !x)}
            >
              Avbryt
            </Button>
            <Button
              variant="danger"
              className="w-fit h-fit font-bold"
              onClick={() => deleteAndRedirect(event?.id!!)}
            >
              Ja, jeg vil slette arrangementet
            </Button>
          </div>
        </Modal.Content>
      </Modal>
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
        <div className="flex flex-col max-w-[21rem]">
          <Checkbox
            {...register("hasParticipantLimit")}
            onChange={() => {
              const x = hasParticipantLimit;
              const invalidInput = !isValidParticipantLimit(
                getValues().participantLimit
              );

              if (x && invalidInput) setValue("participantLimit", "0"); // Maybe use default instead?
              setHasParticipantLimit((x) => !x);
            }}
          >
            Begrens maksimalt antall deltagere
          </Checkbox>
          <TextField
            {...register("participantLimit")}
            className={`${!hasParticipantLimit && "hidden"}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            hideLabel
            label="Maksimalt antall deltagere"
            defaultValue="0"
            error={errors.participantLimit?.message}
          />
        </div>
        <div>
          <Checkbox value="Påmeldingsfrist" onChange={() => {
            const x = hasDeadline;
            setDeadline((x) => !x);

          }}>Spesifiser en påmeldingsfrist</Checkbox>
          <div className={`flex flex-row flex-wrap justify-left gap-4 pb-0 items-end ${!hasDeadline && "hidden"}`}>
            <EventDatepicker
              name="signupDeadlineDate"
              label="Påmeldingsfrist"
              invalidMessage="Du må fylle inn en gyldig påmeldingsfrist"
              requiredMessage="Du må fylle inn en påmeldingsfrist"
              control={control}
              errors={errors}
            />
            <div className="navds-form-field navds-form-field--medium">
              <input
                type="time"
                className="navds-text-field__input w-28"
                {...register("signupDeadlineTime")}
              />
              {errors.signupDeadlineTime && (
                <p className="navds-error-message navds-label">
                  {errors.signupDeadlineTime.message}
                </p>
              )}
            </div>
          </div>
        </div>
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

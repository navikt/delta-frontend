"use client";
import {
  Button,
  Textarea,
  TextField,
  Link,
  Checkbox,
  Switch,
  Skeleton,
  UNSAFE_Combobox,
  Radio,
  RadioGroup,
  CheckboxGroup,
  Alert,
} from "@navikt/ds-react";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import {
  createCategory,
  createEvent,
  getEvent,
  setCategories,
  updateEvent,
} from "@/service/eventActions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import EventDatepicker from "../app/event/new/eventDatepicker";
import {
  Category,
  DeltaEvent,
  EditTypeEnum,
  TemplateDeltaEvent,
} from "@/types/event";
import { midnightDate } from "@/service/format";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { Spraksjekk } from "@/components/library";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { generateOccurrenceDates, RecurrenceFrequency, RecurrenceEndCondition } from "@/service/recurrence";

function isValidParticipantLimit(limit?: string) {
  if (!limit) return false;
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
    startDate: z.date({ error: "Du må velge en startdato" }),
    startTime: z.string().regex(/[0-9]{2}:[0-9]{2}/, {
      message: "Verdien må være et gyldig tidspunkt",
    }),
    endDate: z.date({ error: "Du må velge en sluttdato" }),
    endTime: z.string().regex(/[0-9]{2}:[0-9]{2}/, {
      message: "Verdien må være et gyldig tidspunkt",
    }),
    public: z.boolean(),
    hasParticipantLimit: z.boolean(),
    participantLimit: z.string().optional(),
    hasSignupDeadline: z.boolean(),
    sendNotificationEmail: z.boolean().optional(),
    signupDeadlineDate: z.optional(z.date()),
    signupDeadlineTime: z.string().regex(/(?:^$)|(?:^[0-9]{2}:[0-9]{2}$)/, {
      message: "Verdien må være et gyldig tidspunkt",
    }),
    isRecurring: z.boolean(),
    recurrenceFrequency: z.enum(["weekly", "biweekly", "monthly"]).optional(),
    recurrenceEndType: z.enum(["date", "count"]).optional(),
    recurrenceCount: z.string().optional(),
  })
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
    },
  )
  .refine(
    (data) =>
      !data.hasSignupDeadline ||
      (data.signupDeadlineDate !== undefined &&
        data.signupDeadlineDate <= data.startDate),
    {
      message: "Påmeldingsfrist kan ikke være etter startdato",
      path: ["signupDeadlineDate"],
    },
  )
  .refine(
    (data) =>
      !data.hasSignupDeadline ||
      (data.signupDeadlineDate !== undefined &&
        (data.signupDeadlineDate.getTime() !== data.startDate.getTime() ||
          data.signupDeadlineTime <= data.startTime)),
    {
      message: "Tidspunktet kan ikke være etter starttiden",
      path: ["signupDeadlineTime"],
    },
  )
  .refine(
    (data) =>
      !data.hasParticipantLimit ||
      isValidParticipantLimit(data.participantLimit),
    {
      message: "Må være mellom 1 og 9999",
      path: ["participantLimit"],
    },
  )
  .refine(
    (data) =>
      !data.isRecurring || data.recurrenceFrequency !== undefined,
    {
      message: "Du må velge en frekvens for gjentakelsen",
      path: ["recurrenceFrequency"],
    },
  )
  .refine(
    (data) =>
      !data.isRecurring || data.recurrenceEndType !== undefined,
    {
      message: "Du må velge når gjentakelsen skal avsluttes",
      path: ["recurrenceEndType"],
    },
  )
  .refine(
    (data) =>
      !data.isRecurring ||
      data.recurrenceEndType !== "date" ||
      data.endDate > data.startDate,
    {
      message: "Sluttdato må være etter startdato for gjentakende arrangementer",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      if (!data.isRecurring || data.recurrenceEndType !== "count") return true;
      const count = parseInt(data.recurrenceCount || "");
      return !Number.isNaN(count) && count >= 2 && count <= 52;
    },
    {
      message: "Må være mellom 2 og 52",
      path: ["recurrenceCount"],
    },
  )
  .refine(
    (data) => {
      if (!data.isRecurring || !data.recurrenceFrequency || data.recurrenceEndType !== "count") return true;
      const count = parseInt(data.recurrenceCount || "");
      if (Number.isNaN(count) || count < 2) return true;
      const occurrences = generateOccurrenceDates(
        data.startDate,
        data.recurrenceFrequency,
        { type: "count", count },
      );
      const lastOccurrence = occurrences[occurrences.length - 1];
      return lastOccurrence <= data.endDate;
    },
    {
      message: "Antall gjentakelser overskrider slutt-datoen (Til). Reduser antallet eller flytt slutt-datoen.",
      path: ["recurrenceCount"],
    },
  );

export type CreateEventSchema = z.infer<typeof createEventSchema>;

export type EditType =
  | { type: EditTypeEnum.NEW }
  | { type: EditTypeEnum.EDIT | EditTypeEnum.TEMPLATE; eventId: string };
type CreateEventFormProps = { editType: EditType; allCategories: Category[] };
export default function CreateEventForm({
  editType,
  allCategories,
}: CreateEventFormProps) {
  const [loading, setLoading] = useState(editType.type !== EditTypeEnum.NEW);
  const [richEvent, setRichEvent] = useState<RichEvent>({
    type: EditTypeEnum.NEW,
  });
  const [selectedCategories, _setSelectedCategories] = useState<
    Category[] | undefined
  >(undefined);
  const setSelectedCategories: Dispatch<SetStateAction<Category[]>> = (
    setState: SetStateAction<Category[]>,
  ) =>
    _setSelectedCategories(setState as SetStateAction<Category[] | undefined>);

  useEffect(() => {
    if (editType.type === EditTypeEnum.NEW) return;
    getEvent(editType.eventId)
      .then((e) => {
        let richEvent: RichEvent;
        if (editType.type === EditTypeEnum.EDIT) {
          richEvent = {
            type: EditTypeEnum.EDIT,
            event: e.event,
          };
        } else {
          richEvent = {
            type: EditTypeEnum.TEMPLATE,
            event: {
              title: e.event.title,
              description: e.event.description,
              location: e.event.location,
              public: e.event.public,
              participantLimit: e.event.participantLimit,
            },
          };
        }
        setRichEvent(richEvent);
        setSelectedCategories(e.categories);
      })
      .then(() => setLoading(false));
  }, [editType]);

  return loading ? (
    <>
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-full" />
    </>
  ) : (
    // @ts-ignore
    (<InternalCreateEventForm
      richEvent={richEvent}
      allCategories={allCategories}
      selectedCategories={selectedCategories || []}
      setSelectedCategories={setSelectedCategories}
    />)
  );
}
type RichEvent =
  | { type: EditTypeEnum.EDIT; event: DeltaEvent }
  | { type: EditTypeEnum.TEMPLATE; event: TemplateDeltaEvent }
  | { type: EditTypeEnum.NEW };

type InternalCreateEventFormProps = {
  richEvent: RichEvent;
  selectedCategories: Category[];
  setSelectedCategories: Dispatch<Category[]>;
  allCategories: Category[];
};
function InternalCreateEventForm({
  richEvent,
  selectedCategories,
  setSelectedCategories,
  allCategories,
}: InternalCreateEventFormProps) {
  const [hasParticipantLimit, setHasParticipantLimit] = useState(
    ((richEvent.type !== EditTypeEnum.NEW &&
      richEvent.event.participantLimit) ||
      0) > 0,
  );
  const [hasDeadline, setDeadline] = useState(
    !!(richEvent.type === EditTypeEnum.EDIT && richEvent.event.signupDeadline),
  );

  const [newTags, setNewTags] = useState<string[]>([]);
  const setSelected = (tags: string[]) => {
    const realTags = allCategories.filter((c) => tags.includes(c.name));
    const fakeTags = tags.filter(
      (c) => !realTags.map((c) => c.name).includes(c),
    );
    console.log(fakeTags, realTags);
    setNewTags(fakeTags);
    setSelectedCategories(realTags);
  };
  const options = [...allCategories.map((c) => c.name)];
  const selectedOptions = [
    ...selectedCategories.map((c) => c.name),
    ...newTags,
  ];

  const {
    register,
    trigger,
    getValues,
    control,
    formState: { errors, isSubmitting },
    setValue,
    handleSubmit,
    watch,
  } = useForm<CreateEventSchema>({
    defaultValues:
      richEvent.type === EditTypeEnum.NEW
        ? { public: true, isRecurring: false }
        : richEvent.type === EditTypeEnum.TEMPLATE
          ? {
            title: richEvent.event.title,
            description: richEvent.event.description,
            location: richEvent.event.location,
            public: richEvent.event.public,
            endDate: undefined as unknown as Date, // pls be quiet
            endTime: "",
            startDate: undefined as unknown as Date,
            startTime: "",
            hasParticipantLimit: hasParticipantLimit,
            participantLimit: hasParticipantLimit
              ? richEvent.event.participantLimit.toString()
              : undefined,
            hasSignupDeadline: hasDeadline,
            signupDeadlineDate: undefined,
            signupDeadlineTime: "",
            sendNotificationEmail: true,
            isRecurring: false,
          }
          : {
            title: richEvent.event.title,
            description: richEvent.event.description,
            location: richEvent.event.location,
            public: richEvent.event.public,
            endDate: midnightDate(richEvent.event.endTime!!),
            endTime: format(new Date(richEvent.event.endTime!!), "HH:mm"),
            startDate: midnightDate(richEvent.event.startTime!!),
            startTime: format(new Date(richEvent.event.startTime!!), "HH:mm"),
            hasParticipantLimit: hasParticipantLimit,
            participantLimit: richEvent.event.participantLimit
              ? richEvent.event.participantLimit.toString()
              : undefined,
            hasSignupDeadline: hasDeadline,
            signupDeadlineDate: richEvent.event.signupDeadline
              ? midnightDate(richEvent.event.signupDeadline)
              : undefined,
            signupDeadlineTime: richEvent.event.signupDeadline
              ? format(new Date(richEvent.event.signupDeadline), "HH:mm")
              : "",
            sendNotificationEmail: true,
            isRecurring: false,
          },
    resolver: zodResolver(createEventSchema),
  });

  const [mobilvisning, setMobilvisning] = useState(true)
  const [showPreview, setShowPreview] = useState(false);
  const initialDescription =
    richEvent.type !== EditTypeEnum.NEW
      ? (richEvent.event.description ?? "")
      : ""
  const [dvalue, setDvalue] = useState(initialDescription)

  // Recurrence fields
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency | null>(null);
  const [recurrenceEndType, setRecurrenceEndType] = useState<"date" | "count" | null>(null);

  const watchedStartDate = watch("startDate");
  const watchedEndDate = watch("endDate");
  const watchedRecurrenceCount = watch("recurrenceCount");

  const occurrenceCount = useMemo(() => {
    if (!isRecurring || !recurrenceFrequency || !recurrenceEndType || !watchedStartDate) return 0;
    try {
      const endCondition: RecurrenceEndCondition =
        recurrenceEndType === "date" && watchedEndDate
          ? { type: "date", endDate: watchedEndDate }
          : recurrenceEndType === "count" && watchedRecurrenceCount
            ? { type: "count", count: parseInt(watchedRecurrenceCount) }
            : { type: "count", count: 0 };
      if (endCondition.type === "count" && endCondition.count < 2) return 0;
      return generateOccurrenceDates(watchedStartDate, recurrenceFrequency, endCondition).length;
    } catch {
      return 0;
    }
  }, [isRecurring, recurrenceFrequency, recurrenceEndType, watchedStartDate, watchedEndDate, watchedRecurrenceCount]);

  // Location related fields
  const [showAlert, setShowAlert] = useState(false);

  // Initialize attendance type from categories for templates
  const getInitialAttendanceType = () => {
    if (richEvent.type === EditTypeEnum.TEMPLATE) {
      const categoryNames = selectedCategories.map(c => c.name.toLowerCase());
      if (categoryNames.includes("digitalt")) return "digitalt";
      if (categoryNames.includes("hybrid")) return "hybrid";
      if (categoryNames.includes("fysisk")) return "fysisk";
    }
    return null;
  };

  const [selectedAttendanceType, setSelectedAttendanceType] = useState<string | null>(getInitialAttendanceType());
  const [showLocationField, setShowLocationField] = useState(
    richEvent.type === EditTypeEnum.TEMPLATE &&
    (selectedCategories.some(c => c.name.toLowerCase() === "fysisk") ||
      selectedCategories.some(c => c.name.toLowerCase() === "hybrid"))
  );
  const [showPlatformField, setShowPlatformField] = useState(
    richEvent.type === EditTypeEnum.TEMPLATE &&
    selectedCategories.some(c => c.name.toLowerCase() === "digitalt")
  );

  // Initialize event type from categories for templates
  const getInitialEventType = () => {
    if (richEvent.type === EditTypeEnum.TEMPLATE) {
      const categoryNames = selectedCategories.map(c => c.name.toLowerCase().trim());
      if (categoryNames.includes("sosialt")) return "Sosialt";
      if (categoryNames.includes("kompetanse")) return "Kompetanse";
      if (categoryNames.includes("bedriftidrettslaget")) return "Bedriftidrettslaget";
    }
    return null;
  };

  const [selectedType, setSelectedType] = useState<string | null>(getInitialEventType());


  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        if (richEvent.type === EditTypeEnum.EDIT)
          updateAndRedirect(
            values,
            richEvent.event.id,
            newTags,
            selectedCategories,
          );
        else createAndRedirect(values, newTags, selectedCategories);
      })}
      className="flex flex-col gap-5"
    >
      <TextField
        label="Tittel"
        {...register("title")}
        error={errors.title?.message}
        className="max-w-prose"
      />
      <div className="flex flex-row flex-wrap justify-left gap-4 pb-0 items-end">
        <EventDatepicker
          name="startDate"
          label="Fra"
          invalidMessage="Du må fylle inn en gyldig startdato"
          requiredMessage="Du må fylle inn en startdato"
          control={control}
          errors={errors}
          hideLabel={false}
          onDateSelected={(date) => {
            if (date) {
              console.log("Setting end date to:", date);
              setValue("endDate", date, { shouldValidate: true, shouldDirty: true });
            }
          }}
        />
        <div
          className={`aksel-form-field aksel-form-field--medium ${errors.startTime && "aksel-text-field--error"
            }`}
        >
          <input
            type="time"
            className="aksel-text-field__input w-28"
            {...register("startTime")}
          />
          {errors.startTime && (
            <p className="aksel-error-message aksel-label">
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
          hideLabel={false}
        />
        <div
          className={`aksel-form-field aksel-form-field--medium ${errors.endTime && "aksel-text-field--error"
            }`}
        >
          <input
            type="time"
            className="aksel-text-field__input w-28"
            {...register("endTime")}
          />
          {errors.endTime && (
            <p className="aksel-error-message aksel-label">
              {errors.endTime.message}
            </p>
          )}
        </div>
      </div>

      {richEvent.type !== EditTypeEnum.EDIT && (
        <div className="flex flex-col gap-3">
          <Checkbox
            {...register("isRecurring")}
            onChange={() => {
              const next = !isRecurring;
              setIsRecurring(next);
              if (!next) {
                setRecurrenceFrequency(null);
                setRecurrenceEndType(null);
                setValue("recurrenceFrequency", undefined);
                setValue("recurrenceEndType", undefined);
                setValue("recurrenceCount", undefined);
              }
            }}
          >
            Gjentakende arrangement
          </Checkbox>
          {isRecurring && (
            <div className="flex flex-col gap-4 ml-8">
              <RadioGroup
                legend="Frekvens"
                value={recurrenceFrequency ?? ""}
                onChange={(value: string) => {
                  setRecurrenceFrequency(value as RecurrenceFrequency);
                  setValue("recurrenceFrequency", value as RecurrenceFrequency);
                }}
                error={errors.recurrenceFrequency?.message}
              >
                <Radio value="weekly">Ukentlig</Radio>
                <Radio value="biweekly">Annenhver uke</Radio>
                <Radio value="monthly">Månedlig</Radio>
              </RadioGroup>
              <RadioGroup
                legend="Avslutt gjentakelse"
                value={recurrenceEndType ?? ""}
                onChange={(value: string) => {
                  setRecurrenceEndType(value as "date" | "count");
                  setValue("recurrenceEndType", value as "date" | "count");
                }}
                error={errors.recurrenceEndType?.message}
              >
                <Radio value="date">Til slutt-dato (Til-datoen ovenfor)</Radio>
                <Radio value="count">Etter et antall ganger</Radio>
              </RadioGroup>
              {recurrenceEndType === "count" && (
                <TextField
                  label="Antall ganger"
                  description="Totalt antall arrangementer (2–52)"
                  {...register("recurrenceCount")}
                  error={errors.recurrenceCount?.message}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="max-w-[10rem]"
                />
              )}
              {occurrenceCount > 0 && (
                <Alert variant={occurrenceCount >= 2 ? "info" : "warning"} className="max-w-prose">
                  {occurrenceCount >= 2
                    ? `Det vil bli opprettet ${occurrenceCount} arrangementer.`
                    : "Gjentakelsesinnstillingene gir bare ett arrangement. Juster sluttdato eller frekvens."}
                </Alert>
              )}
            </div>
          )}
        </div>
      )}

      {richEvent.type !== EditTypeEnum.EDIT ? (
        <>
          <RadioGroup
            legend="Oppmøte"
            value={selectedAttendanceType ?? undefined}
            key={`attendance-${selectedAttendanceType || 'none'}`}
            onChange={(value) => {
              setSelectedAttendanceType(value);
              setShowLocationField(value === "fysisk" || value === "hybrid");
              setShowPlatformField(value === "digitalt");
              if (value === "digitalt") {
                setSelected([...selectedOptions, "digitalt"]);
              } else if (value === "hybrid") {
                setSelected([...selectedOptions, "hybrid"]);
                setShowAlert(true);
              } else if (value === "fysisk") {
                setSelected([...selectedOptions, "fysisk"]);
              }
            }}
          >
            <Radio value="fysisk">Fysisk</Radio>
            <Radio value="digitalt">Digitalt</Radio>
            <Radio value="hybrid">Hybrid</Radio>
          </RadioGroup>

          {showPlatformField && (
            <RadioGroup
              legend="Platform"
              onChange={(value) => {
                setShowAlert(true);
                if (value === "Teams") {
                  setValue("location", "Teams");
                } else if (value === "Zoom") {
                  setValue("location", "Zoom");
                } else if (value === "Vimeo") {
                  setValue("location", "Vimeo");
                } else if (value === "Annet") {
                  setValue("location", "Digitalt");
                }
              }}
            >
              <Radio value="Teams">Teams</Radio>
              <Radio value="Zoom">Zoom</Radio>
              <Radio value="Vimeo">Vimeo</Radio>
              <Radio value="Annet">Annet</Radio>
            </RadioGroup>
          )}

          {showAlert && (
            <Alert className="max-w-prose" variant="info">Vi anbefaler at du limer inn lenken til Teams/Zoom/etc. på bunnen av beskrivelsen til arrangementet.</Alert>
          )}

          {showLocationField && (
            <TextField
              label="Sted"
              {...register("location")}
              error={errors.location?.message}
              className="max-w-prose"
            />
          )}
        </>
      ) : (
        <>
          <TextField
            label="Sted"
            {...register("location")}
            error={errors.location?.message}
          />
        </>
      )}

      {richEvent.type !== EditTypeEnum.EDIT && (
        <>
          <RadioGroup
            legend="Type arrangement"
            value={selectedType ?? undefined}
            key={`eventtype-${selectedType || 'none'}`}
            onChange={(value) => {
              setSelectedType(value);
              if (value === "Sosialt") {
                setSelected([...selectedOptions, "sosialt "]);
              } else if (value === "Kompetanse") {
                setSelected([...selectedOptions, "kompetanse"]);
              } else if (value === "Bedriftidrettslaget") {
                setSelected([...selectedOptions, "bedriftidrettslaget"]);
              }
            }}
          >
            <Radio value="Sosialt">Sosialt</Radio>
            <Radio value="Kompetanse">Kompetanse</Radio>
            <Radio value="Bedriftidrettslaget">Bedriftidrettslaget</Radio>
          </RadioGroup>

          {selectedType === "Kompetanse" && (
            <CheckboxGroup
              legend="Tilknyttet Fagtorsdag?"
              onChange={(values: string[]) => {
                if (values.includes("Fagtorsdag")) {
                  setSelected([...selectedOptions, "fagtorsdag"]);
                }
              }}
            >
              <Checkbox value="Fagtorsdag">Ja, tilknyttet Fagtorsdag</Checkbox>
            </CheckboxGroup>
          )}
        </>
      )}

      <div
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <UNSAFE_Combobox
          label="Kategorier (valgfritt)"
          className="max-w-prose"
          shouldAutocomplete
          allowNewValues
          isMultiSelect
          options={options}
          selectedOptions={selectedOptions}
          onToggleSelected={(option, isSelected) => {
            isSelected
              ? setSelected([...selectedOptions, option])
              : setSelected(selectedOptions.filter((c) => c !== option));
          }}
        />
      </div>
      <div className="max-w-prose">
        <div className="flex items-center justify-between mb-1">
          <span className="aksel-label">Beskrivelse</span>
          <Switch
            size="small"
            checked={showPreview}
            onChange={() => setShowPreview((v) => !v)}
          >
            Forhåndsvisning
          </Switch>
        </div>
        {showPreview ? (
          <div className="border border-ax-neutral-400 rounded p-3 min-h-[8rem] bg-white">
            {dvalue ? (
              <MarkdownRenderer>{dvalue}</MarkdownRenderer>
            ) : (
              <span className="text-ax-neutral-500 italic">
                Ingen beskrivelse ennå
              </span>
            )}
          </div>
        ) : (
          <Textarea
            label="Beskrivelse"
            hideLabel
            {...register("description")}
            error={errors.description?.message}
            onChange={(e) => setDvalue(e.target.value)}
          />
        )}
        {errors.description?.message && showPreview && (
          <p className="aksel-error-message aksel-label mt-1">
            {errors.description.message}
          </p>
        )}
        <div style={{ display: "block", marginBottom: "0px" }}>
          <div style={{ marginTop: "0px", float: "right" }}>
            <Switch onChange={() => setMobilvisning(!mobilvisning)}
              checked={mobilvisning}>Språkhjelp</Switch>
          </div>
        </div>
        <div style={{ marginBottom: "0px", display: "block" }}>
          {mobilvisning == true && (
            <>
              <Spraksjekk value={dvalue} open={true} />
            </>)
          }
        </div>
      </div>
      <Checkbox {...register("public")}>
        Publiser arrangementet på forsiden til Delta
      </Checkbox>
      <div className="flex flex-col max-w-[21rem]">
        <Checkbox
          {...register("hasParticipantLimit")}
          onChange={() => {
            const x = hasParticipantLimit;
            const invalidInput = !isValidParticipantLimit(
              getValues().participantLimit,
            );

            if (x && invalidInput) setValue("participantLimit", undefined);
            setHasParticipantLimit((x) => !x);
          }}
        >
          Begrens maksimalt antall deltakere
        </Checkbox>
        <TextField
          {...register("participantLimit")}
          className={`${!hasParticipantLimit && "hidden"}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          hideLabel
          label="Maksimalt antall deltagere"
          error={errors.participantLimit?.message}
        />
      </div>
      <div>
        <Checkbox
          {...register("hasSignupDeadline")}
          onChange={() => {
            setDeadline((x) => !x);
          }}
        >
          Spesifiser en påmeldingsfrist
        </Checkbox>
        <div
          className={`flex flex-row flex-wrap justify-left gap-4 pb-0 items-end ${!hasDeadline && "hidden"
            }`}
        >
          <EventDatepicker
            name="signupDeadlineDate"
            label="Påmeldingsfrist"
            invalidMessage="Du må fylle inn en gyldig påmeldingsfrist"
            requiredMessage="Du må fylle inn en påmeldingsfrist"
            control={control}
            errors={errors}
            hideLabel={true}
          />
          <div
            className={`aksel-form-field aksel-form-field--medium ${errors.signupDeadlineDate && "aksel-text-field--error"
              }`}
          >
            <input
              type="time"
              className="aksel-text-field__input w-28"
              {...register("signupDeadlineTime")}
            />
            {errors.signupDeadlineTime && (
              <p className="aksel-error-message aksel-label">
                {errors.signupDeadlineTime.message}
              </p>
            )}
          </div>
        </div>
      </div>
      {richEvent.type === EditTypeEnum.EDIT && (
        <div>
          <Checkbox {...register("sendNotificationEmail")}>
            Send e-post til deltakere ved endringer
          </Checkbox>
        </div>
      )}
      <div className="mt-6 mb-12 flex items-center gap-4">
        {/*              <Link
                  className="w-fit h-fit"
                  href={
                      richEvent.type === EditTypeEnum.EDIT
                          ? `/event/${richEvent.event.id}`
                          : "/"
                  }
              >
                  Avbryt
              </Link>*/}
        <Button type="submit" loading={isSubmitting}>
          {richEvent.type === EditTypeEnum.EDIT ? "Oppdater" : "Opprett"}
        </Button>
      </div>
    </form>
  );
}

async function createAndRedirect(
  formData: CreateEventSchema,
  newTags: string[],
  categories: Category[],
) {
  const newCategories = newTags.length
    ? await Promise.all(newTags.map((c) => createCategory(c)))
    : [];
  const allCategoryIds = categories.concat(newCategories).map((c) => c.id);

  if (
    formData.isRecurring &&
    formData.recurrenceFrequency &&
    formData.recurrenceEndType
  ) {
    const endCondition: RecurrenceEndCondition =
      formData.recurrenceEndType === "date"
        ? { type: "date", endDate: formData.endDate }
        : { type: "count", count: parseInt(formData.recurrenceCount!) };

    const occurrences = generateOccurrenceDates(
      formData.startDate,
      formData.recurrenceFrequency,
      endCondition,
    );

    const deadlineOffset =
      formData.hasSignupDeadline && formData.signupDeadlineDate
        ? differenceInCalendarDays(formData.signupDeadlineDate, formData.startDate)
        : 0;

    let firstEventId: string | null = null;
    for (const occurrenceDate of occurrences) {
      const occurrenceFormData: CreateEventSchema = {
        ...formData,
        startDate: occurrenceDate,
        endDate: occurrenceDate,
        signupDeadlineDate:
          formData.hasSignupDeadline && formData.signupDeadlineDate
            ? addDays(occurrenceDate, deadlineOffset)
            : formData.signupDeadlineDate,
      };
      const { event } = await createEvent(occurrenceFormData);
      await setCategories(event.id, allCategoryIds);
      if (!firstEventId) firstEventId = event.id;
    }
    window.location.href = `/event/${firstEventId}`;
  } else {
    const { event } = await createEvent(formData);
    await setCategories(event.id, allCategoryIds);
    window.location.href = `/event/${event.id}`;
  }
}

async function updateAndRedirect(
  formData: CreateEventSchema,
  eventId: string,
  newTags: string[],
  categories: Category[],
) {
  const newCategories = newTags.length
    ? await Promise.all(newTags.map((c) => createCategory(c)))
    : [];
  await setCategories(
    eventId,
    categories.concat(newCategories).map((c) => c.id),
  );

  const { event } = await updateEvent(formData, eventId);
  window.location.href = `/event/${event.id}`;
}

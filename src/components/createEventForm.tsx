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
  Label,
} from "@navikt/ds-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
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
  RecurrenceFrequency,
  RecurringSeriesSummary,
  EditScope,
  TemplateDeltaEvent,
} from "@/types/event";
import { midnightDate } from "@/service/format";
import { format } from "date-fns";
import { Spraksjekk } from "@/components/library";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import EditScopeModal from "@/components/editScopeModal";

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
    isRecurring: z.boolean().optional(),
    recurrenceFrequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]).optional(),
    recurrenceUntilDate: z.optional(z.date()),
    signupDeadlineOffsetDays: z.string().optional(),
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
      data.isRecurring ||
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
      data.isRecurring ||
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
      !data.isRecurring ||
      data.recurrenceFrequency !== undefined,
    {
      message: "Du må velge en frekvens",
      path: ["recurrenceFrequency"],
    },
  )
  .refine(
    (data) =>
      !data.isRecurring ||
      data.recurrenceUntilDate !== undefined,
    {
      message: "Du må velge en sluttdato for gjentakelsen",
      path: ["recurrenceUntilDate"],
    },
  )
  .refine(
    (data) =>
      !data.isRecurring ||
      !data.recurrenceUntilDate ||
      !data.startDate ||
      data.recurrenceUntilDate > data.startDate,
    {
      message: "Sluttdato for gjentakelse må være etter startdato",
      path: ["recurrenceUntilDate"],
    },
  )
  .refine(
    (data) =>
      !data.isRecurring ||
      !data.hasSignupDeadline ||
      (data.signupDeadlineOffsetDays !== undefined &&
        data.signupDeadlineOffsetDays !== "" &&
        !Number.isNaN(parseInt(data.signupDeadlineOffsetDays)) &&
        parseInt(data.signupDeadlineOffsetDays) >= 1 &&
        parseInt(data.signupDeadlineOffsetDays) <= 365),
    {
      message: "Må være mellom 1 og 365 dager",
      path: ["signupDeadlineOffsetDays"],
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
            recurringSeries: e.recurringSeries,
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
  | { type: EditTypeEnum.EDIT; event: DeltaEvent; recurringSeries?: RecurringSeriesSummary }
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

  const isEditingRecurring =
    richEvent.type === EditTypeEnum.EDIT && !!richEvent.recurringSeries;
  const [isRecurring, setIsRecurring] = useState(isEditingRecurring);
  const [openEditScopeModal, setOpenEditScopeModal] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<CreateEventSchema | null>(null);

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
    handleSubmit
  } = useForm<CreateEventSchema>({
    defaultValues:
      richEvent.type === EditTypeEnum.NEW
        ? { public: true }
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
            sendNotificationEmail: true
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
            isRecurring: !!richEvent.recurringSeries,
            recurrenceFrequency: richEvent.recurringSeries?.frequency,
            recurrenceUntilDate: richEvent.recurringSeries
              ? new Date(richEvent.recurringSeries.untilDate)
              : undefined,
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
        if (richEvent.type === EditTypeEnum.EDIT) {
          if (isEditingRecurring) {
            setPendingFormValues(values);
            setOpenEditScopeModal(true);
          } else {
            updateAndRedirect(
              values,
              richEvent.event.id,
              newTags,
              selectedCategories,
            );
          }
        } else {
          createAndRedirect(values, newTags, selectedCategories);
        }
      })}
      className="flex flex-col gap-5"
    >
      <TextField
        label="Tittel"
        {...register("title")}
        error={errors.title?.message}
        className="max-w-prose"
        required
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
          required
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
          required
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
              required
            />
          )}
        </>
      ) : (
        <>
          <TextField
            label="Sted"
            {...register("location")}
            error={errors.location?.message}
            required
          />
        </>
      )}

      {richEvent.type !== EditTypeEnum.EDIT && (
        <>
          <RadioGroup
            legend="Type arrangement (valgfritt)"
            value={selectedType ?? undefined}
            key={`eventtype-${selectedType || 'none'}`}
            onChange={(value) => {
              setSelectedType(value);
              const typeCategories = ["sosialt ", "kompetanse", "bedriftidrettslaget", "fagtorsdag"];
              const base = selectedOptions.filter((o) => !typeCategories.includes(o));
              if (value === "Sosialt") {
                setSelected([...base, "sosialt "]);
              } else if (value === "Kompetanse") {
                setSelected([...base, "kompetanse"]);
              } else if (value === "Bedriftidrettslaget") {
                setSelected([...base, "bedriftidrettslaget"]);
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
          <Label htmlFor="description">
            Beskrivelse <span className="text-ax-text-danger" aria-hidden="true">*</span>
          </Label>
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
        {hasDeadline && isRecurring ? (
          <div className="flex flex-row items-end gap-2 mt-2">
            <TextField
              {...register("signupDeadlineOffsetDays")}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              label="Påmeldingsfrist"
              hideLabel
              className="w-20"
              error={errors.signupDeadlineOffsetDays?.message}
            />
            <span className="pb-3">dager før start</span>
          </div>
        ) : (
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
        )}
      </div>
      {richEvent.type !== EditTypeEnum.EDIT && (
        <div>
          <Checkbox
            checked={isRecurring}
            onChange={() => {
              const next = !isRecurring;
              setIsRecurring(next);
              setValue("isRecurring", next);
              if (!next) {
                setValue("recurrenceFrequency", undefined);
                setValue("recurrenceUntilDate", undefined);
              }
            }}
          >
            Gjentakende arrangement
          </Checkbox>
          {isRecurring && (
            <div className="flex flex-col gap-4 mt-3 ml-7">
              <RadioGroup
                legend="Frekvens"
                value={getValues("recurrenceFrequency") ?? ""}
                onChange={(value: RecurrenceFrequency) => {
                  setValue("recurrenceFrequency", value, { shouldValidate: true });
                }}
                error={errors.recurrenceFrequency?.message}
              >
                <Radio value="WEEKLY">Ukentlig</Radio>
                <Radio value="BIWEEKLY">Annenhver uke</Radio>
                <Radio value="MONTHLY">Månedlig</Radio>
              </RadioGroup>
              <EventDatepicker
                name="recurrenceUntilDate"
                label="Gjenta til"
                invalidMessage="Du må fylle inn en gyldig dato"
                requiredMessage="Du må velge en sluttdato for gjentakelsen"
                control={control}
                errors={errors}
                hideLabel={false}
              />
            </div>
          )}
        </div>
      )}
      {richEvent.type === EditTypeEnum.EDIT && isEditingRecurring && (
        <div>
          <Checkbox
            checked={isRecurring}
            onChange={() => {
              const next = !isRecurring;
              setIsRecurring(next);
              setValue("isRecurring", next);
              if (!next) {
                setValue("recurrenceFrequency", undefined);
                setValue("recurrenceUntilDate", undefined);
              }
            }}
          >
            Gjentakende arrangement
          </Checkbox>
          {isRecurring && (
            <div className="flex flex-col gap-4 mt-3 ml-7">
              <EventDatepicker
                name="recurrenceUntilDate"
                label="Gjenta til"
                invalidMessage="Du må fylle inn en gyldig dato"
                requiredMessage="Du må velge en sluttdato for gjentakelsen"
                control={control}
                errors={errors}
                hideLabel={false}
              />
            </div>
          )}
        </div>
      )}
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
      {isEditingRecurring && richEvent.type === EditTypeEnum.EDIT && richEvent.recurringSeries && (
        <EditScopeModal
          open={openEditScopeModal}
          onClose={() => {
            setOpenEditScopeModal(false);
            setPendingFormValues(null);
          }}
          onConfirm={async (scope) => {
            setOpenEditScopeModal(false);
            if (pendingFormValues) {
              updateAndRedirect(
                pendingFormValues,
                richEvent.event.id,
                newTags,
                selectedCategories,
                scope,
              );
            }
          }}
          title="Endre gjentakende arrangement"
          description="Vil du endre kun dette arrangementet, eller dette og alle fremtidige i serien?"
          confirmLabel="Lagre endringer"
          availableScopes={richEvent.recurringSeries.editableScopes}
        />
      )}
    </form>
  );
}

async function createAndRedirect(
  formData: CreateEventSchema,
  newTags: string[],
  categories: Category[],
) {
  const { event } = await createEvent(formData);

  const newCategories = newTags.length
    ? await Promise.all(newTags.map((c) => createCategory(c)))
    : [];
  await setCategories(
    event.id,
    categories.concat(newCategories).map((c) => c.id),
  );
  window.location.href = `/event/${event.id}`;
}

async function updateAndRedirect(
  formData: CreateEventSchema,
  eventId: string,
  newTags: string[],
  categories: Category[],
  editScope?: EditScope,
) {
  const newCategories = newTags.length
    ? await Promise.all(newTags.map((c) => createCategory(c)))
    : [];
  await setCategories(
    eventId,
    categories.concat(newCategories).map((c) => c.id),
  );

  const { event } = await updateEvent(formData, eventId, editScope);
  window.location.href = `/event/${event.id}`;
}

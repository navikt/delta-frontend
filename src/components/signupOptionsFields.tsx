"use client";

import { PlusIcon, TrashIcon } from "@navikt/aksel-icons";
import { Box, Button, Checkbox, Fieldset, HStack, TextField, VStack } from "@navikt/ds-react";
import {
  MAX_SIGNUP_OPTIONS,
  newDraft,
  type SignupOptionDraft,
  type SignupOptionDraftErrors,
} from "@/service/signupOptions";

/** Organizer fields for signup options: one row per option with name, seat limit and wait list. */
export default function SignupOptionsFields({
  drafts,
  onChange,
  errors,
}: {
  drafts: SignupOptionDraft[];
  onChange: (drafts: SignupOptionDraft[]) => void;
  errors: SignupOptionDraftErrors | null;
}) {
  const update = (id: string, patch: Partial<SignupOptionDraft>) =>
    onChange(drafts.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft)));

  return (
    <Fieldset
      legend="Påmeldingsalternativer"
      description="Deltakerne velger ett alternativ når de melder seg på. La antall plasser stå tomt for ubegrenset."
      error={errors?.group}
      errorPropagation={false}
    >
      <VStack as="ol" gap="space-16">
        {drafts.map((draft, index) => {
          const rowErrors = errors?.rows[draft.id];
          return (
            <Box
              as="li"
              key={draft.id}
              padding="space-16"
              borderRadius="8"
              borderWidth="1"
              borderColor="neutral-subtle"
            >
              <VStack gap="space-12">
                <HStack gap="space-16" align="start" wrap>
                  <TextField
                    label={`Navn på alternativ ${index + 1}`}
                    value={draft.label}
                    maxLength={100}
                    onChange={(e) => update(draft.id, { label: e.target.value })}
                    error={rowErrors?.label}
                    className="min-w-0 grow basis-60"
                  />
                  <TextField
                    label="Antall plasser"
                    value={draft.limit}
                    inputMode="numeric"
                    onChange={(e) => update(draft.id, { limit: e.target.value })}
                    error={rowErrors?.limit}
                    className="w-32"
                  />
                </HStack>
                <HStack gap="space-16" justify="space-between" align="center" wrap>
                  <Checkbox
                    checked={draft.waitlistEnabled}
                    onChange={(e) => update(draft.id, { waitlistEnabled: e.target.checked })}
                  >
                    Tilby venteliste
                  </Checkbox>
                  <Button
                    type="button"
                    variant="tertiary"
                    data-color="neutral"
                    size="small"
                    icon={<TrashIcon aria-hidden />}
                    onClick={() => onChange(drafts.filter((d) => d.id !== draft.id))}
                  >
                    Fjern<span className="sr-only"> {draft.label.trim() || `alternativ ${index + 1}`}</span>
                  </Button>
                </HStack>
              </VStack>
            </Box>
          );
        })}
      </VStack>
      {drafts.length < MAX_SIGNUP_OPTIONS && (
        <div>
          <Button
            type="button"
            variant="secondary"
            size="small"
            icon={<PlusIcon aria-hidden />}
            onClick={() => onChange([...drafts, newDraft(crypto.randomUUID())])}
          >
            Legg til alternativ
          </Button>
        </div>
      )}
    </Fieldset>
  );
}

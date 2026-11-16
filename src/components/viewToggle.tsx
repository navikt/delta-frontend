"use client";

import { Hide, Select, Show, ToggleGroup } from "@navikt/ds-react";
import type { ReactNode } from "react";

export type ViewToggleOption = {
  value: string;
  /** Rich label for the toggle button, e.g. with a count badge. Defaults to `text`. */
  label?: ReactNode;
  /** Plain text used by the Select fallback on narrow screens. */
  text: string;
};

/**
 * Filters a list between views. Aksel recommends ToggleGroup for filtering (not Tabs) and a Select
 * when the group does not fit, so narrow screens get a Select below the `above` breakpoint.
 */
export default function ViewToggle({ label, value, options, onChange, controls, above = "md" }: {
  label: string;
  value: string;
  options: ViewToggleOption[];
  onChange: (value: string) => void;
  /** id of the results container, since it does not directly follow the toggle in the DOM. */
  controls?: string;
  above?: "sm" | "md" | "lg";
}) {
  return (
    <>
      <Show above={above}>
        <ToggleGroup size="small" aria-label={label} aria-controls={controls} value={value} onChange={onChange}>
          {options.map(option => (
            <ToggleGroup.Item key={option.value} value={option.value} label={option.label ?? option.text} />
          ))}
        </ToggleGroup>
      </Show>
      <Hide above={above}>
        <Select label={label} hideLabel size="small" aria-controls={controls} value={value}
          onChange={event => onChange(event.target.value)}>
          {options.map(option => <option key={option.value} value={option.value}>{option.text}</option>)}
        </Select>
      </Hide>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  RadioGroup,
  Radio,
  Button,
  Heading,
  BodyLong,
} from "@navikt/ds-react";
import { EditScope } from "@/types/event";

const scopeLabels: Record<EditScope, string> = {
  SINGLE: "Kun dette arrangementet",
  UPCOMING: "Dette og fremtidige arrangementer",
};

interface EditScopeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (scope: EditScope) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  availableScopes: EditScope[];
}

export default function EditScopeModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Bekreft",
  confirmVariant = "primary",
  availableScopes,
}: EditScopeModalProps) {
  const defaultScope = availableScopes.includes("SINGLE")
    ? "SINGLE"
    : availableScopes[0];

  const [selectedScope, setSelectedScope] = useState<EditScope>(defaultScope);

  useEffect(() => {
    if (open) {
      setSelectedScope(defaultScope);
    }
  }, [open, defaultScope]);

  if (availableScopes.length === 0) {
    return null;
  }

  const hasSingleOption = availableScopes.length === 1;

  return (
    <Modal open={open} onClose={onClose} header={{ heading: title }}>
      <Modal.Body>
        <BodyLong spacing>{description}</BodyLong>

        {hasSingleOption ? (
          <BodyLong>
            <strong>{scopeLabels[availableScopes[0]]}</strong>
          </BodyLong>
        ) : (
          <RadioGroup
            legend="Velg omfang"
            value={selectedScope}
            onChange={(value: EditScope) => setSelectedScope(value)}
          >
            {availableScopes.map((scope) => (
              <Radio key={scope} value={scope}>
                {scopeLabels[scope]}
              </Radio>
            ))}
          </RadioGroup>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant={confirmVariant} onClick={() => onConfirm(selectedScope)}>
          {confirmLabel}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

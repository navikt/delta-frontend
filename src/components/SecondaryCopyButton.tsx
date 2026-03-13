"use client";

import { CopyButton } from "@navikt/ds-react";
import type { ComponentProps } from "react";

type SecondaryCopyButtonProps = ComponentProps<typeof CopyButton>;

export default function SecondaryCopyButton({
  className,
  ...props
}: SecondaryCopyButtonProps) {
  const combinedClassName = className
    ? `delta-secondary-copybutton ${className}`
    : "delta-secondary-copybutton";

  return <CopyButton {...props} className={combinedClassName} />;
}

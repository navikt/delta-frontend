"use client";

import type { User } from "@/auth/token";
import { InternalHeader } from "@navikt/ds-react";

type HeaderProps = { user: User };
export default function Header({ user }: HeaderProps) {
  return (
    <InternalHeader className="flex justify-between flex-grow-0">
      <InternalHeader.Title as="h1" className="whitespace-nowrap">
        Delta Δ
      </InternalHeader.Title>
      <InternalHeader.User name={`${user.firstName} ${user.lastName}`} />
    </InternalHeader>
  );
}

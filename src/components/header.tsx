"use client";

import type { User } from "@/types/user";
import {
  BulletListIcon,
  PencilWritingIcon,
  PlusIcon,
} from "@navikt/aksel-icons";
import { Dropdown, InternalHeader } from "@navikt/ds-react";
import Link from "next/link";

type HeaderProps = { user?: User };
export default function Header({ user }: HeaderProps) {
  return (
    <InternalHeader className="flex justify-between">
      <InternalHeader.Title as={Link} className="whitespace-nowrap" href="/">
        Delta Δ
      </InternalHeader.Title>
      <div className="flex">
        <InternalHeader.Button as={Link} href="/event/new">
          Nytt arrangement
          <PencilWritingIcon className="text-xl" title="Opprett arrangement" />
        </InternalHeader.Button>
      </div>
    </InternalHeader>
  );
}

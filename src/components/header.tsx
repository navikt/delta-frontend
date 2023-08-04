"use client";

import {
  ArrowCirclepathIcon,
  CheckmarkCircleIcon,
  ChevronDownIcon,
  MenuHamburgerIcon,
  PencilIcon,
  PlusIcon,
} from "@navikt/aksel-icons";
import { Button, Dropdown } from "@navikt/ds-react";
import Link from "next/link";

export default function Header() {
  const linkButton =
    "flex items-center no-underline text-text-subtle bg-transparent hover:bg-border-subtle-hover navds-button navds-button--primary navds-button--medium";
  return (
    <header className="flex pt-3 z-10 items-center w-full max-w-[80rem] m-auto">
      <div className="flex items-stretch">
        <Link className={linkButton} href="/">
          <span className="text-2xl whitespace-nowrap">Δ Delta</span>
        </Link>
        <div className="w-1 border-r-[1px] border-border-subtle border-solid"></div>
        <div className="w-1 border-l-[1px] border-border-subtle border-solid"></div>
      </div>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center w-full">
          <Link href="/joined-events" className={linkButton}>
            <CheckmarkCircleIcon fontSize="1.5rem" />
            Påmeldte
          </Link>
        </div>
        <div className="flex flex-grow">
          <Link href="/my-events" className={linkButton}>
            <PencilIcon fontSize="1.5rem" />
            <span className="whitespace-nowrap">Arrangert av meg</span>
          </Link>
          <Link className={linkButton} href="/event/new">
            <PlusIcon fontSize="1.5rem" />
            <span className="whitespace-nowrap">Opprett nytt arrangement</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

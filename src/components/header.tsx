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
  return (
    <header className="flex flex-row pt-3 z-10 gap-6 items-center justify-between w-full md:px-6 max-w-[80rem] m-auto">
      <Link
        className="flex items-center no-underline text-text-subtle"
        href="/"
      >
        <span className="w-fit flex gap-2 items-center flex-row whitespace-nowrap text-3xl text-text-subtle bg-transparent hover:bg-border-subtle-hover navds-button navds-button--primary navds-button--medium">
          Δ Delta
        </span>
      </Link>
      <div className="flex">
        <Link
          className="flex items-center no-underline text-text-subtle "
          href="/event/new"
        >
          <span className="flex items-center text-text-subtle bg-transparent hover:bg-border-subtle-hover navds-button navds-button--primary navds-button--medium">
            <PlusIcon fontSize="1.5rem" /> Opprett nytt arrangement
          </span>
        </Link>
        <Dropdown>
          <Button
            as={Dropdown.Toggle}
            className="bg-transparent text-text-subtle hover:bg-border-subtle-hover"
          >
            <div className="flex items-center gap-2 font-normal">
              <>Mine arrangementer</>
              <ChevronDownIcon />
            </div>
          </Button>
          <Dropdown.Menu>
            <Dropdown.Menu.GroupedList>
              <Dropdown.Menu.GroupedList.Item
                as={Link}
                href="/joined-events"
                className="no-underline"
              >
                <CheckmarkCircleIcon />
                Påmeldte
              </Dropdown.Menu.GroupedList.Item>
              <Dropdown.Menu.GroupedList.Item
                as={Link}
                href="/my-events"
                className="no-underline"
              >
                <PencilIcon />
                Arrangert av meg
              </Dropdown.Menu.GroupedList.Item>
            </Dropdown.Menu.GroupedList>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
}

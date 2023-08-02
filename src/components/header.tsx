"use client";

import { MenuHamburgerIcon } from "@navikt/aksel-icons";
import { Button, Dropdown } from "@navikt/ds-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex flex-row w-full pt-3 z-10">
      <div className="flex flex-row">
        <Dropdown>
          <Button
            as={Dropdown.Toggle}
            className="bg-transparent hover:bg-blue-300 mx-3"
            aria-label="Meny"
          >
            <span className="flex flex-col text-text-default items-center">
              <MenuHamburgerIcon
                color="black"
                fontSize="1.5rem"
                aria-label="Meny ikon"
              />
              Meny
            </span>
          </Button>
          <Dropdown.Menu>
            <Dropdown.Menu.GroupedList>
              <Dropdown.Menu.GroupedList.Heading>
                Arrangementer
              </Dropdown.Menu.GroupedList.Heading>
              <Dropdown.Menu.GroupedList.Item
                as={Link}
                href="/event/new"
                className="no-underline"
              >
                Opprett nytt arrangement
              </Dropdown.Menu.GroupedList.Item>
              <Dropdown.Menu.GroupedList.Item
                as={Link}
                href="/my-events"
                className="no-underline"
              >
                Se mine arrangementer
              </Dropdown.Menu.GroupedList.Item>
            </Dropdown.Menu.GroupedList>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <Link
        className="flex items-center no-underline text-text-subtle "
        href="/"
      >
        <span className="w-fit flex gap-2 items-center flex-row whitespace-nowrap text-3xl ">
          Δ Delta
        </span>
      </Link>
    </header>
  );
}

"use client";

import type { User } from "@/types/user";
import { MenuGridIcon } from "@navikt/aksel-icons";
import { Dropdown, InternalHeader } from "@navikt/ds-react";
import Link from "next/link";

type HeaderProps = { user: User };
export default function Header({ user }: HeaderProps) {
  return (
    <InternalHeader className="flex justify-between">
      <InternalHeader.Title as={Link} className="whitespace-nowrap" href="/">
        Delta Δ
      </InternalHeader.Title>
      <div className="flex">
        <Dropdown>
          <InternalHeader.Button as={Dropdown.Toggle}>
            <MenuGridIcon className="text-[1.5rem]" title="Arrangementer" />
          </InternalHeader.Button>
          <Dropdown.Menu>
            <Dropdown.Menu.GroupedList>
              <Dropdown.Menu.GroupedList.Heading>
                Arrangementer
              </Dropdown.Menu.GroupedList.Heading>
              <Dropdown.Menu.GroupedList.Item as={Link} href="/event/new">
                Nytt arrangement
              </Dropdown.Menu.GroupedList.Item>
              <Dropdown.Menu.GroupedList.Item>
                Mine arrangemeneter
              </Dropdown.Menu.GroupedList.Item>
            </Dropdown.Menu.GroupedList>
          </Dropdown.Menu>
        </Dropdown>
        <InternalHeader.User name={`${user.firstName} ${user.lastName}`} />
      </div>
    </InternalHeader>
  );
}

"use client";

import type { User } from "@/auth/token";
import { MenuGridIcon } from "@navikt/aksel-icons";
import { Dropdown, InternalHeader } from "@navikt/ds-react";
import { useRouter } from "next/navigation";

type HeaderProps = { user: User };
export default function Header({ user }: HeaderProps) {
  const router = useRouter()
  
  return (
    <InternalHeader className="flex justify-between flex-grow-0">
      <InternalHeader.Title as="h1" className="whitespace-nowrap cursor-pointer" onClick={() => router.push("/")}>
        Delta Δ
      </InternalHeader.Title>
      <div className="flex">
        <Dropdown>
          <InternalHeader.Button as={Dropdown.Toggle}>
            <MenuGridIcon className="text-[1.5rem]"
              title="Arrangementer"
            />
          </InternalHeader.Button>
          <Dropdown.Menu>
            <Dropdown.Menu.GroupedList>
              <Dropdown.Menu.GroupedList.Heading>
                Arrangementer
              </Dropdown.Menu.GroupedList.Heading>
              <Dropdown.Menu.GroupedList.Item onClick={() => router.push("/event/new")}>
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

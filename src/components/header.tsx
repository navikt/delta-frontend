"use client";

import {
  CheckmarkCircleIcon,
  MenuHamburgerIcon,
  PencilIcon,
  PlusIcon,
} from "@navikt/aksel-icons";
import { Button, Dropdown } from "@navikt/ds-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const linkButton =
    "flex no-underline items-center text-text-subtle bg-transparent hover:underline hover:bg-transparent navds-button navds-button--primary navds-button--medium";
  return (
    <header className="flex pt-3 z-10 items-center w-5/6 max-w-[80rem] m-auto justify-between">
      <div className="flex items-stretch">
        <Link className={linkButton} href="/">
          <span className="text-2xl whitespace-nowrap">Δ Delta</span>
        </Link>
{/*        {!isMobile && (
          <>
            <div className="w-1 border-r-[1px] border-border-subtle border-solid"></div>
            <div className="w-1 border-l-[1px] border-border-subtle border-solid"></div>
          </>
        )}*/}
      </div>
      {isMobile ? (
        <Dropdown>
          <Button as={Dropdown.Toggle} className={linkButton}>
            <MenuHamburgerIcon title="meny" fontSize="1.5rem" />
          </Button>
          <Dropdown.Menu className="w-auto">
            <Dropdown.Menu.List>
{/*              <Dropdown.Menu.List.Item as={Link} href="/joined-events">
                <CheckmarkCircleIcon aria-hidden fontSize="1.5rem" />
                <span>Påmeldte</span>
              </Dropdown.Menu.List.Item>*/}
              <Dropdown.Menu.List.Item as={Link} href="/my-events">
                <PencilIcon aria-hidden fontSize="1.5rem" />
                <span className="whitespace-nowrap">Arrangert av meg</span>
              </Dropdown.Menu.List.Item>
              <Dropdown.Menu.List.Item as={Link} href="/event/new">
                <PlusIcon aria-hidden fontSize="1.5rem" />
                <span className="whitespace-nowrap">
                  Opprett nytt arrangement
                </span>
              </Dropdown.Menu.List.Item>
            </Dropdown.Menu.List>
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <div className="flex items-center justify-between w-full">
{/*          <Link href="/joined-events" className={linkButton}>
            <CheckmarkCircleIcon aria-hidden fontSize="1.5rem" />
            Påmeldte
          </Link>*/}
          <div className="flex items-center w-full"></div>
          <div className="flex flex-grow">
            <Link href="/my-events" className={linkButton}>
              <PencilIcon aria-hidden fontSize="1.5rem" />
              <span className="whitespace-nowrap">Arrangert av meg</span>
            </Link>
            <Link className={linkButton} href="/event/new">
              <PlusIcon aria-hidden fontSize="1.5rem" />
              <span className="whitespace-nowrap">
                Opprett nytt arrangement
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

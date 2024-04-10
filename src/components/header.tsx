"use client";
import {
  MenuHamburgerIcon,
  PersonGroupIcon,
  PlusIcon,
} from "@navikt/aksel-icons";
import { Button, Dropdown } from "@navikt/ds-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [isMobile, setIsMobile] = useState(true);
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
    "flex text-white no-underline items-center text-text-subtle bg-transparent hover:underline hover:bg-transparent navds-button navds-button--primary navds-button--medium";
  return (
    <header className="flex py-1 z-10 items-center w-5/6 max-w-[80rem] m-auto justify-between">
      <div className="flex items-stretch">
        <Link className={linkButton} href="/">
          <span className="text-2xl whitespace-nowrap text-white">Δ Delta</span>
        </Link>
      </div>
      {isMobile ? (
        <Dropdown>
          <Button as={Dropdown.Toggle} className={linkButton}>
            <MenuHamburgerIcon title="meny" fontSize="1.5rem" />
          </Button>
          <Dropdown.Menu className="w-auto">
            <Dropdown.Menu.List>
              <Dropdown.Menu.List.Item as={Link} href="/fagfest">
                <PersonGroupIcon aria-hidden fontSize="1.5rem" />
                <span className="whitespace-nowrap">FAGFEST 2024</span>
              </Dropdown.Menu.List.Item>
              <Dropdown.Menu.List.Item as={Link} href="/faggrupper">
                <PersonGroupIcon aria-hidden fontSize="1.5rem" />
                <span className="whitespace-nowrap">Faggrupper</span>
              </Dropdown.Menu.List.Item>
              <Dropdown.Menu.List.Item as={Link} href="/event/new">
                <PlusIcon aria-hidden fontSize="1.5rem" />
                <span className="whitespace-nowrap">
                  Opprett arrangement
                </span>
              </Dropdown.Menu.List.Item>
            </Dropdown.Menu.List>
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center w-full"></div>
          <div className="flex flex-grow">
            <Link href="/fagfest" className={linkButton}>
              <span className="whitespace-nowrap">FAGFEST 2024</span>
            </Link>
           <Link href="/faggrupper" className={linkButton}>
              <span className="whitespace-nowrap">Faggrupper</span>
            </Link>
            <Link className={linkButton} href="/event/new">
              <PlusIcon aria-hidden fontSize="1.5rem" />
              <span className="whitespace-nowrap">
                Opprett arrangement
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

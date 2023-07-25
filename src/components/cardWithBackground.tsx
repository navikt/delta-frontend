"use client";
import {
  HouseIcon,
  MenuHamburgerIcon,
  PlusIcon,
} from "@navikt/aksel-icons";
import { Button, Dropdown, Heading, Link } from "@navikt/ds-react";

type CardWithBackgroundProps = {
  title: string;
  children: React.ReactNode;
  home?: boolean;
  newEvent?: boolean;
  color: "bg-green-200" | "bg-blue-200";
};
export default function CardWithBackground(props: CardWithBackgroundProps) {
  return (
    <div className="w-full flex flex-col align-center items-center">
      <div
        className={`w-full flex flex-col items-center justify-center text-center h-fit ${props.color}`}
      >
        <div className="grid lg:grid-cols-3 pt-16 pb-24 grid-flow-row auto-rows-auto items-end gap-4 w-5/6 max-w-[80rem]">
          {props.home && (
            <div className="col-span-1 lg:col-start-1 flex flex-row justify-center lg:justify-start">
              <Link
                className="no-underline navds-button navds-button--secondary"
                href="/"
              >
                <span className="w-fit navds-label flex gap-2 items-center flex-row whitespace-nowrap">
                  <HouseIcon /> Hjem
                </span>
              </Link>
            </div>
          )}
          <Heading
            className="w-full col-span-1 lg:col-start-2"
            level="1"
            size="xlarge"
          >
            {props.title}
          </Heading>
          {props.newEvent && (
            <div className="col-span-1 lg:col-start-3 flex flex-row justify-center lg:justify-end">
              <div>
                <Dropdown>
                  <Button as={Dropdown.Toggle} className="bg-transparent hover:bg-blue-300">
                    <MenuHamburgerIcon color="black" fontSize="1.5rem"/>
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
                      <Dropdown.Menu.GroupedList.Item>
                        Se mine arrangementer
                      </Dropdown.Menu.GroupedList.Item>
                    </Dropdown.Menu.GroupedList>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white drop-shadow-lg border-gray-200 border-2 rounded relative w-5/6 top-[-2.5rem] z-10 flex flex-col p-4 h-fit max-w-[80rem] gap-4">
        {props.children}
      </div>
    </div>
  );
}

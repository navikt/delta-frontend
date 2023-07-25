"use client";
import { MenuHamburgerIcon } from "@navikt/aksel-icons";
import { Button, Dropdown, Heading, Link } from "@navikt/ds-react";

type CardWithBackgroundProps = {
  title: string;
  children: React.ReactNode;
  home?: boolean;
  newEvent?: boolean;
  color: "bg-green-200" | "bg-blue-200" | "bg-red-300";
};
export default function CardWithBackground(props: CardWithBackgroundProps) {
  return (
    <div className="w-full flex flex-col align-center items-center">
      <div
        className={`flex flex-row w-full justify-between pt-3 ${props.color}`}
      >
        <Link
          className="flex items-center no-underline text-text-subtle "
          href="/"
        >
          <span className="w-fit flex gap-2 items-center flex-row whitespace-nowrap text-3xl mx-3">
            Δ Delta
          </span>
        </Link>
        <div className="flex flex-row">
          <Dropdown>
            <Button
              as={Dropdown.Toggle}
              className="bg-transparent hover:bg-blue-300 mx-3"
            >
              <MenuHamburgerIcon color="black" fontSize="1.5rem" />
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
                  href="/myEvents"
                  className="no-underline"
                >
                  Se mine arrangementer
                </Dropdown.Menu.GroupedList.Item>
              </Dropdown.Menu.GroupedList>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      <div
        className={`w-full flex flex-col items-center justify-center text-center ${props.color}`}
      >
        <div className="pt-16 pb-24 items-end">
          <Heading
            className="w-full col-span-1 lg:col-start-2"
            level="1"
            size="xlarge"
          >
            {props.title}
          </Heading>
        </div>
      </div>
      <div className="bg-white drop-shadow-lg border-gray-200 border-2 rounded relative w-5/6 top-[-2.5rem] z-10 flex flex-col p-4 h-fit max-w-[80rem] gap-4">
        {props.children}
      </div>
    </div>
  );
}

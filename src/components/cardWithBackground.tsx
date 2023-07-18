"use client";
import { HouseIcon, PencilWritingIcon } from "@navikt/aksel-icons";
import { Heading, Link } from "@navikt/ds-react";

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
        <div className="grid lg:grid-cols-3 pt-16 pb-24 grid-flow-row auto-rows-auto items-center w-5/6 max-w-[80rem]">
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
            className="w-full col-span-1 lg:col-start-2 whitespace-nowrap"
            level="1"
            size="xlarge"
          >
            {props.title}
          </Heading>
          {props.newEvent && (
            <div className="col-span-1 lg:col-start-3 flex flex-row justify-center lg:justify-end">
              <Link
                className="no-underline navds-button navds-button--secondary"
                href="/event/new"
              >
                <span className="w-fit navds-label flex gap-2 items-center flex-row whitespace-nowrap">
                  <PencilWritingIcon /> Nytt arrangement
                </span>
              </Link>
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

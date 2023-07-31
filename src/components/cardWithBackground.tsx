"use client";
import { ArrowLeftIcon, MenuHamburgerIcon } from "@navikt/aksel-icons";
import { Button, Dropdown, Heading, Link } from "@navikt/ds-react";

type CardWithBackgroundProps = {
  title: string;
  children: React.ReactNode;
  home?: boolean;
  newEvent?: boolean;
  color: "bg-green-200" | "bg-blue-200" | "bg-red-300";
  backLink?: string;
};
export default function CardWithBackground(props: CardWithBackgroundProps) {
  return (
    <div className={`w-full flex flex-col align-center items-center -mt-28`}>
      <div
        className={`w-full flex flex-col items-center justify-center text-center ${props.color} pt-12`}
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
      <div className="bg-white drop-shadow-lg border-gray-200 border-2 rounded relative w-5/6 top-[-2.5rem] z-10 flex flex-col p-4 h-fit max-w-[80rem]">
        {props.backLink && (
          <span className="relative top-[-4rem] w-0 h-0">
            <Link
              href={props.backLink}
              className="flex items-center no-underline font-bold border w-fit p-1 bg-bg-subtle rounded drop-shadow-sm text-sm hover:bg-bg-subtle-hover hover:text-text-default tracking-wide"
            >
              <ArrowLeftIcon /> Tilbake
            </Link>
          </span>
        )}
        {props.children}
      </div>
    </div>
  );
}

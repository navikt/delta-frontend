"use client";
import { ArrowLeftIcon } from "@navikt/aksel-icons";
import { Heading } from "@navikt/ds-react";
import Link from "next/link";

type CardWithBackgroundProps = {
  title: string;
  children: React.ReactNode;
  home?: boolean;
  newEvent?: boolean;
  color: "bg-green-200" | "bg-blue-200" | "bg-red-300" | "bg-violet-200";
  backLink?: string;
  backText?: string;
};
export default function CardWithBackgroundMD(props: CardWithBackgroundProps) {
  return (
    <div className={`w-full mx-5 flex flex-col align-center items-center mt-12`}>
        {/*${props.color}*/}

      <div className="bg-white border-gray-200 border-2  rounded-2xl w-5/6  px-6 py-12 h-fit max-w-[80rem]">
        {props.backLink && props.backText && (
          <span className="relative mb-2 top-[-4rem] w-0 h-0">
            <Link
              href={props.backLink}
              className="flex items-center no-underline font-bold border w-fit p-1 bg-bg-subtle rounded drop-shadow-sm text-sm hover:bg-bg-subtle-hover hover:text-text-default tracking-wide"
            >
              <ArrowLeftIcon aria-hidden /> {props.backText}
            </Link>
          </span>
        )}
        {props.children}
      </div>
    </div>
  );
}

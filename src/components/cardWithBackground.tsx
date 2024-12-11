"use client";
import { ArrowLeftIcon } from "@navikt/aksel-icons";
import { Heading } from "@navikt/ds-react";
import Link from "next/link";

type CardWithBackgroundProps = {
  title?: string;
  children: React.ReactNode;
  home?: boolean;
  newEvent?: boolean;
  color?: "bg-green-200" | "bg-blue-200" | "bg-red-300" | "bg-violet-200";
  backLink?: string;
  backText?: string;
  titleColor?: string; 
  className?: string; 
};

// ${props.color} ${props.className}

export default function CardWithBackground(props: CardWithBackgroundProps) {
  return (
    <div className={`w-full flex flex-col align-center items-center -mt-20`}>
      <div className="w-full header-animated-bg relative max-w-[100vw] overflow-hidden animation-stop">
        <div className="z-20 pb-24">
          <div className="relative mt-28 mx-auto grid w-full place-items-center px-4 text-center sm:max-w-[632px] sm:px-6">
            {props.title && (
              <Heading
                className="first-letter:uppercase mt-8"
                style={{ color: props.titleColor || "#100d29" }}
                level="1"
                size="xlarge"
              >
                {props.title}
              </Heading>
            )}
          </div>
        </div>
      </div>
      <div className="w-full px-2 sm:px-12 flex items-center justify-center">
        <div className="bg-white border-gray-200 border-2 w-full rounded-2xl relative top-[-2.5rem] flex flex-col px-4 py-5 h-fit max-w-[80rem]">
          {props.backLink && props.backText && (
            <span className="relative mb-2 top-[-4rem] w-0 h-0">
              <a
                href={props.backLink}
                className="flex items-center no-underline font-bold border w-fit p-1 bg-bg-subtle rounded drop-shadow-sm text-sm hover:bg-bg-subtle-hover hover:text-text-default tracking-wide"
              >
                <ArrowLeftIcon aria-hidden /> {props.backText}
              </a>
            </span>
          )}
          {props.children}
        </div>
      </div>
    </div>
  );
}

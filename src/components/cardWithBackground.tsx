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
export default function CardWithBackground(props: CardWithBackgroundProps) {
  return (
    <div className={`w-full flex flex-col align-center items-center -mt-20`}>
        <div className={`w-full header-animated-bg relative max-w-[100vw] overflow-hidden ${props.color} animation-stop`}>
            <div className="z-20 pb-28">
                <div
                    className="relative mx-auto mt-36 grid w-full place-items-center px-4 text-center sm:max-w-[632px] sm:px-6">
                    <Heading
                        className="text-deepblue-800 first-letter:uppercase"
                        level="1"
                        size="xlarge"
                    >
                        {props.title}
                    </Heading>
                    <div className="cube_animated__vdkt0">
                        <svg width="14.1875rem" height="42rem" viewBox="0 0 227 672" fill="none"
                             xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"
                             className="cube_animated1__VoRKe">
                            <path
                                d="M224.332 224.831L224.333 669.053L2.55446 447.275L2.55401 3.05265L224.332 224.831Z"
                                stroke="currentColor" strokeWidth="4.5" strokeLinejoin="round"></path>
                        </svg>
                        <svg width="28.125rem" height="28.125rem" viewBox="0 0 450 450" fill="none"
                             xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"
                             className="cube_animated2__ttRM_">
                            <path d="M2.55469 447.272H446.775L446.774 3.05239H2.55424L2.55469 447.272Z"
                                  stroke="currentColor" strokeWidth="4.5" strokeLinejoin="round"></path>
                        </svg>
                        <svg width="14.1875rem" height="42rem" viewBox="0 0 227 672" fill="none"
                             xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"
                             className="cube_animated3__oV3de">
                            <path
                                d="M224.332 224.831L224.333 669.053L2.55446 447.275L2.55401 3.05265L224.332 224.831Z"
                                stroke="currentColor" strokeWidth="4.5" strokeLinejoin="round"></path>
                        </svg>
                        <svg width="28.125rem" height="28.125rem" viewBox="0 0 450 450" fill="none"
                             xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"
                             className="cube_animated4__TZIuJ">
                            <path d="M2.55469 447.272H446.775L446.774 3.05239H2.55424L2.55469 447.272Z"
                                  stroke="currentColor" strokeWidth="4.5" strokeLinejoin="round"></path>
                        </svg>
                        <svg width="14.1875rem" height="42rem" viewBox="0 0 227 672" fill="none"
                             xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"
                             className="cube_animated5__f9PNs">
                            <path
                                d="M224.332 224.831L224.333 669.053L2.55446 447.275L2.55401 3.05265L224.332 224.831Z"
                                stroke="currentColor" strokeWidth="4.5" strokeLinejoin="round"></path>
                        </svg>
                        <svg width="14.1875rem" height="42rem" viewBox="0 0 227 672" fill="none"
                             xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"
                             className="cube_animated6__kllvd">
                            <path
                                d="M224.332 224.831L224.333 669.053L2.55446 447.275L2.55401 3.05265L224.332 224.831Z"
                                stroke="currentColor" strokeWidth="4.5" strokeLinejoin="round"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
      <div className="bg-white border-gray-200 border-2 rounded-2xl relative w-5/6 top-[-2.5rem] flex flex-col px-4 py-5 h-fit max-w-[80rem]">
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

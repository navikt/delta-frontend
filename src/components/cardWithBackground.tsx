"use client";
import { ArrowLeftIcon } from "@navikt/aksel-icons";
import { Heading } from "@navikt/ds-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

type CardWithBackgroundProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  home?: boolean;
  newEvent?: boolean;
  color?: "bg-ax-success-300" | "bg-ax-accent-300" | "bg-ax-danger-400" | "bg-violet-200";
  backLink?: string;
  backText?: string;
  titleColor?: string;
  className?: string;
  scrollToTopOnMount?: boolean;
};

// ${props.color} ${props.className}

export default function CardWithBackground(props: CardWithBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.scrollToTopOnMount !== false && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [props.scrollToTopOnMount]);

  return (
    <div ref={containerRef} className={`w-full flex flex-col align-center items-center -mt-20`}>
      <div className="w-full header-animated-bg relative max-w-[100vw] overflow-hidden animation-stop">
        <div className="z-20 pb-24">
          <div className="relative mt-28 mx-auto grid w-full place-items-center px-4 text-center ax-sm:max-w-[632px] ax-sm:px-6">
            {props.title && (
              <>
                <Heading
                  className="first-letter:uppercase mt-8"
                  style={{ color: props.titleColor || "#100d29" }}
                  level="1"
                  size="xlarge"
                >
                  {props.title}
                </Heading>
                {props.subtitle && (
                  <p className="text-lg mt-2" style={{ color: props.titleColor || "#100d29" }}>
                    {props.subtitle}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="w-full px-2 ax-sm:px-12 flex items-center justify-center">
        <div className="bg-white border-ax-neutral-300 border-2 w-full rounded-2xl relative top-[-2.5rem] flex flex-col px-4 py-5 h-fit max-w-[80rem]">
          {props.backLink && props.backText && (
            <span className="relative mb-2 top-[-4rem] w-0 h-0">
              <Link
                href={props.backLink}
                className="flex items-center no-underline font-ax-bold border w-fit p-1 bg-ax-bg-neutral-soft rounded drop-shadow-sm text-sm hover:bg-ax-bg-neutral-moderate-hover hover:text-ax-text-neutral tracking-wide"
              >
                <ArrowLeftIcon aria-hidden /> {props.backText}
              </Link>
            </span>
          )}
          {props.children}
        </div>
      </div>
    </div>
  );
}

"use client";
import { Heading } from "@navikt/ds-react";

type CardWithBackgroundProps = { title: string; children: React.ReactNode, color: "bg-green-200" | "bg-blue-200" };

export default function CardWithBackground(props: CardWithBackgroundProps) {
  return (
    <div className="w-full flex flex-col align-center items-center">
      <div className={`w-full text-center h-fit p-18 pb-24 ${props.color}`}>
        <Heading level="1" size="xlarge">
          {props.title}
        </Heading>
      </div>
      <div className="bg-white drop-shadow-lg border-gray-200 border-2 rounded relative w-5/6 top-[-5rem] z-10 flex flex-col p-4 h-fit max-w-[80rem] gap-4">
        {props.children}
      </div>
    </div>
  );
}

"use client";
import { Button } from "@navikt/ds-react";
import { joinEvent } from "./joinEvent";

export default function JoinEventButton({ id }: { id: string }) {
  return (
    <form action={joinEvent} className="w-full max-w-[12rem] h-full">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" className="w-full h-fit">
        Bli med
      </Button>
    </form>
  );
}

"use client";

import { TimeSelector } from "@/types/filter";
import { Tabs } from "@navikt/ds-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function FuturePastFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const time = searchParams.get("time");
  const [selectedTime, setSelectedTime] = useState<TimeSelector>(
    (time as TimeSelector) ?? TimeSelector.FUTURE,
  );
  const [isPending, startTransition] = useTransition();

  const updateUrl = (value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (!value) {
      current.delete("time");
    } else {
      current.set("time", value as unknown as string);
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    startTransition(() => {
      router.replace(`${pathname}${query}`);
    });
  };

  const handleOnChange = (value: string) => {
    setSelectedTime(value as unknown as TimeSelector);
    updateUrl(value);
  };

  return (
    <Tabs
      className="self-start w-full mb-4"
      defaultValue="fremtidige"
      onChange={handleOnChange}
      value={selectedTime as unknown as string}
    >
      <Tabs.List>
        <Tabs.Tab value={TimeSelector.FUTURE} label="Fremtidige" />
        <Tabs.Tab value={TimeSelector.PAST} label="Tidligere" />
      </Tabs.List>
    </Tabs>
  );
}

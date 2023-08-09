"use client";

import { Search, debounce } from "@navikt/ds-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function SearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const [searchTerm, setSearchTerm] = useState(search ?? "");
  const [isPending, startTransition] = useTransition();

  const debouncedUpdateUrl = debounce((value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (!value) {
      current.delete("search");
    } else {
      current.set("search", value);
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    startTransition(() => {
      router.replace(`${pathname}${query}`);
    });
  }, 250);

  const handleOnChange = (value: string) => {
    setSearchTerm(value);
    debouncedUpdateUrl(value);
  };

  return (
    <Search
      id="search-filter"
      label="Søk alle kommende arrangementer"
      variant="simple"
      value={searchTerm}
      size="small"
      className="border-[#000] w-full md:w-auto"
      onChange={handleOnChange}
    />
  );
}

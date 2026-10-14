"use client";

import { Search } from "@navikt/ds-react";
import { useQueryStates } from "nuqs";
import { homeParsers } from "@/service/overviewState";

export default function CategoryControls() {
  const [state, setState] = useQueryStates(homeParsers, { history: "replace", scroll: false, shallow: true });
  return <div className="flex flex-col w-full gap-6 items-start px-4">
    <Search label="Søk alle kommende arrangementer" variant="simple" value={state.search} size="small"
      className="w-full ax-md:w-auto" onChange={search => void setState({ search })}
      onClear={() => void setState({ search: "" })} />
  </div>;
}

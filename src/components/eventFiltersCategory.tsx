"use client";

import { Box, Search } from "@navikt/ds-react";
import { useQueryStates } from "nuqs";
import { homeParsers } from "@/service/overviewState";

export default function CategoryControls() {
  const [state, setState] = useQueryStates(homeParsers, { history: "replace", scroll: false, shallow: true });
  return <Box background="raised" borderColor="neutral-subtle" borderWidth="1" borderRadius="12" padding="space-16">
    <Search label="Søk i arrangementer" hideLabel variant="simple" size="small" value={state.search}
      placeholder="Søk etter tittel, sted eller arrangør"
      onChange={search => void setState({ search })} onClear={() => void setState({ search: "" })} />
  </Box>;
}

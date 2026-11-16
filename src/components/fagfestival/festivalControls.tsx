"use client";

import { BodyShort, Checkbox, CheckboxGroup, Radio, RadioGroup, Search, Skeleton } from "@navikt/ds-react";
import { useEffect, useMemo, useRef } from "react";
import { useQueryStates } from "nuqs";
import { festivalParsers } from "@/service/overviewState";
import { JOINED_TAB, festivalBrowserPlan, festivalTabNavigation, type ResolvedFestival } from "@/service/festivalPolicy";
import { useOverviewTransition } from "../overviewTransition";
import { useBrowserNow } from "../useBrowserNow";
import { useMediaQuery } from "../useMediaQuery";
import ViewToggle from "../viewToggle";
import { FESTIVAL_RESULTS_ID } from "../eventResultsSkeleton";

export default function FestivalControls({ festival: serverFestival }: { festival: ResolvedFestival }) {
  const browserReady = useBrowserNow() !== null;
  const festival = useMemo(() => browserReady
    ? festivalBrowserPlan(serverFestival, null).festival : serverFestival, [serverFestival, browserReady]);
  const parsers = useMemo(() => festivalParsers(festival.defaultTab, festival.tabs), [festival]);
  const [state, setState] = useQueryStates(parsers, { history: "replace", scroll: false });
  const { pending, startTransition } = useOverviewTransition();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const correctedDefault = useRef(false);
  const selectedTab = useRef(false);
  useEffect(() => {
    if (!browserReady || correctedDefault.current || selectedTab.current) return;
    correctedDefault.current = true;
    const rawTab = new URLSearchParams(window.location.search).get("tab");
    const { correction } = festivalBrowserPlan(serverFestival, rawTab);
    if (!correction) return;
    const shallow = correction.navigation === "shallow";
    void setState({ tab: correction.tab }, {
      shallow, clearOnDefault: false, ...(!shallow ? { startTransition } : {}),
    });
  }, [browserReady, serverFestival, setState, startTransition]);
  useEffect(() => {
    if (state.tab === JOINED_TAB && isMobile && state.view === "program") {
      void setState({ view: "cards" }, { shallow: true });
    }
  }, [isMobile, state.tab, state.view, setState]);
  if (!browserReady) return <div className="w-full px-4" aria-busy="true">
    <BodyShort role="status">Forbereder programmet …</BodyShort>
    <Skeleton variant="text" className="w-full h-12" />
  </div>;
  const showProgram = festival.showProgramOverviewCheckbox && (state.tab !== JOINED_TAB || !isMobile);
  return <div className="flex flex-col w-full gap-6 items-start">
    <div className="px-4">
      <ViewToggle label="Filtrer programmet" value={state.tab} controls={FESTIVAL_RESULTS_ID} above="lg"
        onChange={tab => {
          selectedTab.current = true;
          const shallow = festivalTabNavigation(state.tab, tab) === "shallow";
          void setState({ tab, ...(tab === JOINED_TAB && isMobile ? { view: "cards" } : {}) },
            { shallow, ...(!shallow ? { startTransition } : {}) });
        }}
        options={[
          ...(festival.timeWindowTabs.length > 0 ? festival.timeWindowTabs.map(tab => ({ value: tab.id, text: tab.label }))
            : festival.combineDays ? [{ value: "alle", text: "Alle" }]
            : festival.remainingDays.map(day => ({ value: day, text: `${day}. ${festival.month}` }))),
          { value: JOINED_TAB, text: "Mine påmeldinger" },
        ]} />
    </div>
    <div className="flex flex-col-reverse gap-2 items-start ax-md:flex-row justify-between w-full ax-md:items-center px-4">
      <Search label="Søk alle kommende arrangementer" variant="simple" value={state.search} size="small"
        className="w-full ax-md:w-auto" onChange={search => void setState({ search }, { shallow: true })}
        onClear={() => void setState({ search: "" }, { shallow: true })} />
    </div>
    {showProgram && <CheckboxGroup legend="Vis programoversikt" hideLegend className="-mt-5 -mb-2 ml-4"
      value={state.view === "program" ? ["vis-programoversikt"] : []}
      onChange={(values: string[]) => void setState({
        view: values.includes("vis-programoversikt") ? "program" : "cards",
      }, { shallow: true })}>
      <Checkbox value="vis-programoversikt">Programoversikt</Checkbox>
    </CheckboxGroup>}
    {festival.category === "mim" && state.tab !== JOINED_TAB && <RadioGroup legend="Vis arrangementstype"
      hideLegend className="-mt-3 -mb-2 ml-4" value={state.attendance}
      onChange={(attendance: "fysisk" | "digitalt") => void setState({ attendance }, { shallow: true })}>
      <Radio value="fysisk">Fysiske arrangementer</Radio>
      <Radio value="digitalt">Digitale arrangementer</Radio>
    </RadioGroup>}
    {pending && <BodyShort className="px-4">Laster arrangementer …</BodyShort>}
  </div>;
}

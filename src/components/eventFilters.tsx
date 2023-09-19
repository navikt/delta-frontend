"use client";

import { Category, FullDeltaEvent } from "@/types/event";
import { Search, Tabs, UNSAFE_Combobox, RadioGroup, Radio } from "@navikt/ds-react";
import EventList from "./eventList";
import { useEffect, useState } from "react";
import { getEvents } from "@/service/eventActions";
import { FunnelIcon } from "@navikt/aksel-icons";
import Link from "next/link";

enum TimeSelector {
  PAST,
  FUTURE,
}

export default function EventFilters({
  categories: allCategories = [],
  selectTime = false,
  selectTimeRadio = false,
  selectCategory = false,
  searchName = false,
  onlyJoined = false,
  onlyMine = false,
  joinedLink  = false,
  homeTabs  = false,
  ctaLink  = false,
}: {
  categories?: Category[];
  selectTime?: boolean;
  selectTimeRadio?: boolean;
  searchName?: boolean;
  selectCategory?: boolean;
  onlyJoined?: boolean;
  onlyMine?: boolean;
  joinedLink?: boolean;
  homeTabs?: boolean;
  ctaLink?: boolean;
}) {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [filterEvents, setFilterEvents] = useState<FullDeltaEvent[]>([]);

  const [selectedTime, setSelectedTime] = useState(TimeSelector.FUTURE);
  const onlyFuture = selectedTime === TimeSelector.FUTURE;
  const onlyPast = selectedTime === TimeSelector.PAST;
  const handleChange = (val: any) => setVal(val);
  const [val, setVal] = useState("10");
  const [tabname, setTabname] = useState("alle");

  const [events, setEvents] = useState([] as FullDeltaEvent[]);
  const [loading, setLoading] = useState(true);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    getEvents({
      categories: selectedCategories,
      onlyFuture,
      onlyPast,
      onlyJoined,
      onlyMine,
    })
      .then(setEvents)
      .then(() => setLoading(false));
  }, [selectedCategories, onlyFuture, onlyPast, onlyJoined]);

  function getOnlyJoined() {
    setLoading(true);
    setTabname("påmeldte")
    setVal("10")
    getEvents({
      categories: selectedCategories,
      onlyFuture,
      onlyJoined: true,
    })
        .then(setEvents)
        .then(() => setLoading(false));
  }

  function getOnlyJoinedPrev() {
    setLoading(true);
    getEvents({
      categories: selectedCategories,
      onlyPast: true,
      onlyJoined: true,
    })
        .then(setEvents)
        .then(() => setLoading(false));
  }

  function getOnlyMine() {
    setLoading(true);
    setTabname("mine")
    setVal("10")
    getEvents({
      categories: selectedCategories,
      onlyFuture,
      onlyMine: true,
    })
        .then(setEvents)
        .then(() => setLoading(false));
  }

  function getOnlyMinePrev() {
    setLoading(true);
    getEvents({
      categories: selectedCategories,
      onlyPast: true,
      onlyMine: true,
    })
        .then(setEvents)
        .then(() => setLoading(false));
  }

  function getAll() {
    setLoading(true);
    setTabname("alle")
    setVal("10")
    getEvents({
      categories: selectedCategories,
      onlyFuture: true,
    })
        .then(setEvents)
        .then(() => setLoading(false));
  }

  function getAllPrev() {
    setLoading(true);
    getEvents({
      categories: selectedCategories,
      onlyPast: true
    })
        .then(setEvents)
        .then(() => setLoading(false));
  }

  useEffect(() => {
    const filtered = events.filter((fullEvent) =>
      fullEvent.event.title.toLowerCase().includes(searchInput.toLowerCase()),
    );
    setFilterEvents(filtered);
  }, [events, searchInput]);

  return (
    <div className="flex flex-col w-full gap-6 items-start">
      {homeTabs && (
          <Tabs className="self-start w-full" defaultValue="fremtidige">
            <Tabs.List>
              <Tabs.Tab
                  value="fremtidige"
                  label="Alle"
                  onClick={() => getAll()}
              />
              <Tabs.Tab
                  value="tidligere"
                  label="Påmeldte"
                  onClick={() => getOnlyJoined()}
              />
              <Tabs.Tab
                  value="mine"
                  label="Mine"
                  onClick={() => getOnlyMine()}
              />
            </Tabs.List>
          </Tabs>
      )}
      {selectTime && (
        <Tabs className="self-start w-full" defaultValue="fremtidige">
          <Tabs.List>
            <Tabs.Tab
              value="fremtidige"
              label="Kommende"
              onClick={() => setSelectedTime(TimeSelector.FUTURE)}
            />
            <Tabs.Tab
              value="tidligere"
              label="Tidligere"
              onClick={() => setSelectedTime(TimeSelector.PAST)}
            />
          </Tabs.List>
        </Tabs>
      )}
      {(searchName || selectCategory) && (
        <div className="flex flex-col-reverse gap-2 items-start md:flex-row justify-between w-full md:items-center px-4">
          {searchName && (
            <Search
              label="Søk alle kommende arrangementer"
              variant="simple"
              value={searchInput}
              size="small"
              className="border-[#000] w-full md:w-auto"
              onChange={(e) => {
                setSearchInput(e);
              }}
            />
          )}
          {selectCategory && (
            <div className="w-full md:w-fit flex items-center flex-wrap flex-row-reverse md:flex-row gap-2">
              <span className="gap-2 items-center hidden md:flex">
                <FunnelIcon title="trakt" />
                <label className="font-bold">Filtrer på kategori</label>
              </span>
              <UNSAFE_Combobox
                className="w-full md:w-fit"
                size="small"
                label="Filtrer på kategori"
                hideLabel={!isMobile}
                options={allCategories.map((category) => category.name)}
                selectedOptions={selectedCategories.map(
                  (category) => category.name,
                )}
                onToggleSelected={(categoryName, isSelected) => {
                  if (isSelected) {
                    setSelectedCategories((categories) => [
                      ...categories,
                      allCategories.find(
                        (category) => category.name === categoryName,
                      )!,
                    ]);
                  } else {
                    setSelectedCategories((categories) =>
                      categories.filter(
                        (category) => category.name !== categoryName,
                      ),
                    );
                  }
                }}
                isMultiSelect
                shouldAutocomplete
              />
            </div>
          )}
        </div>
      )}
      {selectTimeRadio && (
          <RadioGroup id="timeRadio" className={"-mt-5 -mb-2"} legend={"Vis"} hideLegend
                      onChange={(val: any) => handleChange(val)}
                      value={val} aria-label={"Filtrer på kommende eller tidligere arrangementer"}
          >

            {tabname == "alle" && (<>
            <Radio value="10" onClick={() => getAll()} className="pl-4">Kommende</Radio>
            <Radio value="20" onClick={() => getAllPrev()} className="pl-4" >Tidligere</Radio>
            </>)}
            {tabname == "påmeldte" && (<>
              <Radio value="10" onClick={() => getOnlyJoined()} className="pl-4">Kommende</Radio>
              <Radio value="20" onClick={() => getOnlyJoinedPrev()} className="pl-4" >Tidligere</Radio>
            </>)}
            {tabname == "mine" && (<>
              <Radio value="10" onClick={() => getOnlyMine()} className="pl-4">Kommende</Radio>
              <Radio value="20" onClick={() => getOnlyMinePrev()} className="pl-4" >Tidligere</Radio>
            </>)}
          </RadioGroup>
      )}
      {joinedLink && (
      <div className="px-4">
        <Link href="/joined-events" className="text-deepblue-500 underline hover:no-underline">
          Påmeldte arrangementer
        </Link>
      </div>
      )}
      <div className="w-full p-4">
        <EventList fullEvents={filterEvents} loading={loading} />
      </div>
      {ctaLink && (
          <div className="px-4 mb-4">
            <Link href="/event/new" className="text-deepblue-500 underline hover:no-underline">
              Opprett nytt arrangement
            </Link>
          </div>
      )}
    </div>
  );
}

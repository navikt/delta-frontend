"use client"
import { Category, FullDeltaEvent } from "@/types/event";
import { Search, Tabs, UNSAFE_Combobox, CheckboxGroup, Checkbox, LinkPanel } from "@navikt/ds-react";
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
  joinedLink  = false,
  onlyMine = false,
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

  const handleChange = (val: any) => {
    if (tabname == "alle") {
      if (val.length == 0) {
        setVal(val);
        getAll()
      } else {
        setVal(val);
        getAllPrev()
      }
    }
    if (tabname == "påmeldte") {
      if (val.length == 0) {
        setVal(val);
        getOnlyJoined()
      } else {
        setVal(val);
        getOnlyJoinedPrev()
      }
    }
    if (tabname == "mine") {
      if (val.length == 0) {
        setVal(val);
        getOnlyMine()
      } else {
        setVal(val);
        getOnlyMinePrev()
      }
    }
  }

  const [val, setVal] = useState([]);
  const [tabname, setTabname] = useState("alle");


  const [events, setEvents] = useState([] as FullDeltaEvent[]);
  const [loading, setLoading] = useState(true);

  const [eventCategories, setEventCategories] = useState<Category[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Filter the events based on the search input
  useEffect(() => {
    const filtered = events.filter((fullEvent) =>
        fullEvent.event.title.toLowerCase().includes(searchInput.toLowerCase())
    );

    // Ensure selectedCategories only includes valid categories
    const validSelectedCategories = selectedCategories.filter(category =>
        eventCategories.some(eventCategory => eventCategory.name === category.name)
    );

    setFilterEvents(filtered);

    // Get the categories of the filtered events
    const categories = filtered.flatMap((event) => event.categories);

    // Use a Set to remove duplicates
    const uniqueCategories = Array.from(new Set(categories.map(category => category.name)))
        .map(name => categories.find(category => category.name === name))
        .filter(category => category !== undefined); // Ensure no undefined categories

    // Filter out the "fagfestival" tag
    const filteredCategories = uniqueCategories.filter(category => category.name !== "fagfestival");

    // Set the categories as a state
    setEventCategories(filteredCategories as Category[]);
  }, [events, searchInput, selectedCategories]);

  useEffect(() => {
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

  useEffect(() => {
    getAll()
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function getOnlyJoined() {
    setLoading(true);
    setTabname("påmeldte")
    setVal([])
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
      onlyPast,
      onlyJoined: true,
    })
        .then(setEvents)
        .then(() => setLoading(false));
  }

  function getOnlyMine() {
    setLoading(true);
    setTabname("mine")
    setVal([])
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
      onlyPast,
      onlyMine: true,
    })
        .then(setEvents)
        .then(() => setLoading(false));
  }

  function getAll() {
    setLoading(true);
    setTabname("alle")
    setVal([])
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
      onlyPast
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
                  label="Mine påmeldinger"
                  onClick={() => getOnlyJoined()}
              />
              <Tabs.Tab
                  value="mine"
                  label="Arrangør"
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
    {tabname == "alle" && (
          <>
            {joinedLink && new Date() < new Date('2024-08-09') && (
                <div className="px-4 inline-block">
                  <LinkPanel  href="https://fagtorsdag.ansatt.nav.no/" border className={"colorful_fagdag_utvikling_og_data"}>
                    <LinkPanel.Title>Fagtorsdag</LinkPanel.Title>
                    <LinkPanel.Description>
                      Programmet 8. august
                    </LinkPanel.Description>
                  </LinkPanel>
                </div>
            )}
          </>
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
          {selectCategory && tabname == "alle" && (
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
                  options={eventCategories
                      .map((category) => category.name)
                      .filter((categoryName) =>  categoryName !== "fagfestival" && categoryName !== "biljard" && categoryName !== "fagdag_utvikling_og_data" )
                      .sort((a, b) => a.localeCompare(b))}
                  selectedOptions={selectedCategories
                      .map((category) => category.name)
                      .sort((a, b) => a.localeCompare(b))}
                  onToggleSelected={(categoryName, isSelected) => {
                    if (isSelected) {
                      setSelectedCategories((categories) => [
                        ...categories,
                        eventCategories.find((category) => category.name === categoryName)!,
                      ]);
                    } else {
                      setSelectedCategories((categories) =>
                          categories.filter((category) => category.name !== categoryName)
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
      {(selectTimeRadio && tabname != "alle") && (
          <>
            {/*<Switch className={"-mt-5 -mb-2 ml-4"}>Vis tidligere</Switch>*/}
            <CheckboxGroup
                legend={"Vis"} hideLegend className={"-mt-5 -mb-2 ml-4"}
                onChange={(val: any[]) => handleChange(val)}
                value={val}
            >
              <Checkbox value="10">Vis tidligere</Checkbox>
            </CheckboxGroup>
          </>
      )}
      {(selectTimeRadio && tabname == "alle") && (
          <>
            {/*<Switch className={"-mt-5 -mb-2 ml-4"}>Vis tidligere</Switch>*/}
              <CheckboxGroup
                  legend={"Vis"} hideLegend className={"-mt-5 -mb-2 ml-4"}
                  onChange={(values: string[]) => {
                    const validValues = values.filter(value =>
                        ["kompetanse", "bedriftidrettslaget"].includes(value)
                    );

                    if (validValues.includes("kompetanse") && validValues.includes("bedriftidrettslaget")) {
                      // If both are selected, do nothing or handle the error gracefully
                      return;
                    }

                    if (validValues.includes("kompetanse")) {
                      setSelectedCategories((prevCategories) => [
                        ...prevCategories.filter((category) => category.name !== "bedriftidrettslaget"),
                        eventCategories.find((category) => category.name === "kompetanse")!,
                      ].filter(category => category !== undefined));
                    } else if (validValues.includes("bedriftidrettslaget")) {
                      setSelectedCategories((prevCategories) => [
                        ...prevCategories.filter((category) => category.name !== "kompetanse"),
                        eventCategories.find((category) => category.name === "bedriftidrettslaget")!,
                      ].filter(category => category !== undefined));
                    } else {
                      setSelectedCategories([]);
                    }
                  }}
              >
                <div className="mt-1 flex flex-col sm:flex-row gap-0 sm:gap-4">
                  <Checkbox value="kompetanse" disabled={selectedCategories.some(category => category.name === "bedriftidrettslaget")}>Kompetanse</Checkbox>
                  <Checkbox value="bedriftidrettslaget" disabled={selectedCategories.some(category => category.name === "kompetanse")}>Bedriftidrettslaget</Checkbox>
                </div>
              </CheckboxGroup>
          </>
      )}
      <div className="w-full p-4">
        {filterEvents.length > 0 && (<p className="pb-4">{filterEvents.length} {filterEvents.length == 1 ? (<>arrangement</>) : (<>arrangementer</>)}</p>)}
        <EventList fullEvents={filterEvents} loading={loading} showAll={val} tabname={tabname}/>
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

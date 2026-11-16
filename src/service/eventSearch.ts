type SearchableEvent = {
  event: { title: string; location?: string | null };
  hosts?: { name?: string | null }[];
};

function normalize(value: string) {
  return value.normalize("NFC").toLocaleLowerCase("nb-NO");
}

/** Every whitespace-separated term must appear in the title, location or a host name. */
export function matchesEventSearch(item: SearchableEvent, query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const haystack = normalize([
    item.event.title,
    item.event.location ?? "",
    ...(item.hosts ?? []).map(host => host.name ?? ""),
  ].join("\n"));
  return terms.every(term => haystack.includes(term));
}

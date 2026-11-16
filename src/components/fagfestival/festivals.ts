type FestivalContact =
  | { kind: "committee"; label: string; email: string }
  | { kind: "label"; label: string }
  | { kind: "hosts" };

export type FestivalConfig = {
  slug: string;
  backText: string;
  contact: FestivalContact;
};

export const festivals = {
  fagfest: {
    slug: "fagfest",
    backText: "FAGFEST",
    contact: { kind: "committee", label: "Fagfest", email: "fagfestival@nav.no" },
  },
  ips: {
    slug: "ips",
    backText: "Arrangementer",
    contact: { kind: "label", label: "IPS" },
  },
  mim: {
    slug: "mim",
    backText: "Arrangementer",
    contact: { kind: "committee", label: "Mangfold i mai", email: "mangfold.i.mai@nav.no" },
  },
  pride: {
    slug: "pride",
    backText: "Arrangementer",
    contact: { kind: "hosts" },
  },
  markedsuka: {
    slug: "markedsuka",
    backText: "Arrangementer",
    contact: { kind: "hosts" },
  },
} satisfies Record<string, FestivalConfig>;

export function getFestivalEventPath(festival: FestivalConfig, id: string) {
  return `/${festival.slug}/${encodeURIComponent(id)}`;
}

export function getFestivalEventUrl(festival: FestivalConfig, id: string, hostname?: string) {
  return `${(hostname || "https://delta.nav.no").replace(/\/+$/, "")}${getFestivalEventPath(festival, id)}`;
}

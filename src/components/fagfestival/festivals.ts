type FestivalContact =
  | { kind: "committee"; label: string; email: string }
  | { kind: "label"; label: string }
  | { kind: "hosts" };

export type FestivalConfig = {
  slug: string;
  backText: string;
  titleColor: string;
  bgClass: string;
  contact: FestivalContact;
};

export const festivals = {
  fagfest: {
    slug: "fagfest",
    backText: "FAGFEST",
    titleColor: "#ec38a7",
    bgClass: "bg-fagfestival",
    contact: { kind: "committee", label: "Fagfest", email: "fagfestival@nav.no" },
  },
  ips: {
    slug: "ips",
    backText: "Arrangementer",
    titleColor: "#021841",
    bgClass: "colorful",
    contact: { kind: "label", label: "IPS" },
  },
  mim: {
    slug: "mim",
    backText: "Arrangementer",
    titleColor: "#021841",
    bgClass: "colorful",
    contact: { kind: "committee", label: "Mangfold i mai", email: "mangfold.i.mai@nav.no" },
  },
  pride: {
    slug: "pride",
    backText: "Arrangementer",
    titleColor: "#021841",
    bgClass: "colorful",
    contact: { kind: "hosts" },
  },
  markedsuka: {
    slug: "markedsuka",
    backText: "Arrangementer",
    titleColor: "#021841",
    bgClass: "colorful",
    contact: { kind: "hosts" },
  },
} satisfies Record<string, FestivalConfig>;

export function getFestivalEventPath(festival: FestivalConfig, id: string) {
  return `/${festival.slug}/${encodeURIComponent(id)}`;
}

export function getFestivalEventUrl(festival: FestivalConfig, id: string, hostname?: string) {
  return `${(hostname || "https://delta.nav.no").replace(/\/+$/, "")}${getFestivalEventPath(festival, id)}`;
}

export function getFestivalReturnTo(festival: FestivalConfig, returnTo?: string | string[]) {
  const value = Array.isArray(returnTo) ? returnTo[0] : returnTo;
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return `/${festival.slug}`;
  }
  return value;
}

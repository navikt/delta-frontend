"use client";
import { HatSchoolIcon, MenuHamburgerIcon, PersonGroupIcon, PlusIcon } from "@navikt/aksel-icons";
import { ActionMenu, InternalHeader, Page, Spacer } from "@navikt/ds-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const KOMPASSET_URL = "https://nav.grade.no/LuvitPortal/activitycentre/activitycentre.aspx";

type NavItem = {
  label: string;
  href: string;
  icon?: ReactNode;
  prefetch?: false;
  isActive: (pathname: string) => boolean;
  dataAttributes: Record<`data-${string}`, string>;
};

function navItems(isMaintainer: boolean): NavItem[] {
  return [
    ...(isMaintainer
      ? [{
          label: "Administrasjon",
          href: "/admin",
          prefetch: false as const,
          isActive: (pathname: string) => pathname.startsWith("/admin"),
          dataAttributes: {},
        }]
      : []),
    {
      label: "Kompasset",
      href: KOMPASSET_URL,
      icon: <HatSchoolIcon aria-hidden />,
      isActive: () => false,
      dataAttributes: { "data-umami-event": "Hovedmeny-snarvei besøkt", "data-umami-event-lenke": "Kompasset" },
    },
    {
      label: "Faggrupper",
      href: "/faggrupper",
      icon: <PersonGroupIcon aria-hidden />,
      prefetch: false,
      isActive: (pathname) => pathname.startsWith("/faggrupper"),
      dataAttributes: { "data-umami-event": "Hovedmeny-snarvei besøkt", "data-umami-event-lenke": "Faggruppe" },
    },
    {
      label: "Opprett arrangement",
      href: "/event/new",
      icon: <PlusIcon aria-hidden />,
      prefetch: false,
      isActive: (pathname) => pathname === "/event/new",
      dataAttributes: { "data-umami-event": "Opprett event besøkt", "data-umami-event-placement": "Header" },
    },
  ];
}

export default function Header({ isMaintainer }: { isMaintainer: boolean }) {
  const pathname = usePathname() ?? "";
  const items = navItems(isMaintainer);

  return (
    <InternalHeader>
      <Page.Block width="xl" gutters className="flex w-full items-stretch">
        <InternalHeader.Title as={NextLink} href="/" className="-ms-4 ps-4" data-umami-event="Delta-logo besøkt">
          Δ Delta
        </InternalHeader.Title>
        <Spacer />
        <nav aria-label="Hovedmeny" className="hidden ax-md:flex items-stretch">
          {items.map((item) => {
            const active = item.isActive(pathname);
            return (
              <InternalHeader.Button
                key={item.href}
                as={NextLink}
                href={item.href}
                prefetch={item.prefetch}
                isActive={active}
                aria-current={active ? "page" : undefined}
                className="gap-2 whitespace-nowrap"
                {...item.dataAttributes}
              >
                {item.icon}
                {item.label}
              </InternalHeader.Button>
            );
          })}
        </nav>
        <nav aria-label="Hovedmeny" className="flex items-stretch ax-md:hidden">
          <ActionMenu>
            <ActionMenu.Trigger>
              <InternalHeader.Button>
                <MenuHamburgerIcon title="Meny" fontSize="1.5rem" />
              </InternalHeader.Button>
            </ActionMenu.Trigger>
            <ActionMenu.Content align="end">
              {items.map((item) => {
                const active = item.isActive(pathname);
                return (
                  <ActionMenu.Item
                    key={item.href}
                    as={NextLink}
                    href={item.href}
                    prefetch={item.prefetch}
                    icon={item.icon}
                    aria-current={active ? "page" : undefined}
                    {...item.dataAttributes}
                  >
                    {item.label}
                  </ActionMenu.Item>
                );
              })}
            </ActionMenu.Content>
          </ActionMenu>
        </nav>
      </Page.Block>
    </InternalHeader>
  );
}

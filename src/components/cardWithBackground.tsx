"use client";
import { ArrowLeftIcon } from "@navikt/aksel-icons";
import { BodyLong, Box, Heading, HStack, Link as AkselLink, Page, VStack } from "@navikt/ds-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { type MouseEvent, type ReactNode, useEffect, useRef } from "react";
import { claimCurrentOverviewReturn, readOverviewReturn } from "./overviewReturn";

type CardWithBackgroundProps = {
  title?: string;
  /** Replaces the title heading, e.g. for a logo. Must contain the page's h1. */
  titleNode?: ReactNode;
  subtitle?: ReactNode;
  /** Shown left of the title, e.g. a date badge. */
  leading?: ReactNode;
  /** Shown below the title, e.g. time and tags. */
  meta?: ReactNode;
  /** Left-aligned hero actions below the title and metadata. */
  actions?: ReactNode;
  /** Organizer-only bar rendered above the hero, e.g. an OrganizerBar. */
  organizerBar?: ReactNode;
  children: ReactNode;
  backLink?: string;
  backText?: string;
  /** Return to the overview (filters and scroll) the user opened this page from, if known. */
  backToOverview?: boolean;
  scrollToTopOnMount?: boolean;
  /** Render children directly on the page background instead of inside a content card. */
  bare?: boolean;
};

export default function CardWithBackground(props: CardWithBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { backToOverview, scrollToTopOnMount } = props;

  useEffect(() => {
    if (scrollToTopOnMount && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [scrollToTopOnMount]);

  useEffect(() => {
    if (backToOverview) claimCurrentOverviewReturn();
  }, [backToOverview]);

  const handleBack = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!backToOverview || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = readOverviewReturn();
    if (!target) return;
    event.preventDefault();
    if (target.kind === "back") router.back();
    else router.push(target.path);
  };

  const heading = props.titleNode ?? (props.title && (
    <Heading level="1" size="xlarge" className="first-letter:uppercase">
      {props.title}
    </Heading>
  ));

  return (
    <div ref={containerRef} className="w-full flex flex-col">
      {props.organizerBar}
      <Box as="section" background="accent-soft" borderColor="neutral-subtle" borderWidth="0 0 1 0" paddingBlock={{ xs: "space-24", md: "space-40" }}>
        <Page.Block width="xl" gutters>
          <VStack gap="space-16">
            {props.backLink && props.backText && (
              <AkselLink as={NextLink} href={props.backLink} onClick={handleBack} className="w-fit font-ax-bold">
                {/* Thickens the outline icon to match the bold link text. */}
                <ArrowLeftIcon aria-hidden stroke="currentColor" strokeWidth={0.75} />
                {props.backText}
              </AkselLink>
            )}
            <HStack gap="space-16" align="center" wrap={false} className="min-w-0">
              {props.leading}
              <VStack gap="space-8" className="min-w-0">
                {heading}
                {props.subtitle && <BodyLong size="large" textColor="subtle">{props.subtitle}</BodyLong>}
                {props.meta}
              </VStack>
            </HStack>
            {props.actions && <HStack gap="space-8" wrap>{props.actions}</HStack>}
          </VStack>
        </Page.Block>
      </Box>
      <Page.Block width="xl" gutters className="py-6 ax-md:py-10">
        {props.bare ? props.children : (
          <Box background="raised" borderColor="neutral-subtle" borderWidth="1" borderRadius="12" padding={{ xs: "space-16", md: "space-24" }}>
            {props.children}
          </Box>
        )}
      </Page.Block>
    </div>
  );
}

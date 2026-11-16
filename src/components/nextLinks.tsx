"use client";

import { Button, type ButtonProps, Link, type LinkProps } from "@navikt/ds-react";
import NextLink from "next/link";

// Aksel components are client components, so Server Components can't pass `as={NextLink}` themselves.
type NextHref = { href: string };

export function AkselNextLink(props: Omit<LinkProps, "href"> & NextHref) {
  return <Link as={NextLink} {...props} />;
}

export function ButtonNextLink(props: ButtonProps & NextHref) {
  return <Button as={NextLink} {...props} />;
}

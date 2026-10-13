"use client";

import { Link } from "@navikt/ds-react";
import NextLink from "next/link";

export default function AdminEventLink({
  href,
  title,
}: {
  href: string;
  title: string;
}) {
  return (
    <Link as={NextLink} href={href} prefetch={false}>
      {title}
    </Link>
  );
}

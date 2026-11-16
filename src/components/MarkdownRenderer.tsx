"use client"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BodyLong, Heading, List } from "@navikt/ds-react";
import Link from "next/link";

export default function MarkdownRenderer({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <BodyLong spacing>{children}</BodyLong>,
        // User content renders below the page h1 and section h2, so markdown headings start at h3.
        h1: ({ children }) => (
          <Heading level="3" size="large" spacing>
            {children}
          </Heading>
        ),
        h2: ({ children }) => (
          <Heading level="4" size="medium" spacing>
            {children}
          </Heading>
        ),
        h3: ({ children }) => (
          <Heading level="5" size="small" spacing>
            {children}
          </Heading>
        ),
        h4: ({ children }) => (
          <Heading level="6" size="xsmall" spacing>
            {children}
          </Heading>
        ),
        h5: ({ children }) => (
          <Heading level="6" size="xsmall" spacing>
            {children}
          </Heading>
        ),
        h6: ({ children }) => (
          <Heading level="6" size="xsmall" spacing>
            {children}
          </Heading>
        ),
        a: ({ href, children }) => (
          <Link href={href ?? "#"} target="_blank" rel="noopener noreferrer">
            {children}
            <span className="sr-only"> (åpnes i ny fane)</span>
          </Link>
        ),
        ul: ({ children }) => <List>{children}</List>,
        ol: ({ children }) => <List as="ol">{children}</List>,
        li: ({ children }) => <List.Item>{children}</List.Item>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

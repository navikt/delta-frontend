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
        h1: ({ children }) => (
          <Heading size="large" spacing>
            {children}
          </Heading>
        ),
        h2: ({ children }) => (
          <Heading size="medium" spacing>
            {children}
          </Heading>
        ),
        h3: ({ children }) => (
          <Heading size="small" spacing>
            {children}
          </Heading>
        ),
        a: ({ href, children }) => (
          <Link href={href ?? "#"} target="_blank" rel="noopener noreferrer">
            {children}
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

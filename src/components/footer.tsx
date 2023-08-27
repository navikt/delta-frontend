"use client";

import { BodyShort, Heading, Link } from "@navikt/ds-react";
import dynamic from "next/dynamic";

const Footer = () => {
    return (
        <div className="bg-deepblue-800 w-full">
        <footer
            id="aksel-footer"
            data-hj-suppress
            data-theme="dark"
            className="flex pt-3 z-10 items-center w-5/6 max-w-[80rem] m-auto justify-between toc-ignore text-text-on-inverted bg-deepblue-800 relative flex justify-center"
        >
            <div className="relative z-10 mx-auto grid w-full max-w-screen-2xl gap-12 px-4 pb-16 pt-12 md:grid-cols-2 md:px-6 lg:grid-cols-2 xl:grid-cols-4 xl:gap-6">
                <LogoBlock />
                <Snarveier />
                <SideLenker />
                <Kontakt />
            </div>
        </footer>
        </div>
    );
};

function LogoBlock() {
    return (
        <div>
            <span className="mt-4 text-2xl whitespace-nowrap">Δ Delta</span>
            <p className="mt-3 leading-normal">&copy; {new Date().getFullYear()} NAV</p>
            <p className="leading-normal">Arbeids- og velferdsetaten</p>
        </div>
    );
}

function Snarveier() {
    return (
        <div>
            <Heading level="2" size="xsmall">
                Snarveier
            </Heading>
            <BodyShort as="ul" className="mt-3 grid gap-3">
                <FooterLink href="https://forms.office.com/e/LyKPTdaRw5">
                    Innspill til Delta
                </FooterLink>
                <FooterLink href="https://trello.com/b/lwLQ2ApY/delta-%CE%B4">
                    Veikart på Trello
                </FooterLink>
            </BodyShort>
        </div>
    );
}

function Kontakt() {
    return (
        <div>
            <Heading level="2" size="xsmall">
                Finn oss
            </Heading>
            <BodyShort as="ul" className="mt-3 grid gap-3">
                <FooterLink href="https://nav-it.slack.com/archives/C05E0NJ6Z0C">
                    Slack
                </FooterLink>
                <FooterLink href="https://github.com/navikt/delta-frontend#readme">
                    Github
                </FooterLink>
            </BodyShort>
        </div>
    );
}
function SideLenker() {
    return (
        <div>
            <Heading level="2" size="xsmall">
                Erklæringer
            </Heading>
            <BodyShort as="ul" className="mt-3 grid gap-3">
                <FooterLink href="/legal/privacy">
                    Personvern
                </FooterLink>
                <FooterLink href="/legal/accessibility">
                    Tilgjengelighet
                </FooterLink>
            </BodyShort>
        </div>
    );
}

// @ts-ignore
function FooterLink({ children, href }) {
    return (
        <li>
            <Link
                className="text-text-on-inverted focus:shadow-focus focus:text-text-default flex w-fit items-center gap-1 underline hover:no-underline focus:bg-blue-200 focus:shadow-blue-200"
                href={href}
            >
                {children}
            </Link>
        </li>
    );
}

export default Footer;
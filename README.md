# delta-frontend

[Delta](https://delta.nav.no) er en påmeldingsapp for Navs interne arrangementer.

## Henvendelser

Du kan sende spørsmål til [eilif.johansen@nav.no](mailto:eilif.johansen@nav.no).

## For NAV-ansatte

Du kan sende spørsmål i [#delta](https://nav-it.slack.com/archives/C05E0NJ6Z0C) på Slack, eller til [eilif.johansen@nav.no](mailto:eilif.johansen@nav.no)

## Delta backend

Kode på Github: [delta-backend](https://github.com/navikt/delta-backend)

## Avhengigheter

- Node.js 26
- npm som følger med Node.js 26 (minimum 11.10.0)

Vi bruker npm og sjekker inn `package-lock.json`. `.npmrc` setter `min-release-age=7`,
slik at nye pakkeversjoner må være minst sju dager gamle før vi installerer dem.
`engine-strict=true` gjør at npm avviser installasjon med andre Node.js-versjoner.

## Hvordan kjøre frontenden

- [Delta-backend](https://github.com/navikt/delta-backend) må kjøre før du starter Delta frontend
- Installer programvareavhengigheter
  - `npm ci`
- Om npm klager på at man ikke er autentisert:
  - Lag et [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) med tilgangen `read:packages`.
  - `npm login --registry=https://npm.pkg.github.com --auth-type=legacy`
  - Tokenet må autoriseres med NAVIKT.
  - Skriv inn et hvilket som helst brukernavn som brukernavn.
  - Passordet er ditt personal access token.
- Forsikre deg om at backenden kjører. Se i backend-repoet for instruksjoner om å spinne den opp.
- Start dev-versjon av frontend
  - `npm run dev`

## Kodekontroll

`npm run lint` kjører Biome med anbefalte React- og Next.js-regler. Manglende
hook-avhengigheter og array-indekser som React-nøkler gir advarsler.
Biome formaterer ikke koden og erstatter ikke alle reglene i `eslint-config-next`.
`npm run build` bygger appen og kontrollerer TypeScript-typene.

## Administrasjon

`/admin` er bare synlig og tilgjengelig for Delta-forvaltere. Frontenden og
backenden må ha samme `DELTA_MAINTAINERS_GROUP_ID`, og gruppen må stå under
`azure.application.claims.groups` i begge Nais-manifestene.

Oversikten teller alle lagrede arrangementer per kalendermodell, og viser også
kommende og pågående arrangementer (sluttid senere enn hentetidspunktet).
Private arrangementer er inkludert, og hver forekomst i en gjentakende serie
telles separat. Tallene hentes på nytt når siden lastes inn.

I lokal utvikling vises administrasjon i frontenden. Start backenden med
`DELTA_MAINTAINERS_GROUP_ID=local-principal-group ./gradlew run` for å gi
den lokale testbrukeren tilgang til statistikken.

# Bruk av AI

Delta er utviklet med hjelp av AI.

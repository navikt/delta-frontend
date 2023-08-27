# delta-frontend

[Delta](https://delta.nav.no) er en påmeldingsapp for NAVs interne arrangementer.

## Henvendelser

Du kan sende spørsmål til [eilif.johansen@nav.no](mailto:eilif.johansen@nav.no).

## For NAV-ansatte

Du kan sende spørsmål i [#delta](https://nav-it.slack.com/archives/C05E0NJ6Z0C) på Slack, eller til [eilif.johansen@nav.no](mailto:eilif.johansen@nav.no)

## Delta backend

Kode på Github: [delta-backend](https://github.com/navikt/delta-backend)

## Avhengigheter

- node
- npm

## Hvordan kjøre frontenden

- Delta backend må kjøre før du starter Delta frontend
- Installer programvareavhengigheter
  - `npm i`
- Om npm klager på at man ikke er autentisert:
  - Lag et [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) med tilgangen `read:packages`.
  - `npm login --registry=https://npm.pkg.github.com --auth-type=legacy`
  - Tokenet må autoriseres med NAVIKT.
  - Skriv inn et hvilket som helst brukernavn som brukernavn.
  - Passordet er ditt personal access token.
- Forsikre deg om at backenden kjører. Se i backend-repoet for instruksjoner om å spinne den opp.
- Start dev-versjon av frontend
  - `npm run dev`
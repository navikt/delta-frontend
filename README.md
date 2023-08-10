# delta-frontend

Frontenden som hører til [delta-backend](https://github.com/navikt/delta-backend)


## Avhengigheter

- node
- npm

## Hvordan kjøre backenden

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

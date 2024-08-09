---
title: REPL
subtitle: "_**R**eproducible **E**ngineering-**P**rogramming **L**ifecycles_"
when: Tidspunkt annonseres på Slack
audience: Utviklere
---

## Kontaktpersoner
- [Christian Chavez](https://nav-it.slack.com/team/U01A8737M1P)
- [Carl Hedgren](https://nav-it.slack.com/team/U04RW6KGVFW)

## Bakgrunn

CC (Carl&Christian) savnet en faggruppe som satte fokus på reproduserbarhet og konfigurasjonsskontroll innen software hos NAV IT.
Dermed bestemte vi oss for å opprette en faggruppe for ildsjeler rundt disse tema, og verktøy som støtter oppunder disse mål.

Eksempler på slike verktøy:
- [SLSA](https://docs.nais.io/security/salsa/salsa/index.html#salsa)
- [nix](https://en.wikipedia.org/wiki/Nix_(package_manager))
- [cue](http://cuelang.org/)
- [nickel](https://nickel-lang.org/)
- Tredjepartsdependency installatører/managers som byte-for-byte verifiserer nedlastede avh.
  - [Rust/Cargo](https://github.com/rust-lang/cargo)
  - [NodeJS/Yarn](https://github.com/yarnpkg/berry)
  - [NodeJS/NPM (Kun nyere(!!) versjoner)](https://nodejs.org/en/download)
  - ~~[Java&Kotlin/Maven&Gradle]()~~ IKKE MAVEN/GRADLE!!! Disse støtter ikke slik reproduserbarhet!!!

## Beskrivelse
Alt som faller innunder reproduserbarhet (f.eks. mavens manglende "lock fil" funksjonalitet sammenlignet m/yarn&npm, eller docker builds som er "replayable" og ikke "reproducible" av natur), og/eller konfigurasjonsskontroll (oppsett av alt fra utviklingsmiljø, tester, automasjon rundt kodeskriving og software lifecycles/produksjon).

https://reproducible-builds.org/

Følg med i slack-kanalen for interessante arrangementer / temaer / diskusjoner / verktøy! =D

## Slack-gruppe
[\#faggruppe-repl](https://nav-it.slack.com/archives/C0660KJULN6)

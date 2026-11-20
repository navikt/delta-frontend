import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { fromZonedTime } from "date-fns-tz";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const pages = [
  { name: "forside", path: "/" },
  { name: "forside, påmeldt", path: "/?onlyRegistered=1" },
  { name: "forside, ventelister", path: "/?tab=ventelister" },
  { name: "forside, mine", path: "/?tab=mine" },
  { name: "forside, tidligere påmeldt", path: "/?onlyRegistered=1&showPast=1" },
  { name: "forside, tidligere arrangør", path: "/?tab=mine&showPast=1" },
  { name: "mimretid", path: `/mimretid?year=${new Date().getFullYear() - 1}` },
  { name: "statistikk", path: "/statistikk" },
  { name: "arrangement som arrangør", path: "/event/e-hosted" },
  { name: "arrangement som deltaker", path: "/event/e-joined" },
  { name: "arrangement med venteliste", path: "/event/e-full" },
  { name: "deltakeradministrasjon", path: "/event/e-hosted/admin" },
  { name: "arrangement med påmeldingsalternativer", path: "/event/e-options" },
  { name: "deltakeradministrasjon med alternativer", path: "/event/e-options-hosted/admin" },
  { name: "rediger arrangement med alternativer", path: "/event/e-options-hosted/edit" },
  { name: "nytt arrangement", path: "/event/new" },
  { name: "rediger arrangement", path: "/event/e-hosted/edit" },
  { name: "faggrupper", path: "/faggrupper" },
  { name: "faggruppe", path: "/faggrupper/f1" },
  { name: "ny faggruppe", path: "/faggrupper/ny" },
  { name: "tilgjengelighetserklæring", path: "/legal/accessibility" },
  { name: "personvern", path: "/legal/privacy" },
];

async function expectNoViolations(page: Page, include?: string) {
  const builder = new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .exclude("nextjs-portal");
  if (include) builder.include(include);
  const results = await builder.analyze();
  const summary = results.violations.map(({ id, impact, help, nodes }) => ({
    id,
    impact,
    help,
    targets: nodes.map((node) => node.target.join(" ")),
    details: nodes.map((node) => node.failureSummary),
  }));
  expect(summary).toEqual([]);
}

async function gotoSettled(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("main#maincontent")).toBeVisible();
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
}

for (const { name, path } of pages) {
  test(`${name} (${path}) har ingen axe-brudd`, async ({ page }) => {
    await gotoSettled(page, path);
    await expectNoViolations(page);
  });
}

test("Påmeldt kan vise tidligere påmeldinger og beholder søk og URL-valg", async ({ page }) => {
  await gotoSettled(page, "/?onlyRegistered=1&search=Arrangement+jeg+er+påmeldt&extra=keep");
  const upcoming = page.getByRole("link", { name: "Arrangement jeg er påmeldt", exact: true });
  const history = page.getByRole("checkbox", { name: "Vis tidligere", exact: true });
  const years = page.getByRole("group", { name: "År", exact: true });
  const mimretid = page.getByRole("link", { name: "Se påmeldinger fra tidligere år i Mimretid", exact: true });
  await expect(upcoming).toBeVisible();
  await expect(mimretid).toHaveCount(0);
  const historyNavigation = page.waitForRequest(request => {
    const url = new URL(request.url());
    return url.pathname === "/" && url.searchParams.get("showPast") === "1";
  });
  await history.check();
  await historyNavigation;
  await expect(page).toHaveURL(/showPast=1/);
  await expect(page.getByText("Fant ingen arrangementer som passer «Arrangement jeg er påmeldt».", { exact: true })).toBeVisible();
  await expect(upcoming).toHaveCount(0);
  await expect(mimretid).toHaveCount(0);
  await expect(years).toBeVisible();
  expect(new URL(page.url()).searchParams.get("onlyRegistered")).toBe("1");
  expect(new URL(page.url()).searchParams.get("extra")).toBe("keep");
  await expect(page.getByRole("searchbox")).toHaveValue("Arrangement jeg er påmeldt");
  await page.getByRole("searchbox").fill("");
  await expect(page.getByText(`Du har ingen tidligere påmeldinger i ${new Date().getFullYear()}.`, { exact: true })).toBeVisible();
  await page.reload();
  await expect(history).toBeChecked();
  await expect(years).toBeVisible();
  await expectNoViolations(page);
  await history.uncheck();
  await expect(upcoming).toBeVisible();
  await expect(mimretid).toHaveCount(0);
  await expect(years).toHaveCount(0);
});

for (const mode of [
  { name: "Påmeldt", query: "onlyRegistered=1", count: 12, filteredCount: 1 },
  { name: "Jeg arrangerer", query: "tab=mine", count: 3, filteredCount: 0 },
]) {
  test(`${mode.name} viser år med antall og filtrerer historikken lokalt`, async ({ page }) => {
    const year = new Date().getFullYear();
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await gotoSettled(page, `/?${mode.query}&showPast=1&extra=keep`);
    const years = page.getByRole("group", { name: "År", exact: true });
    const select = years.getByRole("combobox", { name: "År", exact: true });
    const mobile = await select.isVisible();
    const expectCount = async (value: number, count: number) => {
      if (mobile) {
        await expect(select.getByRole("option", { name: `${value} (${count})`, exact: true })).toHaveCount(1);
      } else {
        await expect(years.getByRole("radio", { name: new RegExp(`^${value}\\s*${count}\\s+arrangementer$`) })).toBeVisible();
      }
    };
    const chooseYear = async (value: number) => {
      if (mobile) await select.selectOption(String(value));
      else await years.getByRole("radio", { name: new RegExp(`^${value}`) }).click();
      await expect(page).toHaveURL(url => url.searchParams.get("year") === String(value));
    };
    await expectCount(year, 0);
    await expectCount(year - 1, mode.count);
    await expectCount(year - 2, 1);
    const requests: string[] = [];
    page.on("request", request => {
      if (new URL(request.url()).pathname === "/") requests.push(request.url());
    });
    await chooseYear(year - 1);
    await expect(page.getByRole("link", { name: "Historisk arrangement 1", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Historisk arrangement \d+$/ })).toHaveCount(mode.count);
    await page.getByRole("searchbox").fill("11");
    await expectCount(year - 1, mode.filteredCount);
    await expectCount(year - 2, 0);
    await expect(page.getByRole("link", { name: /^Historisk arrangement \d+$/ })).toHaveCount(mode.filteredCount);
    await page.getByRole("searchbox").fill("");
    await expectCount(year - 1, mode.count);
    await chooseYear(year - 2);
    await expect(page.getByRole("link", { name: "Privat historisk tittel", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Historisk arrangement \d+$/ })).toHaveCount(0);
    expect(new URL(page.url()).searchParams.get("extra")).toBe("keep");
    expect(requests).toEqual([]);
    expect(errors).toEqual([]);
    await expectNoViolations(page);
    await page.reload();
    await expect(page.getByRole("link", { name: "Privat historisk tittel", exact: true })).toBeVisible();
    await expectCount(year - 1, mode.count);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("Mimretid bytter år lokalt, nullstiller siden og støtter tilbakeknappen", async ({ page }) => {
  const year = new Date().getFullYear();
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await gotoSettled(page, `/mimretid?year=${year - 1}&extra=keep`);
  const table = page.getByRole("table");
  await expect(table.getByRole("link", { name: "Historisk arrangement 1", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "2", exact: true }).click();
  await expect(table.getByRole("link", { name: "Historisk arrangement 11", exact: true })).toBeVisible();
  const requests: string[] = [];
  page.on("request", request => {
    if (new URL(request.url()).pathname === "/mimretid") requests.push(request.url());
  });
  await page.getByRole("radio", { name: String(year - 2), exact: true }).click();
  await expect(table.getByText("Privat arrangement", { exact: true })).toBeVisible();
  await expect(table.getByRole("link")).toHaveCount(0);
  await expect(page.getByText("Privat historisk tittel", { exact: true })).toHaveCount(0);
  await expect(page).toHaveURL(url => url.searchParams.get("year") === String(year - 2));
  expect(new URL(page.url()).searchParams.get("extra")).toBe("keep");
  await page.goBack();
  await expect(table.getByRole("link", { name: "Historisk arrangement 1", exact: true })).toBeVisible();
  await expect(table.getByRole("link", { name: "Historisk arrangement 11", exact: true })).toHaveCount(0);
  await page.getByRole("radio", { name: String(year), exact: true }).click();
  await expect(page.getByText(`Ingen arrangementer funnet for ${year}.`, { exact: true })).toBeVisible();
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});

test("Statistikk bytter år lokalt med riktige detaljer og støtter tilbakeknappen", async ({ page }) => {
  const year = new Date().getFullYear();
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await gotoSettled(page, `/statistikk?year=${year - 1}&extra=keep`);
  const selector = page.getByRole("combobox", { name: "Velg år" });
  await expect(page.getByRole("heading", { name: `Statistikk ${year - 1}`, exact: true })).toBeVisible();
  const requests: string[] = [];
  page.on("request", request => {
    if (new URL(request.url()).pathname === "/statistikk") requests.push(request.url());
  });
  await selector.selectOption(String(year));
  await expect(page.getByRole("heading", { name: `Statistikk ${year}`, exact: true })).toBeVisible();
  await expect(page).toHaveURL(url => !url.searchParams.has("year"));
  await expect(page).toHaveTitle(`Statistikk ${year} - Delta Δ Nav`);
  await page.getByRole("button", { name: "Klikk for detaljer →", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("link", { name: "Arrangement jeg arrangerer", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goBack();
  await expect(selector).toHaveValue(String(year - 1));
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("heading", { name: `Statistikk ${year - 1}`, exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.get("extra")).toBe("keep");
  await page.getByRole("button", { name: "Klikk for detaljer →", exact: true }).click();
  await expect(dialog.getByRole("link", { name: "Historisk arrangement 12", exact: true })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Arrangement jeg arrangerer", exact: true })).toHaveCount(0);
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(selector).toHaveValue(String(year - 1));
});

test("Statistikk støtter tomme år uten ugyldige prosentverdier", async ({ page }) => {
  await gotoSettled(page, "/statistikk?year=2023");
  await expect(page.getByRole("heading", { name: "Statistikk 2023", exact: true })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Velg år" })).toHaveValue("2023");
  await expect(page.getByText(/NaN|Infinity/)).toHaveCount(0);
  await expect(page.getByText("arrangementer (0%)", { exact: true })).toHaveCount(2);
});

test("arrangementskort skiller avsluttet, pågående og kommende uten å laste siden på nytt", async ({ page }) => {
  const beforeStart = new Date();
  beforeStart.setDate(beforeStart.getDate() + 2);
  beforeStart.setHours(8, 59, 30, 0);
  await page.clock.install({ time: fromZonedTime(beforeStart, "Europe/Oslo") });
  await gotoSettled(page, "/?tab=mine");
  const card = (name: string) => page.locator(".aksel-link-card").filter({
    has: page.getByRole("link", { name, exact: true }),
  });
  const hosted = card("Arrangement jeg arrangerer");
  const upcoming = card("Arrangement jeg er påmeldt");
  const ongoing = card("Fullt arrangement med venteliste");
  await expect(hosted.getByText("Pågår nå", { exact: true })).toHaveCount(0);
  await expect(hosted.getByText("Avsluttet", { exact: true })).toHaveCount(0);
  await page.clock.fastForward(30_000);
  await expect(hosted.getByText("Pågår nå", { exact: true })).toBeVisible();
  await page.clock.fastForward(6 * 60 * 60 * 1000);
  await expect(hosted.getByText("Avsluttet", { exact: true })).toBeVisible();
  await expect(hosted.getByText("Pågår nå", { exact: true })).toHaveCount(0);
  await expect(hosted.getByText(/plasser igjen|Utløpt/)).toHaveCount(0);
  await expect(ongoing.getByText("Pågår nå", { exact: true })).toBeVisible();
  await expect(upcoming.getByText(/Avsluttet|Pågår nå/)).toHaveCount(0);
  const upcomingBackground = await upcoming.evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(hosted).toHaveCSS("background-color", upcomingBackground);
  await expect(hosted.getByRole("link")).toBeEnabled();
  await expectNoViolations(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("delingsknapper har samme blåfarge", async ({ page }) => {
  await gotoSettled(page, "/event/e-hosted");
  const copy = page.getByRole("button", { name: "Kopier lenke", exact: true });
  const qr = page.getByRole("button", { name: "Vis QR-kode", exact: true });
  await expect(copy).toBeVisible();
  await expect(qr).toBeVisible();
  const qrStyle = await qr.evaluate((button) => {
    const style = getComputedStyle(button);
    return { color: style.color, boxShadow: style.boxShadow };
  });
  await expect(copy).toHaveCSS("color", qrStyle.color);
  await expect(copy).toHaveCSS("box-shadow", qrStyle.boxShadow);
});

for (const { id, action } of [
  { id: "e-options", action: "Bli med" },
  { id: "e-long-title", action: "Bli med" },
  { id: "e-joined", action: "Meld av" },
]) {
  test(`${action} står under tittel og metadata på ${id}`, async ({ page }) => {
    await gotoSettled(page, `/event/${id}`);
    const hero = page.locator("section").filter({ has: page.getByRole("heading", { level: 1 }) });
    const button = hero.getByRole("button", { name: action, exact: true });
    const buttonBounds = await button.boundingBox();
    const categoriesBounds = await hero.getByRole("list", { name: "Kategorier" }).boundingBox();
    const backBounds = await hero.getByRole("link", { name: "Alle arrangementer" }).boundingBox();
    if (!buttonBounds || !categoriesBounds || !backBounds) {
      throw new Error("Hero action, categories and back link must have visible bounds");
    }
    expect(buttonBounds.y - (categoriesBounds.y + categoriesBounds.height)).toBeGreaterThanOrEqual(16);
    expect(buttonBounds.x).toBeCloseTo(backBounds.x, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await button.click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
}

test("påmeldingsmodal har ingen axe-brudd", async ({ page }) => {
  await gotoSettled(page, "/event/e-full");
  await page.getByRole("button", { name: /venteliste|bli med|meld/i }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expectNoViolations(page);
});

test("valg av påmeldingsalternativ har ingen axe-brudd", async ({ page }) => {
  await gotoSettled(page, "/event/e-options");
  await page.getByRole("button", { name: "Bli med" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("radiogroup", { name: "Hvordan vil du delta?" })).toBeVisible();
  await expect(dialog).toHaveCSS("opacity", "1");
  await expectNoViolations(page);
});

test("signup summaries group each count with its option and separate capacity bars", async ({ page }) => {
  await gotoSettled(page, "/event/e-options");
  const options = page.getByRole("list", { name: "Påmeldte per alternativ" });
  const physical = options.getByRole("listitem").filter({ hasText: "Fysisk" });
  const digital = options.getByRole("listitem").filter({ hasText: "Digitalt" });
  const physicalSummary = physical.getByText("Fysisk · 1 av 30 plasser", { exact: true });
  await expect(physicalSummary).toBeVisible();
  await expect(digital.getByText("Digitalt · 0 påmeldt", { exact: true })).toBeVisible();
  const bar = physical.getByRole("progressbar", { name: "Fysisk: 1 av 30 plasser fylt" });
  await expect(bar).toBeVisible();
  await expect(digital.getByRole("progressbar")).toHaveCount(0);

  const summaryBounds = await physicalSummary.boundingBox();
  const barBounds = await bar.boundingBox();
  const physicalBounds = await physical.boundingBox();
  const digitalBounds = await digital.boundingBox();
  if (!summaryBounds || !barBounds || !physicalBounds || !digitalBounds) {
    throw new Error("Signup summary elements must have visible bounds");
  }
  const withinOptionGap = barBounds.y - (summaryBounds.y + summaryBounds.height);
  const betweenOptionsGap = digitalBounds.y - (physicalBounds.y + physicalBounds.height);
  expect(withinOptionGap).toBeGreaterThanOrEqual(0);
  expect(betweenOptionsGap).toBeGreaterThan(withinOptionGap);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const state of [
  { name: "uten avkryssing", checked: false, public: true },
  { name: "som kladd / privat", checked: true, public: false },
  { name: "etter å fjerne avkryssingen", checked: false, public: true, toggle: true },
]) {
  test(`nytt arrangement publiseres riktig ${state.name}`, async ({ page }) => {
    await gotoSettled(page, "/event/new");
    const privateEvent = page.getByRole("checkbox", { name: "Kladd / privat arrangement", exact: true });
    await expect(privateEvent).not.toBeChecked();
    await expect(privateEvent).toHaveAccessibleDescription(
      "Når dette er valgt, vises ikke arrangementet på forsiden til Delta, men kan deles via en direkte lenke.",
    );
    if (state.checked || state.toggle) await privateEvent.check();
    if (state.toggle) await privateEvent.uncheck();

    await page.getByRole("textbox", { name: "Tittel" }).fill("Test av synlighet");
    const date = new Date();
    date.setDate(date.getDate() + 7);
    const dateText = `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
    await page.locator("#startDate").fill(dateText);
    await page.locator("#startDate").press("Tab");
    await page.locator("#endDate").fill(dateText);
    await page.locator("#endDate").press("Tab");
    await page.getByLabel("Starttidspunkt").fill("10:00");
    await page.getByLabel("Sluttidspunkt").fill("11:00");
    await page.getByRole("radio", { name: "Digitalt", exact: true }).check();
    await page.getByRole("radio", { name: "Zoom", exact: true }).check();
    await page.getByRole("textbox", { name: "Beskrivelse", exact: true }).fill("Test av offentlig og privat arrangement.");

    await page.route("**/event/new", async route => {
      if (route.request().method() === "POST") await route.abort();
      else await route.continue();
    });
    const submission = page.waitForRequest(request =>
      request.method() === "POST" && !!request.headers()["next-action"],
    );
    await page.getByRole("button", { name: "Opprett", exact: true }).click();
    const request = await submission;
    const [formValues] = JSON.parse(request.postData() ?? "null");
    expect(formValues.public).toBe(state.public);
  });
}

test("påmeldingsalternativer i skjemaet har ingen axe-brudd", async ({ page }) => {
  await gotoSettled(page, "/event/new");
  await page.getByRole("checkbox", { name: "La deltakerne velge hvordan de deltar" }).check();
  await expect(page.getByRole("group", { name: "Påmeldingsalternativer" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Navn på alternativ 1" })).toHaveValue("Fysisk");
  await expectNoViolations(page);
});

test("forsidefiltre kombinerer tekstsøk og kategoriforslag med synlig etikett", async ({ page }) => {
  await gotoSettled(page, "/");
  const search = page.getByRole("searchbox", { name: "Søk etter tittel, sted, arrangør eller kategorier" });
  const types = page.getByRole("group", { name: "Type arrangement" });
  await expect(page.getByText("Søk etter tittel, sted, arrangør eller kategorier", { exact: true })).toBeVisible();
  await expect(search).not.toHaveAttribute("placeholder");

  const searchBounds = await search.boundingBox();
  const typeBounds = await types.boundingBox();
  expect(searchBounds).not.toBeNull();
  expect(typeBounds).not.toBeNull();
  if (searchBounds && typeBounds) {
    if ((page.viewportSize()?.width ?? 0) >= 1024) {
      expect(typeBounds.x).toBeGreaterThan(searchBounds.x + searchBounds.width);
    } else {
      expect(typeBounds.y).toBeGreaterThan(searchBounds.y + searchBounds.height);
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await search.fill("universell");
  const suggestion = page.getByRole("group", { name: "Kategoriforslag" })
    .getByRole("button", { name: "universell utforming", exact: true });
  await expect(suggestion).toBeVisible();
  await expectNoViolations(page);
  await suggestion.focus();
  await suggestion.press("Enter");
  await expect(search).toHaveValue("");
  await expect(page.getByRole("link", { name: "Arrangement jeg arrangerer", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Arrangement jeg er påmeldt", exact: true })).toHaveCount(0);
  const removeCategory = page.getByRole("button", { name: /universell utforming/ });
  await expect(removeCategory).toBeVisible();
  await expectNoViolations(page);
  await removeCategory.click();
  await search.fill("påmeldt");
  await expect(page.getByRole("link", { name: "Arrangement jeg er påmeldt", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Arrangement jeg arrangerer", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Tøm feltet", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await expect(page.getByRole("link", { name: "Arrangement jeg arrangerer", exact: true })).toBeVisible();
});

test("Fagtorsdag kan kombineres med type og egendefinerte kategorier er synlige fra URL", async ({ page }) => {
  await gotoSettled(page, "/");
  const competence = page.getByRole("button", { name: "Kompetanse", exact: true });
  const fagtorsdag = page.getByRole("button", { name: "Fagtorsdag", exact: true });
  await competence.click();
  await fagtorsdag.click();
  await expect(competence).toHaveAttribute("aria-pressed", "true");
  await expect(fagtorsdag).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: "Arrangement jeg arrangerer", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Arrangement jeg er påmeldt", exact: true })).toHaveCount(0);

  await gotoSettled(page, "/?categories=universell%20utforming");
  await expect(page.getByRole("button", { name: /universell utforming/ })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Søk etter tittel, sted, arrangør eller kategorier" })).toBeVisible();
});

test("logoen flukter med sideinnholdet på smale og brede skjermer", async ({ page }) => {
  await gotoSettled(page, "/");
  const logo = page.getByRole("banner").getByRole("link", { name: "Δ Delta", exact: true });
  const heading = page.getByRole("heading", { name: "Arrangementer", level: 1 });
  for (const width of [375, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(async () => {
      const textLeft = await logo.evaluate(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return range.getBoundingClientRect().left;
      });
      const headingBounds = await heading.boundingBox();
      if (!headingBounds) throw new Error("Sideoverskriften er ikke synlig");
      return Math.abs(textLeft - headingBounds.x);
    }).toBeLessThanOrEqual(1);
    await logo.focus();
    await expect(logo).toBeInViewport();
  }
});

test("hopp til hovedinnhold er første tabstopp og flytter fokus til main", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Tab order differs per browser");
  await gotoSettled(page, "/");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Hopp til hovedinnhold" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#maincontent")).toBeFocused();
});

test("mørk modus følger enheten og husker valget", async ({ page }) => {
  const hydrationErrors: string[] = [];
  page.on("console", message => {
    if (message.type() === "error" && /hydrat/i.test(message.text())) {
      hydrationErrors.push(message.text());
    }
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await gotoSettled(page, "/");
  const root = page.locator("html");
  const mainBackground = () => page.locator("main").evaluate(element => getComputedStyle(element).backgroundColor);
  await expect(root).toHaveClass(/\bdark\b/);
  const darkBackground = await mainBackground();

  await page.emulateMedia({ colorScheme: "light" });
  await expect(root).toHaveClass(/\blight\b/);
  await expect.poll(mainBackground).not.toBe(darkBackground);
  const toggle = page.getByRole("button", { name: "Mørk modus", exact: true });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(toggle).toBeInViewport();
  await toggle.focus();
  await toggle.press("Space");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(root).toHaveClass(/\bdark\b/);
  await expect.poll(mainBackground).toBe(darkBackground);
  await expectNoViolations(page);

  await page.emulateMedia({ colorScheme: "dark" });
  await page.emulateMedia({ colorScheme: "light" });
  await expect(root).toHaveClass(/\bdark\b/);
  await page.reload();
  await expect(root).toHaveClass(/\bdark\b/);
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(root).toHaveClass(/\blight\b/);
  await page.emulateMedia({ colorScheme: "dark" });
  await page.reload();
  await expect(root).toHaveClass(/\blight\b/);
  expect(hydrationErrors).toEqual([]);
});

for (const path of ["/", "/event/e-hosted", "/event/new"]) {
  test(`mørk modus (${path}) har ingen axe-brudd`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await gotoSettled(page, path);
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await expectNoViolations(page);
    const menuButton = page.getByRole("button", { name: "Meny", exact: true });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.getByRole("menu")).toHaveCSS("color-scheme", "dark");
      await expectNoViolations(page);
      await page.keyboard.press("Escape");
    }
    if (path === "/event/e-hosted") {
      await page.getByRole("button", { name: "Vis QR-kode" }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toHaveCSS("color-scheme", "dark");
      await expect.poll(() => dialog.evaluate(element => element.getAnimations().length)).toBe(0);
      await expectNoViolations(page);
    }
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`faggruppeinnhold er lesbart i ${theme} modus`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await gotoSettled(page, "/faggrupper/f1");
    if (theme === "dark") await page.getByRole("button", { name: "Mørk modus", exact: true }).click();
    await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
    await expect(page.getByRole("heading", { name: "Faggruppe for tilgjengelighet", level: 1 })).toBeVisible();
    await expectNoViolations(page);
  });

  test(`oppsummeringstabellen er lesbar i ${theme} modus`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 2);
    await gotoSettled(page, `/oppsummering/${eventDate.getFullYear()}`);
    if (theme === "dark") await page.getByRole("button", { name: "Mørk modus", exact: true }).click();
    await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
    const table = page.getByRole("table");
    await table.scrollIntoViewIfNeeded();
    await expect(table.getByRole("columnheader", { name: /Dato/ })).toBeVisible();
    await expect(table.getByRole("link", { name: "Arrangement jeg arrangerer", exact: true })).toBeVisible();
    await expectNoViolations(page, "main table");
  });
}

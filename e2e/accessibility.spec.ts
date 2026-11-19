import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { fromZonedTime } from "date-fns-tz";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const pages = [
  { name: "forside", path: "/" },
  { name: "forside, påmeldt", path: "/?onlyRegistered=1" },
  { name: "forside, ventelister", path: "/?tab=ventelister" },
  { name: "forside, mine", path: "/?tab=mine" },
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
  const mimretid = page.getByRole("link", { name: "Se påmeldinger fra tidligere år i Mimretid", exact: true });
  await expect(upcoming).toBeVisible();
  await expect(mimretid).toHaveCount(0);
  await history.check();
  await expect(page).toHaveURL(/showPast=1/);
  await expect(page.getByText("Fant ingen arrangementer som passer «Arrangement jeg er påmeldt».", { exact: true })).toBeVisible();
  await expect(upcoming).toHaveCount(0);
  await expect(mimretid).toHaveAttribute("href", "/mimretid");
  expect(new URL(page.url()).searchParams.get("onlyRegistered")).toBe("1");
  expect(new URL(page.url()).searchParams.get("extra")).toBe("keep");
  await expect(page.getByRole("searchbox")).toHaveValue("Arrangement jeg er påmeldt");
  await page.getByRole("searchbox").fill("");
  await expect(page.getByText("Du har ingen tidligere påmeldinger i år.", { exact: true })).toBeVisible();
  await page.reload();
  await expect(history).toBeChecked();
  await expect(mimretid).toBeVisible();
  await expectNoViolations(page);
  await history.uncheck();
  await expect(upcoming).toBeVisible();
  await expect(mimretid).toHaveCount(0);
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
  expect(await hosted.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(upcomingBackground);
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

import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

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
  { name: "nytt arrangement", path: "/event/new" },
  { name: "rediger arrangement", path: "/event/e-hosted/edit" },
  { name: "faggrupper", path: "/faggrupper" },
  { name: "faggruppe", path: "/faggrupper/f1" },
  { name: "ny faggruppe", path: "/faggrupper/ny" },
  { name: "tilgjengelighetserklæring", path: "/legal/accessibility" },
  { name: "personvern", path: "/legal/privacy" },
];

async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .exclude("nextjs-portal")
    .analyze();
  const summary = results.violations.map(({ id, impact, help, nodes }) => ({
    id,
    impact,
    help,
    targets: nodes.map((node) => node.target.join(" ")),
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

test("påmeldingsmodal har ingen axe-brudd", async ({ page }) => {
  await gotoSettled(page, "/event/e-full");
  await page.getByRole("button", { name: /venteliste|bli med|meld/i }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
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

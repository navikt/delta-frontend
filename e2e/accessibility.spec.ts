import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const pages = [
  { name: "forside", path: "/" },
  { name: "forside, påmeldt", path: "/?tab=pameldt" },
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

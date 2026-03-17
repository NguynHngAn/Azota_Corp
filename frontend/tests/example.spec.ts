import {
  test,
  expect,
  chromium,
  Browser,
  BrowserContext,
  Page,
} from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test("get started link", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Click the get started link.
  await page.getByRole("link", { name: "Get started" }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(
    page.getByRole("heading", { name: "Installation" }),
  ).toBeVisible();
});

test("Playwright test", async ({ page }) => {
  // // Launch a browser
  // const browser: Browser = await chromium.launch();
  // // Create a context
  // const context: BrowserContext = await browser.newContext();
  // // Create a page
  // const page: Page = await context.newPage();
  // // Go to a URL
  // await page.goto("http://pw-blog.congcu.org/");
  // // Expect the page to have a title
  // await expect(page).toHaveTitle(/Học automation test từ chưa biết gì/);
  // // Close the browser
  // await browser.close();
  // using fixture for Playwright test
  await page.goto("http://pw-blog.congcu.org/");
  await expect(page).toHaveTitle(/Học automation test từ chưa biết gì/);
});

import { test, expect } from "@playwright/test";

test.describe("Customer Portal Booking E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("customer login and navigate to portal", async ({ page }) => {
    await page.getByLabel("Username").fill("customer");
    await page.getByLabel("PIN").fill("123456");
    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForURL(/\/portal/);
    await expect(page.getByText("Customer Portal")).toBeVisible();
  });

  test("views upcoming appointments on home page", async ({ page }) => {
    await page.getByLabel("Username").fill("customer");
    await page.getByLabel("PIN").fill("123456");
    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForURL(/\/portal/);
    await expect(page.getByText("Appointment berikutnya")).toBeVisible();
  });

  test("books a new appointment", async ({ page }) => {
    await page.getByLabel("Username").fill("customer");
    await page.getByLabel("PIN").fill("123456");
    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForURL(/\/portal/);

    await page.getByRole("link", { name: "Appointment" }).click();
    await page.waitForURL(/\/portal\/appointments/);

    await page.getByRole("button", { name: "Booking Baru" }).click();

    await page.waitForSelector("form");

    const petSelect = page.locator("#pet-select");
    if ((await petSelect.count()) > 0) {
      await petSelect.selectOption({ index: 1 });
    }

    await page.fill("#appointment-date", "2026-08-25");
    await page.fill("#appointment-time", "10:00");
    await page.fill("#appointment-complaint", "Vaksin booster untuk anjing");

    await page.getByRole("button", { name: "Buat Appointment" }).click();

    await expect(page.getByText(/Buat Appointment|Membuat/)).toBeVisible({ timeout: 10000 });
  });

  test("views loyalty points on rewards page", async ({ page }) => {
    await page.getByLabel("Username").fill("customer");
    await page.getByLabel("PIN").fill("123456");
    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForURL(/\/portal/);

    await page.getByRole("link", { name: "Rewards" }).click();
    await page.waitForURL(/\/portal\/loyalty/);

    await expect(page.getByText("Total poin Anda")).toBeVisible();
  });

  test("views invoices page", async ({ page }) => {
    await page.getByLabel("Username").fill("customer");
    await page.getByLabel("PIN").fill("123456");
    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForURL(/\/portal/);

    await page.getByRole("link", { name: "Profile" }).click();
    await page.waitForURL(/\/portal\/profile/);

    await page.getByRole("link", { name: "Invoices" }).click();
    await page.waitForURL(/\/portal\/invoices/);

    await expect(page.getByText("Invoices")).toBeVisible();
  });

  test("views pet hotel page", async ({ page }) => {
    await page.getByLabel("Username").fill("customer");
    await page.getByLabel("PIN").fill("123456");
    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForURL(/\/portal/);

    await page.getByRole("link", { name: "Hotel" }).click();
    await page.waitForURL(/\/portal\/pet-hotel/);

    await expect(page.getByText("Pet Hotel")).toBeVisible();
  });

  test("views grooming page", async ({ page }) => {
    await page.getByLabel("Username").fill("customer");
    await page.getByLabel("PIN").fill("123456");
    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForURL(/\/portal/);

    await page.getByRole("link", { name: "Grooming" }).click();
    await page.waitForURL(/\/portal\/grooming/);

    await expect(page.getByText("Grooming")).toBeVisible();
  });

  test("views profile page", async ({ page }) => {
    await page.getByLabel("Username").fill("customer");
    await page.getByLabel("PIN").fill("123456");
    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForURL(/\/portal/);

    await page.getByRole("link", { name: "Profile" }).click();
    await page.waitForURL(/\/portal\/profile/);

    await expect(page.getByText("Profil Saya")).toBeVisible();
  });
});

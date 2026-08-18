import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("renders login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Selamat Datang")).toBeVisible();
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByTestId("numeric-keypad")).toBeVisible();
  });

  test("shows validation error for empty credentials", async ({ page }) => {
    await page.goto("/login");
    await page.click('button[type="submit"]');
    await expect(page.getByText("Username wajib diisi")).toBeVisible();
  });

  test("shows validation error for invalid PIN length", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="username"]', "testuser");
    await page.click('button[type="submit"]');
    await expect(page.getByText("PIN harus 6 digit angka")).toBeVisible();
  });

  test("login button is disabled when PIN is incomplete", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="username"]', "testuser");
    await page.click('[data-testid="key-1"]');
    await page.click('[data-testid="key-2"]');
    const submitButton = page.getByTestId("submit-button");
    await expect(submitButton).toBeDisabled();
  });

  test("numeric keypad inputs digits correctly", async ({ page }) => {
    await page.goto("/login");
    await page.click('[data-testid="key-1"]');
    await page.click('[data-testid="key-2"]');
    await page.click('[data-testid="key-3"]');
    await page.click('[data-testid="key-backspace"]');
    const boxes = await page.locator('[data-testid^="pin-box-"]').all();
    expect(await boxes[0].textContent()).toBe("1");
    expect(await boxes[1].textContent()).toBe("2");
  });
});

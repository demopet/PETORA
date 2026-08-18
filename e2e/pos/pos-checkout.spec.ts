import { test, expect } from "@playwright/test";

test.describe("POS Checkout E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("completes POS checkout flow", async ({ page }) => {
    await page.getByLabel("Username").fill("pos-e2e-user");
    await page.getByLabel("PIN").fill("123456");
    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForURL(/\/pos/);

    await page.waitForSelector('[data-testid="product-grid"]', { timeout: 10000 });

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();

    await expect(page.locator(".text-lg.font-semibold")).toContainText("Cart");

    await page.waitForSelector('[data-testid="checkout-button"]');

    await page.getByTestId("checkout-button").click();

    await expect(page.locator("text=Complete Checkout")).toBeVisible();

    await page.getByLabel("Amount Received").fill("100000");

    await page.getByRole("button", { name: "Complete Checkout" }).click();

    await expect(page.locator("text=Invoice created successfully")).toBeVisible();

    await page.goto("/invoices");

    await page.waitForSelector('[data-testid="invoice-table"]');

    const invoiceRow = page.locator('[data-testid="invoice-row"]').first();
    await expect(invoiceRow).toContainText("INV-");
  });

  test("hold and resume transaction", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Username").fill("pos-e2e-user");
    await page.getByLabel("PIN").fill("123456");
    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForURL(/\/pos/);

    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    await page.locator('[data-testid="product-card"]').first().click();

    await page.waitForSelector('[data-testid="hold-button"]');
    await page.getByTestId("hold-button").click();

    await expect(page.locator("text=Transaction held")).toBeVisible();

    await page.getByTestId("held-transactions-button").click();

    await expect(page.locator("text=Held Transactions")).toBeVisible();

    await page.locator('[data-testid="resume-transaction"]').first().click();

    await expect(page.locator("text=Transaction resumed")).toBeVisible();

    await expect(page.locator(".text-lg.font-semibold")).toContainText("Cart");
  });

  test("applies promotion code", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Username").fill("pos-e2e-user");
    await page.getByLabel("PIN").fill("123456");
    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForURL(/\/pos/);

    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    await page.locator('[data-testid="product-card"]').first().click();

    await page.getByPlaceholder("Enter promo code").fill("TESTPROMO");
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(page.locator("text=Promotion applied")).toBeVisible();
  });

  test("creates quick customer", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Username").fill("pos-e2e-user");
    await page.getByLabel("PIN").fill("123456");
    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForURL(/\/pos/);

    await page.waitForSelector('[data-testid="customer-select"]', { timeout: 10000 });

    await page.getByTestId("customer-select").selectOption("__quick_create__");

    await page.getByLabel("Name").fill("E2E Quick Customer");
    await page.getByLabel("Phone").fill("081234567890");
    await page.getByLabel("Email").fill("e2e@test.com");

    await page.getByRole("button", { name: "Create Customer" }).click();

    await expect(page.locator("text=Customer created successfully")).toBeVisible();
  });
});

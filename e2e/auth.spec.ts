import { test, expect } from "@playwright/test";

const EMAIL = "andi@sehatsentosa.id";
const PASSWORD = "password123";

test("login demo → dashboard", async ({ page }) => {
  await page.goto("/login");

  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');

  await page.waitForURL("**/dashboard");
  await expect(page).toHaveURL(/\/dashboard/);
  // Sidebar brand tampil setelah login
  await expect(page.getByText("SmaraMedika").first()).toBeVisible();
});

test("kredensial salah → tetap di /login", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', "salah-password");
  await page.click('button[type="submit"]');

  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/\/login/);
});

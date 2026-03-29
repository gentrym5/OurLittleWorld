// e2e/secure.spec.ts
// Playwright end-to-end tests for the Secure Section (/secure)
//
// NOTE: These tests only exercise the unauthenticated (password gate) state.
// The real password is NEVER used in tests — only the wrong-password error path is tested.

import { test, expect } from '@playwright/test';

test.describe('Secure Section — password gate', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/secure');
  });

  test('password gate renders "For Our Eyes Only" heading', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /for our eyes only/i });
    await expect(heading).toBeVisible();
  });

  test('password input field is visible', async ({ page }) => {
    const passwordInput = page.getByRole('textbox', { name: /password/i })
      .or(page.locator('input[type="password"]'));
    await expect(passwordInput.first()).toBeVisible();
  });

  test('submit / unlock button is visible', async ({ page }) => {
    // Look for any button that initiates the password check
    const unlockButton = page
      .getByRole('button', { name: /unlock|enter|submit|verify/i })
      .first();
    await expect(unlockButton).toBeVisible();
  });

  test('wrong password shows an error message', async ({ page }) => {
    // Fill in the wrong password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('definitely-wrong-password-12345');

    // Submit
    const submitButton = page.getByRole('button', { name: /unlock|enter|submit|verify/i }).first();
    await submitButton.click();

    // Wait for an error indication — either an alert role, or text containing "invalid" / "incorrect" / "wrong"
    const errorLocator = page
      .getByRole('alert')
      .or(page.getByText(/invalid|incorrect|wrong|error/i));

    await expect(errorLocator.first()).toBeVisible({ timeout: 5000 });
  });
});

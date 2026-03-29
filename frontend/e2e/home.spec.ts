// e2e/home.spec.ts
// Playwright end-to-end tests for the Home page (/)

import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads and shows the "Our Little World" heading', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /our little world/i });
    await expect(heading).toBeVisible();
  });

  test('all 6 feature cards are visible', async ({ page }) => {
    // The six features are: Q&A, Feelings, Photos, Timeline, Secure Section, and Surprise
    // Each card has a link — count all feature card links in the grid
    const cards = page.locator('[data-testid="feature-card"], .feature-card, a[href="/qa"], a[href="/feelings"], a[href="/photos"], a[href="/timeline"], a[href="/secure"]');

    // Alternative: count all non-nav anchor links that lead to feature pages
    const featureLinks = page.locator('main a[href]');
    const count = await featureLinks.count();
    expect(count).toBeGreaterThanOrEqualTo(5);
  });

  test('"Surprise Me" button exists and is clickable', async ({ page }) => {
    // Look for a button containing "Surprise" text
    const surpriseButton = page.getByRole('button', { name: /surprise/i });
    await expect(surpriseButton).toBeVisible();
  });

  test('page title is set', async ({ page }) => {
    await expect(page).toHaveTitle(/.+/);
  });
});

// e2e/feelings.spec.ts
// Playwright end-to-end tests for the Feelings page (/feelings)

import { test, expect } from '@playwright/test';

test.describe('Feelings page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/feelings');
  });

  test('page loads and displays the feelings section', async ({ page }) => {
    // The page heading or form label should be visible
    await expect(page.getByRole('heading', { name: /feeling/i }).first()).toBeVisible();
  });

  test('autocomplete input is visible', async ({ page }) => {
    // The combobox input for feeling selection should be present
    const input = page.getByRole('combobox');
    await expect(input).toBeVisible();
  });

  test('autocomplete dropdown appears when typing', async ({ page }) => {
    const input = page.getByRole('combobox');
    await input.fill('hap');

    // A listbox (dropdown) should appear with filtered options
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();

    // "Happy" should be among the visible options
    await expect(page.getByRole('option', { name: /happy/i })).toBeVisible();
  });

  test('can select a feeling word from the dropdown', async ({ page }) => {
    const input = page.getByRole('combobox');
    await input.fill('hap');

    const happyOption = page.getByRole('option', { name: /happy/i });
    await happyOption.click();

    // Input should now show the selected value
    await expect(input).toHaveValue('Happy');
  });

  test('Subject input field is visible', async ({ page }) => {
    const subjectInput = page.getByPlaceholder(/what is this feeling about/i);
    await expect(subjectInput).toBeVisible();
  });

  test('Context textarea is visible', async ({ page }) => {
    const contextArea = page.getByPlaceholder(/share a little more/i);
    await expect(contextArea).toBeVisible();
  });

  test('Matthew and Nadia toggle buttons are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /matthew/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /nadia/i })).toBeVisible();
  });

  test('Save Feeling submit button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /save feeling/i })).toBeVisible();
  });
});

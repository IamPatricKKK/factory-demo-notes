import { test, expect } from '@playwright/test';

test.describe('US-01: View header and list of saved notes', () => {
  test('US-01: user sees heading with exact text My Notes', async ({ page }) => {
    await page.goto('/');

    const heading = page.getByTestId('note-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('My Notes');
  });

  test('US-01: existing saved notes are listed below the form with title and body, sorted newest first, and persist across reload', async ({ page }) => {
    await page.goto('/');

    const timestamp1 = Date.now();
    const title1 = `First Note ${timestamp1}`;
    const body1 = `Body content for first note ${timestamp1}`;

    await page.getByTestId('note-title-input').fill(title1);
    await page.getByTestId('note-body-input').fill(body1);
    await page.getByTestId('note-save').click();

    const firstRow = page.getByTestId('note-row').filter({ hasText: title1 });
    await expect(firstRow).toBeVisible();
    await expect(firstRow).toContainText(body1);

    const timestamp2 = Date.now() + 10;
    const title2 = `Second Note ${timestamp2}`;
    const body2 = `Body content for second note ${timestamp2}`;

    await page.getByTestId('note-title-input').fill(title2);
    await page.getByTestId('note-body-input').fill(body2);
    await page.getByTestId('note-save').click();

    const secondRow = page.getByTestId('note-row').filter({ hasText: title2 });
    await expect(secondRow).toBeVisible();
    await expect(secondRow).toContainText(body2);

    const rows = page.getByTestId('note-row');
    await expect(rows.first()).toContainText(title2);

    await page.reload();

    const firstRowAfterReload = page.getByTestId('note-row').filter({ hasText: title1 });
    const secondRowAfterReload = page.getByTestId('note-row').filter({ hasText: title2 });

    await expect(firstRowAfterReload).toBeVisible();
    await expect(firstRowAfterReload).toContainText(body1);
    await expect(secondRowAfterReload).toBeVisible();
    await expect(secondRowAfterReload).toContainText(body2);

    await expect(page.getByTestId('note-row').first()).toContainText(title2);
  });
});

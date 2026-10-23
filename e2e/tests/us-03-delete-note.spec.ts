import { test, expect } from '@playwright/test';

test.describe('US-03: Delete a note that is no longer needed', () => {
  test('US-03: saved note has a Delete button', async ({ page }) => {
    await page.goto('/');

    const timestamp = Date.now();
    const title = `Note for Delete Check ${timestamp}`;
    const body = `Body for Delete Check ${timestamp}`;

    await page.getByTestId('note-title-input').fill(title);
    await page.getByTestId('note-body-input').fill(body);
    await page.getByTestId('note-save').click();

    const row = page.getByTestId('note-row').filter({ hasText: title });
    await expect(row).toBeVisible();

    const deleteButton = row.getByTestId('note-delete');
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).toHaveText('Delete');
  });

  test('US-03: clicking Delete removes the note immediately from the list', async ({ page }) => {
    await page.goto('/');

    const timestamp = Date.now();
    const title = `Note to Delete Immediately ${timestamp}`;
    const body = `Body to Delete Immediately ${timestamp}`;

    await page.getByTestId('note-title-input').fill(title);
    await page.getByTestId('note-body-input').fill(body);
    await page.getByTestId('note-save').click();

    const row = page.getByTestId('note-row').filter({ hasText: title });
    await expect(row).toBeVisible();

    await row.getByTestId('note-delete').click();

    await expect(row).toBeHidden();
  });

  test('US-03: deleted note remains absent after page reload', async ({ page }) => {
    await page.goto('/');

    const timestamp = Date.now();
    const title = `Note to Delete Persistently ${timestamp}`;
    const body = `Body to Delete Persistently ${timestamp}`;

    await page.getByTestId('note-title-input').fill(title);
    await page.getByTestId('note-body-input').fill(body);
    await page.getByTestId('note-save').click();

    const row = page.getByTestId('note-row').filter({ hasText: title });
    await expect(row).toBeVisible();

    await row.getByTestId('note-delete').click();
    await expect(row).toBeHidden();

    await page.reload();

    const rowAfterReload = page.getByTestId('note-row').filter({ hasText: title });
    await expect(rowAfterReload).toHaveCount(0);
  });
});

import { test, expect } from '@playwright/test';

test.describe('US-02: Create a new note with a title and body', () => {
  test('US-02: user sees title input, body textarea, and save note button', async ({ page }) => {
    await page.goto('/');

    const titleInput = page.getByLabel('Title');
    const bodyInput = page.getByLabel('Body');
    const saveButton = page.getByRole('button', { name: 'Save note' });

    await expect(titleInput).toBeVisible();
    await expect(bodyInput).toBeVisible();
    await expect(saveButton).toBeVisible();

    await expect(page.getByTestId('note-title-input')).toBeVisible();
    await expect(page.getByTestId('note-body-input')).toBeVisible();
    await expect(page.getByTestId('note-save')).toBeVisible();
  });

  test('US-02: filling title and body then clicking Save note saves note at top and clears form fields', async ({ page }) => {
    await page.goto('/');

    const timestamp = Date.now();
    const title = `Note to save ${timestamp}`;
    const body = `Body to save ${timestamp}`;

    const titleInput = page.getByTestId('note-title-input');
    const bodyInput = page.getByTestId('note-body-input');
    const saveButton = page.getByTestId('note-save');

    await titleInput.fill(title);
    await bodyInput.fill(body);
    await saveButton.click();

    const createdRow = page.getByTestId('note-row').filter({ hasText: title });
    await expect(createdRow).toBeVisible();
    await expect(createdRow).toContainText(body);

    const firstRow = page.getByTestId('note-row').first();
    await expect(firstRow).toContainText(title);

    await expect(titleInput).toHaveValue('');
    await expect(bodyInput).toHaveValue('');
  });

  test('US-02: newly created note persists in notes list across page reload', async ({ page }) => {
    await page.goto('/');

    const timestamp = Date.now();
    const title = `Persisting Note ${timestamp}`;
    const body = `Persisting Body ${timestamp}`;

    await page.getByTestId('note-title-input').fill(title);
    await page.getByTestId('note-body-input').fill(body);
    await page.getByTestId('note-save').click();

    const createdRow = page.getByTestId('note-row').filter({ hasText: title });
    await expect(createdRow).toBeVisible();

    await page.reload();

    const persistedRow = page.getByTestId('note-row').filter({ hasText: title });
    await expect(persistedRow).toBeVisible();
    await expect(persistedRow).toContainText(body);
  });
});

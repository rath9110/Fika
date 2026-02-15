import { test, expect } from '@playwright/test';

test.describe('Fika Core Flows', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the app
        await page.goto('/');
    });

    test('should unlock the vault and show dashboard', async ({ page }) => {
        // Check if Vault is visible
        await expect(page.locator('text=Unlock your Vault')).toBeVisible();

        // Enter password
        await page.fill('input[type="password"]', 'fika123');
        await page.click('button:has-text("Open the Brew")');

        // Vault should be gone and Dashboard visible
        await expect(page.locator('text=Unlock your Vault')).not.toBeVisible();
        await expect(page.locator('h1:has-text("Fika")')).toBeVisible();
        await expect(page.locator('text=Daily Espresso')).toBeVisible();
    });

    test('should open add contact modal', async ({ page }) => {
        // Unlock first
        await page.fill('input[type="password"]', 'fika123');
        await page.click('button:has-text("Open the Brew")');

        // Click Add Contact
        await page.click('button:has-text("Add Contact")');

        // Modal should be visible
        await expect(page.locator('text=New Connection')).toBeVisible();
        await expect(page.locator('label:has-text("Name")')).toBeVisible();
    });

    test('should add a new contact and show it in the dashboard', async ({ page }) => {
        // Unlock
        await page.fill('input[type="password"]', 'fika123');
        await page.click('button:has-text("Open the Brew")');

        // Open Modal
        await page.click('button:has-text("Add Contact")');

        // Fill Form
        await page.fill('placeholder="Who are we connecting with?"', 'Uncle Bob');
        await page.click('button:has-text("Monthly Sit-down")');
        await page.fill('placeholder="The last thing we laughed about..."', 'Clean Code jokes');

        // Save
        await page.click('button:has-text("Save Profile")');

        // Modal should close and contact should appear
        await expect(page.locator('text=New Connection')).not.toBeVisible();

        // Check in Monthly Sit-down tier (the 3rd column usually)
        const monthlySection = page.locator('div:has-text("Monthly Sit-down")').locator('..');
        await expect(monthlySection.locator('text=Uncle Bob')).toBeVisible();
        await expect(monthlySection.locator('text=Last laugh: Clean Code jokes')).toBeVisible();
    });
});

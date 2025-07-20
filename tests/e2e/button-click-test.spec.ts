import { test, expect } from '@playwright/test';

test.describe('UI Button Click Test', () => {
  test('buttons should be clickable on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Navigate to the game
    await page.goto('http://localhost:3000');
    
    // Wait for game to load
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Try clicking the pause button
    console.log('Testing pause button click...');
    const pauseButton = page.locator('button[title="Pause"]').or(page.locator('button[title="Play"]'));
    
    // Check if visible
    await expect(pauseButton).toBeVisible();
    console.log('✅ Pause button is visible');
    
    // Try to click it
    await pauseButton.click();
    console.log('✅ Pause button clicked successfully!');
    
    // Try clicking a power button
    console.log('Testing power button click...');
    const raiseLandButton = page.locator('button[title*="Raise Land"]');
    await expect(raiseLandButton).toBeVisible();
    console.log('✅ Raise Land button is visible');
    
    await raiseLandButton.click();
    console.log('✅ Raise Land button clicked successfully!');
    
    // Verify button got selected (should have different style)
    await expect(raiseLandButton).toHaveClass(/bg-yellow-500/);
    console.log('✅ Raise Land button shows selected state');
    
    // Try clicking on terrain
    console.log('Testing terrain click...');
    const canvas = page.locator('canvas');
    await canvas.click({ position: { x: 200, y: 400 } });
    console.log('✅ Canvas clicked successfully!');
    
    // Take screenshot for verification
    await page.screenshot({ path: 'screenshots/button-click-test.png' });
    console.log('✅ Screenshot saved');
    
    console.log('🎉 All UI buttons are clickable!');
  });
});
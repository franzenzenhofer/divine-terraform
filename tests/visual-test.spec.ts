import { test, expect } from '@playwright/test';

test.describe('Divine Terraform Visual Tests', () => {
  test('capture game screenshots', async ({ page }) => {
    // Go to the game
    await page.goto('http://localhost:3000');
    
    // Wait for the game to load
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // Wait for loading screen to disappear
    await page.waitForSelector('.loading-screen', { state: 'hidden', timeout: 10000 });
    
    // Take screenshot of 3D view
    await page.screenshot({ 
      path: 'screenshots/3d-view.png',
      fullPage: true 
    });
    
    // Click the isometric view toggle button
    const toggleButton = await page.locator('button:has-text("Isometric View")');
    await toggleButton.click();
    
    // Wait a moment for the view to switch
    await page.waitForTimeout(2000);
    
    // Take screenshot of isometric view
    await page.screenshot({ 
      path: 'screenshots/isometric-view.png',
      fullPage: true 
    });
    
    // Try to interact with terrain in isometric view
    await page.mouse.click(400, 300);
    await page.waitForTimeout(1000);
    
    // Take another screenshot showing interaction
    await page.screenshot({ 
      path: 'screenshots/isometric-interaction.png',
      fullPage: true 
    });
    
    // Switch back to 3D view
    const toggle3DButton = await page.locator('button:has-text("3D View")');
    await toggle3DButton.click();
    await page.waitForTimeout(1000);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'screenshots/3d-view-final.png',
      fullPage: true 
    });
  });
  
  test('check Populous-style isometric rendering', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.loading-screen', { state: 'hidden', timeout: 10000 });
    
    // Switch to isometric view
    await page.click('button:has-text("Isometric View")');
    await page.waitForTimeout(2000);
    
    // Check if canvas exists (isometric view should have canvas)
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Take a screenshot specifically of the game area
    const gameArea = await page.locator('#root');
    await gameArea.screenshot({ 
      path: 'screenshots/populous-style-view.png' 
    });
    
    // Try WASD movement
    await page.keyboard.press('w');
    await page.waitForTimeout(500);
    await page.keyboard.press('d');
    await page.waitForTimeout(500);
    
    await gameArea.screenshot({ 
      path: 'screenshots/populous-style-movement.png' 
    });
  });
});
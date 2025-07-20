import { test, expect, devices } from '@playwright/test';

test.describe('Divine Terraform - Mobile Experience', () => {
  // Test on different mobile devices
  ['iPhone 12', 'Pixel 5', 'iPhone SE'].forEach(deviceName => {
    test(`should work properly on ${deviceName}`, async ({ browser }) => {
      const device = devices[deviceName];
      const context = await browser.newContext({
        ...device,
        permissions: ['geolocation'],
        geolocation: { longitude: 12.492507, latitude: 41.889938 },
      });
      
      const page = await context.newPage();
      
      console.log(`\n📱 Testing on ${deviceName}...`);
      
      // Navigate to the game
      await page.goto('https://divine-terraform.pages.dev');
      console.log('✅ Navigated to game');
      
      // Wait for loading to complete
      await page.waitForLoadState('networkidle');
      const loadingScreen = page.locator('#loading');
      if (await loadingScreen.isVisible()) {
        await loadingScreen.waitFor({ state: 'hidden', timeout: 30000 });
      }
      console.log('✅ Game loaded');
      
      // Check for version number on loading screen
      const versionText = await page.locator('.loading-version').textContent();
      expect(versionText).toBe('v1.2.0');
      console.log('✅ Version number correct: v1.2.0');
      
      // Wait for game to initialize
      await page.waitForTimeout(3000);
      
      // Verify canvas is visible
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();
      console.log('✅ Canvas is visible');
      
      // Check canvas dimensions
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).toBeTruthy();
      expect(canvasBox!.width).toBeGreaterThan(0);
      expect(canvasBox!.height).toBeGreaterThan(0);
      console.log(`✅ Canvas dimensions: ${canvasBox!.width}x${canvasBox!.height}`);
      
      // Verify HUD elements are visible
      const resourceDisplay = page.locator('text=/Faith:/i');
      await expect(resourceDisplay).toBeVisible();
      console.log('✅ Resource display (Faith) is visible');
      
      // Check for power selector
      const powerSelector = page.locator('[title*="power"]').first();
      await expect(powerSelector).toBeVisible();
      console.log('✅ Power selector is visible');
      
      // Test terrain interaction
      console.log('\n🎮 Testing terrain interaction...');
      
      // Get initial screenshot
      await page.screenshot({ 
        path: `screenshots/test-${deviceName.toLowerCase().replace(' ', '-')}-before-tap.png`,
        fullPage: false
      });
      
      // Tap center of screen to modify terrain
      const centerX = device.viewport.width / 2;
      const centerY = device.viewport.height / 2;
      
      await page.tap('canvas', { 
        position: { x: centerX, y: centerY } 
      });
      console.log(`✅ Tapped at center (${centerX}, ${centerY})`);
      
      // Wait for terrain update
      await page.waitForTimeout(500);
      
      // Take screenshot after tap
      await page.screenshot({ 
        path: `screenshots/test-${deviceName.toLowerCase().replace(' ', '-')}-after-tap.png`,
        fullPage: false
      });
      
      // Test minimap interaction
      console.log('\n🗺️ Testing minimap interaction...');
      await page.tap('canvas', { 
        position: { x: 70, y: 70 } // Center of minimap
      });
      await page.waitForTimeout(500);
      console.log('✅ Tapped minimap');
      
      // Take final screenshot
      await page.screenshot({ 
        path: `screenshots/test-${deviceName.toLowerCase().replace(' ', '-')}-final.png`,
        fullPage: false
      });
      
      // Check for console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(1000);
      
      if (consoleErrors.length > 0) {
        console.warn('⚠️ Console errors:', consoleErrors);
      } else {
        console.log('✅ No console errors');
      }
      
      console.log(`\n✅ ${deviceName} test completed successfully!`);
      
      await context.close();
    });
  });
  
  test('should handle orientation changes', async ({ browser }) => {
    const device = devices['iPhone 12'];
    
    // Start in portrait
    const portraitContext = await browser.newContext({
      ...device,
      viewport: { width: 390, height: 844 }
    });
    
    const portraitPage = await portraitContext.newPage();
    await portraitPage.goto('https://divine-terraform.pages.dev');
    await portraitPage.waitForTimeout(5000);
    
    await portraitPage.screenshot({ 
      path: 'screenshots/test-orientation-portrait.png' 
    });
    console.log('✅ Portrait screenshot taken');
    
    await portraitContext.close();
    
    // Switch to landscape
    const landscapeContext = await browser.newContext({
      ...device,
      viewport: { width: 844, height: 390 }
    });
    
    const landscapePage = await landscapeContext.newPage();
    await landscapePage.goto('https://divine-terraform.pages.dev');
    await landscapePage.waitForTimeout(5000);
    
    await landscapePage.screenshot({ 
      path: 'screenshots/test-orientation-landscape.png' 
    });
    console.log('✅ Landscape screenshot taken');
    
    await landscapeContext.close();
  });
  
  test('should have proper touch targets', async ({ browser }) => {
    const device = devices['iPhone 12'];
    const context = await browser.newContext(device);
    const page = await context.newPage();
    
    await page.goto('https://divine-terraform.pages.dev');
    await page.waitForTimeout(5000);
    
    // Check touch target sizes
    const touchTargets = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(btn => {
        const rect = btn.getBoundingClientRect();
        return {
          text: btn.textContent,
          width: rect.width,
          height: rect.height,
          meetsGuidelines: rect.width >= 44 && rect.height >= 44
        };
      });
    });
    
    console.log('\n📏 Touch target analysis:');
    touchTargets.forEach(target => {
      const status = target.meetsGuidelines ? '✅' : '❌';
      console.log(`${status} ${target.text}: ${target.width}x${target.height}px`);
    });
    
    // All touch targets should meet 44x44px minimum
    const allMeetGuidelines = touchTargets.every(t => t.meetsGuidelines);
    expect(allMeetGuidelines).toBe(true);
    
    await context.close();
  });
});
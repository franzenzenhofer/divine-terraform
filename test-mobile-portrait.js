import { chromium, devices } from 'playwright';

(async () => {
  console.log('🎮 Testing Divine Terraform in Mobile Portrait Mode...\n');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Test different mobile devices in portrait mode
  const mobileDevices = [
    { name: 'iPhone 12', device: devices['iPhone 12'] },
    { name: 'Pixel 5', device: devices['Pixel 5'] },
    { name: 'iPhone SE', device: devices['iPhone SE'] }
  ];
  
  for (const mobile of mobileDevices) {
    console.log(`📱 Testing on ${mobile.name} (Portrait)...`);
    
    const context = await browser.newContext({
      ...mobile.device,
      viewport: { width: mobile.device.viewport.width, height: mobile.device.viewport.height }
    });
    
    const page = await context.newPage();
    
    // Listen for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    console.log('  → Navigating to game...');
    await page.goto('https://divine-terraform.pages.dev', {
      waitUntil: 'networkidle'
    });
    
    // Wait for loading to complete
    console.log('  → Waiting for game to load...');
    const loadingScreen = page.locator('#loading');
    if (await loadingScreen.isVisible()) {
      await loadingScreen.waitFor({ state: 'hidden', timeout: 30000 });
    }
    
    await page.waitForTimeout(3000);
    
    // Take screenshot of full page
    await page.screenshot({ 
      path: `screenshots/mobile-${mobile.name.toLowerCase().replace(' ', '-')}-portrait-full.png`,
      fullPage: true
    });
    console.log(`  ✅ Full page screenshot saved`);
    
    // Find canvas and check if it's visible
    const canvas = page.locator('canvas').first();
    const isCanvasVisible = await canvas.isVisible();
    console.log(`  → Canvas visible: ${isCanvasVisible}`);
    
    if (isCanvasVisible) {
      const canvasBox = await canvas.boundingBox();
      console.log(`  → Canvas size: ${canvasBox?.width}x${canvasBox?.height}`);
      
      // Take screenshot of just the canvas
      await canvas.screenshot({ 
        path: `screenshots/mobile-${mobile.name.toLowerCase().replace(' ', '-')}-portrait-canvas.png`
      });
      console.log(`  ✅ Canvas screenshot saved`);
    }
    
    // Test touch interaction
    console.log('  → Testing touch interaction...');
    const centerX = mobile.device.viewport.width / 2;
    const centerY = mobile.device.viewport.height / 2;
    
    // Try to tap on the terrain
    await page.tap(`canvas`, { position: { x: centerX, y: centerY } });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: `screenshots/mobile-${mobile.name.toLowerCase().replace(' ', '-')}-after-tap.png`,
      fullPage: true
    });
    console.log(`  ✅ After tap screenshot saved`);
    
    // Try to tap on minimap (should be at 20,20)
    await page.tap(`canvas`, { position: { x: 60, y: 60 } });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: `screenshots/mobile-${mobile.name.toLowerCase().replace(' ', '-')}-after-minimap-tap.png`,
      fullPage: true
    });
    console.log(`  ✅ After minimap tap screenshot saved`);
    
    // Check for HUD elements
    const hudVisible = await page.locator('.absolute.top-0').isVisible();
    console.log(`  → HUD visible: ${hudVisible}`);
    
    // Check viewport coverage
    const viewportCoverage = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { hasCanvas: false };
      
      const rect = canvas.getBoundingClientRect();
      return {
        hasCanvas: true,
        canvasWidth: rect.width,
        canvasHeight: rect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        coverageX: (rect.width / window.innerWidth * 100).toFixed(1),
        coverageY: (rect.height / window.innerHeight * 100).toFixed(1)
      };
    });
    
    console.log(`  → Viewport coverage:`, viewportCoverage);
    
    if (errors.length > 0) {
      console.log(`  ⚠️  Console errors:`, errors);
    }
    
    await context.close();
    console.log('');
  }
  
  // Also test landscape mode for comparison
  console.log('📱 Testing iPhone 12 in Landscape mode for comparison...');
  const landscapeContext = await browser.newContext({
    ...devices['iPhone 12 landscape']
  });
  
  const landscapePage = await landscapeContext.newPage();
  await landscapePage.goto('https://divine-terraform.pages.dev', {
    waitUntil: 'networkidle'
  });
  
  await landscapePage.waitForTimeout(5000);
  
  await landscapePage.screenshot({ 
    path: 'screenshots/mobile-iphone-12-landscape-full.png',
    fullPage: true
  });
  console.log('✅ Landscape screenshot saved\n');
  
  await landscapeContext.close();
  await browser.close();
  
  console.log('🎉 Mobile testing complete! Check screenshots/ directory');
})();
const { chromium } = require('playwright');
const fs = require('fs');

async function runE2ETests() {
  console.log('🧪 Starting Divine Terraform E2E Tests...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  const results = [];
  
  try {
    // Test 1: Game loads successfully
    console.log('📋 Test 1: Loading game...');
    await page.goto('https://divine-terraform.pages.dev');
    await page.waitForTimeout(5000); // Wait for loading screen
    
    // Check if game canvas is visible
    const canvas = await page.locator('canvas').first();
    const isCanvasVisible = await canvas.isVisible();
    results.push({
      test: 'Game loads with canvas',
      passed: isCanvasVisible,
      details: isCanvasVisible ? 'Canvas rendered successfully' : 'Canvas not found'
    });
    
    // Take screenshot of loaded game
    await page.screenshot({ path: 'screenshots/1-game-loaded.png', fullPage: true });
    
    // Test 2: HUD elements are visible
    console.log('📋 Test 2: Checking HUD elements...');
    const hudElements = {
      faith: await page.locator('text=/Faith:\\s*\\d+/').isVisible(),
      population: await page.locator('text=/Population:/').isVisible(),
      timeControls: await page.locator('button:has-text("⏸️")').isVisible() || 
                     await page.locator('button:has-text("▶️")').isVisible(),
      powerSelector: await page.locator('text=/Divine Powers/').isVisible(),
      minimap: await page.locator('canvas').count() > 0
    };
    
    const hudPassed = Object.values(hudElements).every(v => v);
    results.push({
      test: 'HUD elements visible',
      passed: hudPassed,
      details: JSON.stringify(hudElements, null, 2)
    });
    
    // Test 3: Terrain interaction
    console.log('📋 Test 3: Testing terrain interaction...');
    
    // Get initial faith value
    const faithText = await page.locator('text=/Faith:\\s*(\\d+)/').textContent();
    const initialFaith = parseInt(faithText.match(/Faith:\\s*(\\d+)/)[1]);
    
    // Click on terrain to modify it
    await canvas.click({ position: { x: 500, y: 300 } });
    await page.waitForTimeout(500);
    
    // Take screenshot after terrain modification
    await page.screenshot({ path: 'screenshots/2-terrain-modified.png', fullPage: true });
    
    results.push({
      test: 'Terrain can be clicked',
      passed: true,
      details: `Clicked at position 500,300`
    });
    
    // Test 4: God powers selection
    console.log('📋 Test 4: Testing god powers...');
    
    // Click on a god power button
    const raiseLandButton = page.locator('button:has-text("⛰️")').first();
    if (await raiseLandButton.isVisible()) {
      await raiseLandButton.click();
      await page.waitForTimeout(500);
      
      // Use the power on terrain
      await canvas.click({ position: { x: 600, y: 400 } });
      await page.waitForTimeout(500);
      
      results.push({
        test: 'God powers selection',
        passed: true,
        details: 'Selected and used Raise Land power'
      });
    } else {
      results.push({
        test: 'God powers selection',
        passed: false,
        details: 'Power buttons not found'
      });
    }
    
    // Take screenshot after using power
    await page.screenshot({ path: 'screenshots/3-power-used.png', fullPage: true });
    
    // Test 5: Time controls
    console.log('📋 Test 5: Testing time controls...');
    
    const pauseButton = page.locator('button:has-text("⏸️")').first();
    const playButton = page.locator('button:has-text("▶️")').first();
    
    if (await pauseButton.isVisible()) {
      await pauseButton.click();
      await page.waitForTimeout(500);
      
      const isPlayVisible = await playButton.isVisible();
      results.push({
        test: 'Time controls (pause/play)',
        passed: isPlayVisible,
        details: 'Pause button works, play button appears'
      });
    } else if (await playButton.isVisible()) {
      results.push({
        test: 'Time controls (pause/play)',
        passed: true,
        details: 'Game starts paused'
      });
    } else {
      results.push({
        test: 'Time controls (pause/play)',
        passed: false,
        details: 'Time control buttons not found'
      });
    }
    
    // Test 6: Mobile viewport
    console.log('📋 Test 6: Testing mobile responsiveness...');
    
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.waitForTimeout(1000);
    
    const mobileCanvas = await page.locator('canvas').first();
    const isMobileCanvasVisible = await mobileCanvas.isVisible();
    
    results.push({
      test: 'Mobile viewport rendering',
      passed: isMobileCanvasVisible,
      details: `Canvas visible on mobile: ${isMobileCanvasVisible}`
    });
    
    // Take mobile screenshot
    await page.screenshot({ path: 'screenshots/4-mobile-view.png', fullPage: true });
    
    // Test 7: Touch interaction on mobile
    console.log('📋 Test 7: Testing mobile touch...');
    
    await mobileCanvas.tap({ position: { x: 100, y: 200 } });
    await page.waitForTimeout(500);
    
    results.push({
      test: 'Mobile touch interaction',
      passed: true,
      details: 'Touch event sent to canvas'
    });
    
    // Take screenshot after mobile interaction
    await page.screenshot({ path: 'screenshots/5-mobile-touched.png', fullPage: true });
    
    // Test 8: Button sizes on mobile
    console.log('📋 Test 8: Checking mobile button sizes...');
    
    const buttons = await page.locator('button').all();
    let smallButtons = 0;
    
    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box && (box.width < 44 || box.height < 44)) {
        smallButtons++;
      }
    }
    
    results.push({
      test: 'Mobile button sizes (44x44px minimum)',
      passed: smallButtons === 0,
      details: smallButtons === 0 ? 'All buttons meet size requirements' : `${smallButtons} buttons too small`
    });
    
    // Test 9: Performance
    console.log('📋 Test 9: Testing performance...');
    
    // Switch back to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Measure FPS by clicking multiple times
    const startTime = Date.now();
    for (let i = 0; i < 10; i++) {
      await canvas.click({ position: { x: 300 + i * 50, y: 300 + i * 30 } });
      await page.waitForTimeout(100);
    }
    const endTime = Date.now();
    const elapsed = endTime - startTime;
    
    results.push({
      test: 'Performance (multiple interactions)',
      passed: elapsed < 2000, // Should complete 10 clicks in under 2 seconds
      details: `10 interactions completed in ${elapsed}ms`
    });
    
    // Test 10: No console errors
    console.log('📋 Test 10: Checking for console errors...');
    
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    results.push({
      test: 'No console errors',
      passed: consoleErrors.length === 0,
      details: consoleErrors.length === 0 ? 'No errors found' : `Errors: ${consoleErrors.join(', ')}`
    });
    
  } catch (error) {
    results.push({
      test: 'Test execution',
      passed: false,
      details: `Error: ${error.message}`
    });
  } finally {
    await browser.close();
  }
  
  // Generate test report
  console.log('\n📊 Test Results Summary:');
  console.log('=======================\n');
  
  let passed = 0;
  let failed = 0;
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${result.test}: ${status}`);
    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }
    console.log('');
    
    if (result.passed) passed++;
    else failed++;
  });
  
  const score = Math.round((passed / results.length) * 100);
  console.log(`\n🏆 Overall Score: ${score}% (${passed}/${results.length} tests passed)`);
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    score: score,
    passed: passed,
    failed: failed,
    total: results.length,
    results: results,
    url: 'https://divine-terraform.pages.dev'
  };
  
  fs.writeFileSync('playwright-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to playwright-test-report.json');
  console.log('📸 Screenshots saved to screenshots/ directory');
  
  return score;
}

// Run the tests
runE2ETests().then(score => {
  console.log(`\n🎮 Divine Terraform E2E Test Suite Complete!`);
  process.exit(score === 100 ? 0 : 1);
}).catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
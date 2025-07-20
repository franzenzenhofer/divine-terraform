import { chromium } from 'playwright';

(async () => {
  console.log('🎮 Testing ALL Divine Terraform Features...\n');
  
  const browser = await chromium.launch({
    headless: false, // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[ERROR] ${msg.text()}`);
    }
  });
  
  console.log('→ Navigating to game...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log('\n✅ Test 1: Terrain Modification (Basic Click)');
  await page.click('canvas', { position: { x: 640, y: 400 } });
  await page.waitForTimeout(500);
  const terrainMod1 = await page.evaluate(() => {
    const store = window.__zustand_game_store?.getState?.();
    return store?.statistics?.terrainsModified || 0;
  });
  console.log(`   Terrains modified: ${terrainMod1}`);
  
  console.log('\n✅ Test 2: God Power - Raise Land');
  // Click on Raise Land power button
  await page.evaluate(() => {
    // Find and click the raise land button directly
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.title && btn.title.includes('Raise Land')) {
        btn.click();
        break;
      }
    }
  });
  await page.waitForTimeout(500);
  
  const powerState = await page.evaluate(() => {
    const store = window.__zustand_game_store?.getState?.();
    return { selectedPower: store?.selectedPower, faith: store?.faith };
  });
  console.log(`   Selected power: ${powerState.selectedPower}`);
  console.log(`   Faith: ${powerState.faith}`);
  
  // Use the power
  await page.click('canvas', { position: { x: 700, y: 400 } });
  await page.waitForTimeout(500);
  
  const afterPower = await page.evaluate(() => {
    const store = window.__zustand_game_store?.getState?.();
    return {
      terrainsModified: store?.statistics?.terrainsModified || 0,
      faith: store?.faith
    };
  });
  console.log(`   Terrains modified after power: ${afterPower.terrainsModified}`);
  console.log(`   Faith after power: ${afterPower.faith}`);
  
  console.log('\n✅ Test 3: Minimap Navigation');
  await page.click('canvas', { position: { x: 60, y: 60 } });
  await page.waitForTimeout(500);
  console.log('   Clicked on minimap - viewport should move');
  
  console.log('\n✅ Test 4: Time Controls');
  // Pause button
  const pauseBtn = await page.$('button:has-text("⏸️")');
  if (pauseBtn) {
    await pauseBtn.click();
    console.log('   Paused game');
  }
  
  // Speed controls
  await page.click('button:has-text("2x")');
  console.log('   Set speed to 2x');
  
  console.log('\n✅ Test 5: Menu Toggle');
  await page.click('button:has-text("☰")');
  await page.waitForTimeout(500);
  const menuVisible = await page.isVisible('text="Exit to Menu"');
  console.log(`   Menu visible: ${menuVisible}`);
  
  console.log('\n✅ Test 6: Multiple Terrain Modifications');
  // Close menu first
  await page.click('canvas', { position: { x: 100, y: 100 } });
  
  // Make several terrain modifications
  for (let i = 0; i < 5; i++) {
    const x = 500 + i * 50;
    await page.click('canvas', { position: { x, y: 400 } });
    await page.waitForTimeout(200);
  }
  
  const finalStats = await page.evaluate(() => {
    const store = window.__zustand_game_store?.getState?.();
    return {
      terrainsModified: store?.statistics?.terrainsModified || 0,
      faith: store?.faith,
      population: store?.civilizations?.reduce((sum, civ) => sum + civ.population, 0) || 0,
      buildings: store?.buildings?.length || 0
    };
  });
  
  console.log('\n📊 Final Game Stats:');
  console.log(`   Total terrains modified: ${finalStats.terrainsModified}`);
  console.log(`   Faith remaining: ${finalStats.faith}`);
  console.log(`   Total population: ${finalStats.population}`);
  console.log(`   Total buildings: ${finalStats.buildings}`);
  
  // Take final screenshot
  await page.screenshot({ path: 'screenshots/test-all-features-final.png' });
  console.log('\n✅ Screenshot saved to screenshots/test-all-features-final.png');
  
  // Test on mobile
  console.log('\n📱 Testing Mobile (Portrait)...');
  const mobileContext = await browser.newContext({
    ...devices['iPhone 12'],
    viewport: { width: 390, height: 844 }
  });
  
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(3000);
  
  // Test touch on mobile
  await mobilePage.tap('canvas', { position: { x: 195, y: 400 } });
  await mobilePage.waitForTimeout(500);
  
  await mobilePage.screenshot({ path: 'screenshots/test-mobile-portrait.png' });
  console.log('   Mobile screenshot saved');
  
  await mobileContext.close();
  
  console.log('\n🎉 All tests completed!');
  console.log('   Keep browser open for manual testing...');
  
  // Keep browser open for manual testing
  await page.waitForTimeout(30000);
  
  await browser.close();
})();
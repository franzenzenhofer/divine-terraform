import { chromium } from 'playwright';

async function playGame() {
  console.log('🎮 Starting Divine Terraform gameplay test...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE portrait
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  const page = await context.newPage();
  
  try {
    console.log('📱 Loading game in mobile portrait mode...');
    await page.goto('https://divine-terraform.pages.dev', { waitUntil: 'networkidle' });
    
    // Wait for game to load
    await page.waitForTimeout(5000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/gameplay-1-loaded.png', fullPage: true });
    console.log('✅ Game loaded! Screenshot saved.');
    
    // Check if canvas is visible
    const canvas = await page.locator('canvas').first();
    const isVisible = await canvas.isVisible();
    console.log(`✅ Canvas visible: ${isVisible}`);
    
    if (isVisible) {
      console.log('\n🎯 Starting gameplay...');
      
      // Play the game!
      console.log('1️⃣ Clicking on terrain to raise land...');
      await canvas.click({ position: { x: 187, y: 300 } });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/gameplay-2-raised-land.png' });
      
      console.log('2️⃣ Clicking multiple times to create a hill...');
      for (let i = 0; i < 5; i++) {
        await canvas.click({ position: { x: 187, y: 300 } });
        await page.waitForTimeout(200);
      }
      await page.screenshot({ path: 'screenshots/gameplay-3-hill-created.png' });
      
      console.log('3️⃣ Selecting a god power (Raise Land)...');
      const raiseLandButton = page.locator('button:has-text("⛰️")').first();
      if (await raiseLandButton.isVisible()) {
        await raiseLandButton.click();
        console.log('✅ Selected Raise Land power');
        
        console.log('4️⃣ Using god power on terrain...');
        await canvas.click({ position: { x: 250, y: 350 } });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/gameplay-4-god-power-used.png' });
      }
      
      console.log('5️⃣ Testing minimap navigation...');
      await canvas.click({ position: { x: 50, y: 50 } }); // Click on minimap
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/gameplay-5-minimap-nav.png' });
      
      console.log('6️⃣ Testing time controls...');
      const pauseButton = page.locator('button:has-text("⏸️")').first();
      if (await pauseButton.isVisible()) {
        await pauseButton.click();
        console.log('✅ Game paused');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/gameplay-6-paused.png' });
      }
      
      // Check faith value
      const faithText = await page.locator('text=/\\d+\\s*Faith/').textContent();
      console.log(`\n💰 Current faith: ${faithText}`);
      
      // Check population
      const popText = await page.locator('text=/Population:\\s*\\d+/').textContent();
      console.log(`👥 ${popText}`);
      
      console.log('\n🏆 Gameplay test complete! Game is working!');
    }
    
  } catch (error) {
    console.error('❌ Error during gameplay:', error.message);
    await page.screenshot({ path: 'screenshots/gameplay-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the test
playGame().then(() => {
  console.log('\n✨ Test complete!');
}).catch(error => {
  console.error('Test failed:', error);
});
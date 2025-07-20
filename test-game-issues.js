import { chromium } from 'playwright';

(async () => {
  console.log('🔍 Testing Divine Terraform for issues...\n');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  // Capture console messages
  const logs = [];
  const errors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    logs.push({ type, text });
    if (type === 'error') {
      errors.push(text);
    }
    console.log(`[${type.toUpperCase()}] ${text}`);
  });
  
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
    errors.push(`Page error: ${error.message}`);
  });
  
  console.log('→ Navigating to game...');
  await page.goto('http://localhost:3000', {
    waitUntil: 'networkidle'
  });
  
  // Wait for game to initialize
  await page.waitForTimeout(5000);
  
  console.log('\n→ Checking game state...');
  
  // Check if terrain is initialized
  const gameState = await page.evaluate(() => {
    // @ts-ignore
    const store = window.__zustand_game_store?.getState?.();
    if (!store) return { error: 'Store not found' };
    
    return {
      terrain: {
        exists: !!store.terrain,
        length: store.terrain?.length || 0,
        firstRow: store.terrain?.[0]?.length || 0
      },
      phase: store.phase,
      mapSize: store.mapSize,
      selectedPower: store.selectedPower,
      faith: store.faith,
      civilizations: store.civilizations?.length || 0,
      buildings: store.buildings?.length || 0,
      units: store.units?.length || 0
    };
  });
  
  console.log('Game State:', JSON.stringify(gameState, null, 2));
  
  // Check if canvas is rendered
  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'Canvas not found' };
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx?.getImageData(0, 0, 10, 10);
    const hasContent = imageData?.data.some(pixel => pixel !== 0) || false;
    
    return {
      exists: true,
      width: canvas.width,
      height: canvas.height,
      hasContent,
      style: {
        width: canvas.style.width,
        height: canvas.style.height,
        position: canvas.style.position,
        zIndex: canvas.style.zIndex
      }
    };
  });
  
  console.log('\nCanvas Info:', JSON.stringify(canvasInfo, null, 2));
  
  // Try to interact with terrain
  console.log('\n→ Testing terrain interaction...');
  
  // Click in the center of the canvas
  await page.click('canvas', { position: { x: 640, y: 400 } });
  await page.waitForTimeout(1000);
  
  // Check if terrain was modified
  const terrainAfterClick = await page.evaluate(() => {
    // @ts-ignore
    const store = window.__zustand_game_store?.getState?.();
    return {
      terrainsModified: store?.statistics?.terrainsModified || 0
    };
  });
  
  console.log('Terrains modified:', terrainAfterClick.terrainsModified);
  
  // Test with a selected power
  console.log('\n→ Testing with selected power...');
  
  // Click on raise land power
  await page.click('button[title*="Raise Land"]');
  await page.waitForTimeout(500);
  
  const powerState = await page.evaluate(() => {
    // @ts-ignore
    const store = window.__zustand_game_store?.getState?.();
    return {
      selectedPower: store?.selectedPower,
      faith: store?.faith
    };
  });
  
  console.log('Power state:', powerState);
  
  // Try clicking on terrain again
  await page.click('canvas', { position: { x: 640, y: 400 } });
  await page.waitForTimeout(1000);
  
  const finalState = await page.evaluate(() => {
    // @ts-ignore
    const store = window.__zustand_game_store?.getState?.();
    return {
      terrainsModified: store?.statistics?.terrainsModified || 0,
      faith: store?.faith
    };
  });
  
  console.log('Final state:', finalState);
  
  // Take screenshot
  await page.screenshot({ path: 'screenshots/debug-game-state.png' });
  
  console.log('\n📊 Summary:');
  console.log(`- Errors found: ${errors.length}`);
  if (errors.length > 0) {
    console.log('- Error details:');
    errors.forEach(err => console.log(`  • ${err}`));
  }
  
  await browser.close();
})();
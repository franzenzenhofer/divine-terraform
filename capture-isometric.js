import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set a good viewport size
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  console.log('Navigating to Divine Terraform...');
  await page.goto('https://divine-terraform.pages.dev', {
    waitUntil: 'networkidle'
  });
  
  // Wait for the game to fully load
  console.log('Waiting for game to initialize...');
  await page.waitForTimeout(5000);
  
  // Try to detect if loading screen is still visible and wait for it to disappear
  const loadingScreen = await page.$('#loading');
  if (loadingScreen) {
    console.log('Waiting for loading screen to disappear...');
    await page.waitForSelector('#loading', { state: 'hidden', timeout: 30000 });
  }
  
  // Additional wait to ensure 3D scene is rendered
  await page.waitForTimeout(3000);
  
  console.log('Taking screenshot of isometric view...');
  await page.screenshot({ 
    path: 'screenshots/divine-terraform-isometric.png',
    fullPage: false
  });
  
  // Also take a screenshot focused on the game area
  const gameCanvas = await page.$('canvas');
  if (gameCanvas) {
    console.log('Found game canvas, taking focused screenshot...');
    await gameCanvas.screenshot({ path: 'screenshots/divine-terraform-canvas.png' });
  }
  
  // Get page title and some info
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check if the game has any console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
    }
  });
  
  await browser.close();
  console.log('Screenshots saved to screenshots/ directory');
})();
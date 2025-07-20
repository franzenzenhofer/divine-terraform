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
    waitUntil: 'domcontentloaded'  // Don't wait for full load
  });
  
  // Wait a bit to see loading screen
  console.log('Waiting to capture loading screen...');
  await page.waitForTimeout(500);
  
  console.log('Taking screenshot of loading screen with version...');
  await page.screenshot({ 
    path: 'screenshots/loading-screen-with-version.png',
    fullPage: false
  });
  
  await browser.close();
  console.log('Loading screen screenshot saved!');
})();
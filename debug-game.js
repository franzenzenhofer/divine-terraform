import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false, // Show browser for debugging
    devtools: true   // Open devtools
  });
  
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    console.log(`Console ${msg.type()}: ${msg.text()}`);
  });
  
  // Listen for errors
  page.on('pageerror', error => {
    console.error('Page error:', error.message);
  });
  
  await page.goto('http://localhost:4173');
  console.log('Page loaded, check browser window...');
  
  // Wait for manual inspection
  await page.waitForTimeout(60000);
  
  await browser.close();
})();
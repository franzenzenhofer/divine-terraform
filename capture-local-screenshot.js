import puppeteer from 'puppeteer';

async function captureLocalScreenshots() {
  const browser = await puppeteer.launch({
    headless: false, // Show browser to see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Go to local development server
    console.log('Loading local Divine Terraform...');
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for game to load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Take screenshot of initial view
    console.log('Taking screenshot of current view...');
    await page.screenshot({ 
      path: 'screenshots/current-isometric-view.png',
      fullPage: false 
    });
    
    // Try to find the view toggle button
    console.log('Looking for view controls...');
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons`);
    
    // Get all button texts to debug
    const buttonTexts = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      return Array.from(buttons).map(b => b.textContent);
    });
    console.log('Button texts:', buttonTexts);
    
    // Take a full page screenshot to see UI
    await page.screenshot({ 
      path: 'screenshots/full-page-view.png',
      fullPage: true 
    });
    
    console.log('Screenshots captured successfully!');
    console.log('Check screenshots/ directory for:');
    console.log('- current-isometric-view.png');
    console.log('- full-page-view.png');
    
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    // Keep browser open for 5 seconds to observe
    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
  }
}

captureLocalScreenshots();
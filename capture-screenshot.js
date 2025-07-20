import puppeteer from 'puppeteer';

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Go to the live game
    console.log('Loading Divine Terraform...');
    await page.goto('https://divine-terraform.pages.dev', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for game to load
    await page.waitForSelector('#root', { timeout: 10000 });
    console.log('Game loaded, waiting for loading screen to disappear...');
    
    // Wait for loading screen to disappear
    try {
      await page.waitForSelector('.loading-screen', { hidden: true, timeout: 15000 });
    } catch (e) {
      console.log('Loading screen timeout, continuing...');
    }
    
    // Take screenshot of 3D view
    console.log('Taking 3D view screenshot...');
    await page.screenshot({ 
      path: '3d-view.png',
      fullPage: false 
    });
    
    // Click the isometric view toggle button
    console.log('Switching to isometric view...');
    try {
      await page.click('button:has-text("Isometric View")', { timeout: 5000 });
    } catch (e) {
      // Try alternative selector
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
          if (button.textContent.includes('Isometric')) {
            button.click();
            break;
          }
        }
      });
    }
    
    // Wait for view to switch
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot of isometric view
    console.log('Taking isometric view screenshot...');
    await page.screenshot({ 
      path: 'isometric-view.png',
      fullPage: false 
    });
    
    console.log('Screenshots captured successfully!');
    
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
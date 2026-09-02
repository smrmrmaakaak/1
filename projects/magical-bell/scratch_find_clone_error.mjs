import { chromium } from 'playwright';

async function findCloneError() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR MESSAGE:', err.message);
    console.log('PAGE ERROR STACK:', err.stack);
  });

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('#btn-hero-start', { timeout: 30000 });
    await page.click('#btn-hero-start');
    await page.waitForTimeout(1000);

    // Press Q, X, C, T
    await page.keyboard.press('KeyQ');
    await page.waitForTimeout(500);
    await page.keyboard.press('KeyX');
    await page.waitForTimeout(500);
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(500);
    await page.keyboard.press('KeyT');
    await page.waitForTimeout(1000);
  } finally {
    await browser.close();
  }
}

findCloneError();

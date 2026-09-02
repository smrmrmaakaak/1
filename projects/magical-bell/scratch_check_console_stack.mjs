import { chromium } from 'playwright';

async function checkStackTrace() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('ERROR TEXT:', msg.text());
      console.log('LOCATION:', msg.location());
    }
  });
  page.on('pageerror', err => {
    console.log('PAGE ERROR STACK:', err.stack);
  });

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForTimeout(2000);
    await page.click('#btn-hero-start');
    await page.waitForTimeout(3000);
  } finally {
    await browser.close();
  }
}

checkStackTrace();

import { chromium } from 'playwright';

async function checkConsole() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForTimeout(4000);
  } finally {
    await browser.close();
  }
}

checkConsole();

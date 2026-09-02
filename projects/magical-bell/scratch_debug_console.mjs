import { chromium } from 'playwright';

async function checkConsoleErrors() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'debug_loading_screen.png' });
  } finally {
    await browser.close();
  }
}

checkConsoleErrors();

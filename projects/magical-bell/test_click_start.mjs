import { chromium } from 'playwright';

async function testClickStart() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(2000);

  console.log('Clicking Ace card...');
  await page.click('.showcase-hero-card[data-hero-id="ace"]');
  await page.waitForTimeout(600);

  console.log('Clicking Start Button...');
  await page.click('#btn-hero-start');
  await page.waitForTimeout(2000);

  const display = await page.evaluate(() => document.querySelector('.hero-showcase-overlay')?.style.display);
  console.log('OVERLAY DISPLAY:', display);

  await page.screenshot({ path: 'in_game_verified.png' });
  await browser.close();
}

testClickStart();

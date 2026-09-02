import { chromium } from 'playwright';

async function testLighting() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(2500);

  await page.screenshot({ path: 'verify_character_creation_lighting.png' });
  console.log('Saved verify_character_creation_lighting.png');

  // Click start and take in-game screenshot
  await page.click('#btn-hero-start');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'verify_ingame_lighting.png' });
  console.log('Saved verify_ingame_lighting.png');

  await browser.close();
}

testLighting();

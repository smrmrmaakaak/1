import { chromium } from 'playwright';

async function testDebugGameplay() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log(`[PAGE] ${msg.text()}`));
  page.on('pageerror', err => console.log(`[PAGE ERR] ${err.message}`));

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('#btn-hero-start', { timeout: 30000 });
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    // Cast T
    await page.keyboard.press('KeyT');
    await page.waitForTimeout(300);
    await page.mouse.click(720, 300);

    for (let i = 1; i <= 6; i++) {
      await page.waitForTimeout(300);
      await page.screenshot({ path: `seq_frame_${i}.png` });
    }
  } finally {
    await browser.close();
  }
}

testDebugGameplay();

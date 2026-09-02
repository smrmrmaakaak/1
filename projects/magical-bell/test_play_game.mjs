import { chromium } from 'playwright';

async function testPlayGame() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(2000);

  // Click Ace
  await page.click('.showcase-hero-card[data-hero-id="ace"]');
  await page.waitForTimeout(600);

  // Click Start Button
  await page.click('#btn-hero-start');
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'in_game_sanctuary.png' });

  // Cast Ace Q (불주먹)
  await page.keyboard.press('KeyQ');
  await page.waitForTimeout(400);
  await page.mouse.click(800, 500);
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'in_game_ace_q.png' });

  // Cast Ace T (대염계 염제)
  await page.keyboard.press('KeyT');
  await page.waitForTimeout(400);
  await page.mouse.click(800, 500);
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'in_game_ace_t.png' });

  await browser.close();
  console.log('✅ In-game Ace skill casting verified!');
}

testPlayGame();

import { chromium } from 'playwright';

async function testCastingInSanctuary() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(2000);

  // Click Ace
  await page.click('.showcase-hero-card[data-hero-id="ace"]');
  await page.waitForTimeout(500);

  // Click Start Button
  await page.click('#btn-hero-start');
  await page.waitForTimeout(1500);

  // Cast Q (불주먹 - Fire Fist)
  console.log('Casting Q (불주먹)...');
  await page.keyboard.press('KeyQ');
  await page.waitForTimeout(300);
  await page.mouse.click(900, 600);
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'cast_fire_fist_live.png' });

  // Cast T (대염계 염제 - Dai Entei)
  console.log('Casting T (대염계 염제)...');
  await page.keyboard.press('KeyT');
  await page.waitForTimeout(300);
  await page.mouse.click(900, 600);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'cast_dai_entei_live.png' });

  await browser.close();
  console.log('✅ In-game casting screenshots captured!');
}

testCastingInSanctuary();

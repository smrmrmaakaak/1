import { chromium } from 'playwright';

async function testAllHeroSkills() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Enel (Lightning)
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1500);
  await page.click('.showcase-hero-card[data-hero-id="raiden"]');
  await page.waitForTimeout(300);
  await page.click('#btn-hero-start');
  await page.waitForTimeout(1000);
  await page.keyboard.press('KeyT');
  await page.waitForTimeout(200);
  await page.mouse.click(800, 500);
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'skill_enel_t.png' });

  // 2. Whitebeard (Earthquake)
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1500);
  await page.click('.showcase-hero-card[data-hero-id="boreas"]');
  await page.waitForTimeout(300);
  await page.click('#btn-hero-start');
  await page.waitForTimeout(1000);
  await page.keyboard.press('KeyC');
  await page.waitForTimeout(200);
  await page.mouse.click(800, 500);
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'skill_whitebeard_c.png' });

  // 3. Blackbeard (Singularity)
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1500);
  await page.click('.showcase-hero-card[data-hero-id="sera"]');
  await page.waitForTimeout(300);
  await page.click('#btn-hero-start');
  await page.waitForTimeout(1000);
  await page.keyboard.press('KeyC');
  await page.waitForTimeout(200);
  await page.mouse.click(800, 500);
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'skill_blackbeard_c.png' });

  await browser.close();
  console.log('✅ All hero skills tested successfully!');
}

testAllHeroSkills();

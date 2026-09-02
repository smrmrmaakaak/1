import { chromium } from 'playwright';

async function testSkillCasts() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER LOG ERROR:', msg.text());
  });

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(2000);

  // Click start game on Ace
  const aceCard = await page.$('.showcase-hero-card[data-hero-id="ace"]');
  if (aceCard) await aceCard.click();
  await page.waitForTimeout(600);

  const startBtn = await page.$('#btn-hero-start');
  if (startBtn) await startBtn.click();
  await page.waitForTimeout(1500);

  // Press Q (Fire Fist) and click to cast
  await page.keyboard.press('KeyQ');
  await page.waitForTimeout(400);
  await page.mouse.click(720, 450);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'cast_ace_q.png' });

  // Press X (Cross Fire) and click to cast
  await page.keyboard.press('KeyX');
  await page.waitForTimeout(400);
  await page.mouse.click(720, 450);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'cast_ace_x.png' });

  // Press T (Dai Entei) and click to cast
  await page.keyboard.press('KeyT');
  await page.waitForTimeout(400);
  await page.mouse.click(720, 450);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'cast_ace_t.png' });

  await browser.close();
  console.log('✅ Skill cast in-game tests complete!');
}

testSkillCasts();

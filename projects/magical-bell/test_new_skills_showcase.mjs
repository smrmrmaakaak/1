import { chromium } from 'playwright';

async function showcase() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });
  page.on('pageerror', err => console.log('UNCAUGHT ERROR:', err.message));

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1500);

  // Click Start Game
  await page.click('#btn-hero-start');
  await page.waitForTimeout(1000);

  // 1. Showcase Ace T (대염계 염제 3X + Burning Ground)
  console.log('Testing Ace T (대염계 염제)...');
  await page.evaluate(async () => {
    await window.app.selectHero('ace');
  });
  await page.waitForTimeout(600);
  await page.keyboard.press('t');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'showcase_ace_t_entei.png' });

  // 2. Showcase Kizaru X & T (천총운검 & 팔척경곡옥)
  console.log('Testing Kizaru X & T (천총운검 & 팔척경곡옥)...');
  await page.evaluate(async () => {
    await window.app.selectHero('lumina');
  });
  await page.waitForTimeout(600);
  await page.keyboard.press('x');
  await page.waitForTimeout(300);
  await page.keyboard.press('t');
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'showcase_kizaru_skills.png' });

  // 3. Showcase Blackbeard C & T (블랙홀 & 해방)
  console.log('Testing Blackbeard C & T (블랙홀 & 해방)...');
  await page.evaluate(async () => {
    await window.app.selectHero('sera');
  });
  await page.waitForTimeout(600);
  await page.keyboard.press('c');
  await page.waitForTimeout(300);
  await page.keyboard.press('t');
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'showcase_blackbeard_skills.png' });

  // 4. Showcase Enel C & T (뇌룡 & 뇌영)
  console.log('Testing Enel C & T (뇌룡 & 뇌영)...');
  await page.evaluate(async () => {
    await window.app.selectHero('raiden');
  });
  await page.waitForTimeout(600);
  await page.keyboard.press('c');
  await page.waitForTimeout(300);
  await page.keyboard.press('t');
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'showcase_enel_skills.png' });

  console.log('All in-game screenshots captured!');
  await browser.close();
}

showcase();

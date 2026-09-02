import { chromium } from 'playwright';

async function testLoadingAllModels() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[PAGE ERROR] ${err.message}`));

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1500);

  const heroIds = ['arthur', 'raiden', 'akainu', 'ace', 'lumina', 'tesla', 'boreas', 'sera'];
  for (const id of heroIds) {
    const result = await page.evaluate(async (hid) => {
      try {
        await window.app.selectHero(hid);
        return { success: true, heroId: hid, modelName: window.app.character.model ? window.app.character.model.name : 'null' };
      } catch (e) {
        return { success: false, heroId: hid, error: e.message };
      }
    }, id);
    console.log('Select result for', id, result);
    await page.waitForTimeout(500);
  }

  await browser.close();
  console.log('=== Browser Console Logs ===');
  console.log(consoleLogs.join('\n'));
}

testLoadingAllModels();

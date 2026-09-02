import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const anims = await page.evaluate(() => {
    return Array.from(window.app.character.actions.keys());
  });

  console.log('Available Animation Keys on Character:', anims);
  await browser.close();
}

run().catch(console.error);

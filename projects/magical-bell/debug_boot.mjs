import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message, err.stack));

  console.log('--- Checking localhost:5173 ---');
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log('Localhost load error:', e.message);
  }

  console.log('--- Checking live web app ---');
  try {
    await page.goto('https://elemental-defense-rpg.web.app', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log('Live load error:', e.message);
  }

  await browser.close();
}

run().catch(console.error);

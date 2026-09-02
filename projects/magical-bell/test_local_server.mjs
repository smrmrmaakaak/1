import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Testing http://localhost:5173 ...');
  const response = await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
  console.log('Local Server HTTP Status:', response.status());
  await browser.close();
}

run().catch(console.error);

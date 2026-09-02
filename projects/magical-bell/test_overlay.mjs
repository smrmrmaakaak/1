import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Testing http://localhost:5173 ...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Check if error overlay exists
  const overlay = await page.$('vite-error-overlay');
  console.log('Vite Error Overlay Present:', !!overlay);

  const title = await page.title();
  console.log('Page Title:', title);

  await browser.close();
}

run().catch(console.error);

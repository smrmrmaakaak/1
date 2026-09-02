import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outputDir = 'C:\\Users\\황태민\\.gemini\\antigravity\\brain\\c5a7b71f-d457-4321-a6c1-a87088e9f8bc\\.tempmediaStorage';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-quic',
      '--use-gl=angle',
      '--use-angle=swiftshader'
    ]
  });

  const context1 = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const context2 = await browser.newContext({ viewport: { width: 1280, height: 720 } });

  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  page1.on('console', msg => console.log('[CLIENT 1 LOG]', msg.text()));
  page2.on('console', msg => console.log('[CLIENT 2 LOG]', msg.text()));

  console.log('=== Step 1: Connecting Player 1 (Akainu) ===');
  await page1.goto('https://elemental-defense-rpg.web.app', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page1.waitForTimeout(2000);
  await page1.click('[data-hero-id="akainu"]');
  await page1.waitForTimeout(500);
  await page1.click('#btn-hero-start');
  await page1.waitForTimeout(2000);

  console.log('=== Step 2: Connecting Player 2 (Kuzan / Arthur) ===');
  await page2.goto('https://elemental-defense-rpg.web.app', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page2.waitForTimeout(2000);
  await page2.click('[data-hero-id="arthur"]');
  await page2.waitForTimeout(500);
  await page2.click('#btn-hero-start');
  await page2.waitForTimeout(3000);

  console.log('=== Step 3: Player 1 moves and chats ===');
  // Player 1 types a chat message
  await page1.keyboard.press('Enter');
  await page1.waitForTimeout(300);
  await page1.keyboard.type('반갑다 동료여! 함께 성소를 지키자!');
  await page1.keyboard.press('Enter');
  await page1.waitForTimeout(1000);

  // Player 1 walks a bit to the right
  await page1.keyboard.down('KeyD');
  await page1.waitForTimeout(1500);
  await page1.keyboard.up('KeyD');
  await page1.waitForTimeout(1000);

  // Capture Player 2's screen seeing Player 1 and the chat!
  console.log('=== Capturing Player 2 screen seeing Player 1 ===');
  await page2.screenshot({ path: path.join(outputDir, 'multiplayer_p2_view.png') });

  // Player 1 casts Meteor Volcano (T skill)
  console.log('=== Player 1 casts Meteor Volcano ===');
  await page1.keyboard.press('KeyT');
  await page1.waitForTimeout(1200);

  // Capture Player 2 seeing Player 1's meteor volcano falling!
  await page2.screenshot({ path: path.join(outputDir, 'multiplayer_p2_sees_meteor.png') });

  await browser.close();
  console.log('=== Multiplayer Playwright Test Finished! ===');
}

run().catch(console.error);

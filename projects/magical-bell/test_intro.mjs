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

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 }
  });

  console.log('Navigating to https://elemental-defense-rpg.web.app ...');
  await page.goto('https://elemental-defense-rpg.web.app', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);

  // Capture Intro / Hero Selection Screen
  console.log('Capturing One Piece Game Beta 1 Intro Screen...');
  await page.screenshot({ path: path.join(outputDir, 'one_piece_intro_screen.png') });

  // Click Start
  await page.click('#btn-hero-start');
  await page.waitForTimeout(2000);

  // Capture Ingame Village with Online Badge & Chat
  console.log('Capturing In-Game Village with Multiplayer & Chat...');
  await page.screenshot({ path: path.join(outputDir, 'one_piece_ingame_village.png') });

  await browser.close();
  console.log('Finished Intro Verification test.');
}

run().catch(console.error);

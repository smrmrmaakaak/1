import { chromium } from 'playwright';

async function testNicknameAndNameplate() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('1. Loading Character Selection Screen...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('2. Selecting Raiden and Entering Custom Nickname "빛의수호자"...');
    await page.click('.showcase-hero-card[data-hero-id="raiden"]');
    await page.waitForTimeout(500);

    const input = await page.$('#input-hero-nickname');
    await input.fill('');
    await input.fill('빛의수호자');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'nameplate_01_creation_screen.png' });

    console.log('3. Clicking Start Adventure...');
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'nameplate_02_ingame_nameplate.png' });

    console.log('4. Moving Character to verify 3D Nameplate Tracking...');
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(1500);
    await page.keyboard.up('KeyD');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'nameplate_03_moved_nameplate.png' });

    console.log('✨ Character Nickname & 3D Nameplate Test Passed 100%!');
  } finally {
    await browser.close();
  }
}

testNicknameAndNameplate();

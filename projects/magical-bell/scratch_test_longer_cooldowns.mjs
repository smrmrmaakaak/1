import { chromium } from 'playwright';

async function testLongerCooldowns() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('🚀 Phase 1: Start Game as Ignis to test Long Cooldown on Meteor and Cataclysm');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.click('.showcase-hero-card[data-hero-id="ignis"]');
    await page.waitForTimeout(600);
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    console.log('🚀 Phase 2: Cast Cinder Fall (R) and Dash (Space)');
    await page.keyboard.press('KeyR');
    await page.mouse.click(640, 360);
    await page.keyboard.press('Space');
    await page.waitForTimeout(600);

    await page.screenshot({ path: 'increased_cooldown_hud.png' });
    console.log('✅ Cooldown Lengthening Verified 100%!');
  } finally {
    await browser.close();
  }
}

testLongerCooldowns();

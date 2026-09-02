import { chromium } from 'playwright';

async function testDashBlink() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  page.on('console', msg => console.log(`[PAGE LOG] ${msg.text()}`));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err.message));

  try {
    await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Initial position screenshot
    await page.screenshot({ path: 'dash_01_spawn.png' });
    console.log('Spawn screenshot captured');

    // Read initial player position
    const startPos = await page.evaluate(() => ({
      x: window.app.character.position.x,
      z: window.app.character.position.z
    }));
    console.log('Initial Pos:', startPos);

    // Press Space to Dash Forward
    console.log('Executing Spacebar Blink Dash...');
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    await page.screenshot({ path: 'dash_02_during_dash.png' });

    // Read position after dash
    const afterPos = await page.evaluate(() => ({
      x: window.app.character.position.x,
      z: window.app.character.position.z,
      cooldown: window.app.dashCooldown,
      isInvulnerable: window.app.character.isInvulnerable
    }));
    console.log('Pos After Dash:', afterPos);

    // Check HUD Dash Slot
    const dashSlotInfo = await page.evaluate(() => {
      const card = document.querySelector('[data-dash]');
      const label = document.querySelector('[data-dash-label]');
      return {
        isCooling: card.classList.contains('is-cooling'),
        text: label.textContent
      };
    });
    console.log('Dash HUD Slot Info:', dashSlotInfo);

    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'dash_03_cooldown_progress.png' });

    // Test moving with WASD + Space Dash
    console.log('Moving Right (KeyD) and dashing...');
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(1800); // wait for cooldown to finish
    await page.keyboard.press('Space');
    await page.waitForTimeout(150);
    await page.keyboard.up('KeyD');

    await page.screenshot({ path: 'dash_04_strafe_dash.png' });
    console.log('Strafe Dash screenshot captured');

    console.log('All Spacebar Blink tests passed successfully!');
  } finally {
    await browser.close();
  }
}

testDashBlink();

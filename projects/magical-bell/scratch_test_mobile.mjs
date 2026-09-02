import { chromium, devices } from 'playwright';

async function testMobileControls() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  // Mobile Landscape Context (iPhone 13 Pro Landscape: 844 x 390)
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true
  });

  const page = await context.newPage();

  page.on('console', msg => console.log(`[MOBILE LOG] ${msg.text()}`));
  page.on('pageerror', err => console.error('[MOBILE ERROR]', err.message));

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Initial Mobile View screenshot
    await page.screenshot({ path: 'mobile_01_spawn_landscape.png' });
    console.log('Mobile Landscape spawn screenshot captured');

    // 1. Test Virtual Joystick Drag (Touch Down & Move on left zone)
    console.log('Testing Touch Virtual Joystick (Drag Up-Right)...');
    const startX = 140;
    const startY = 260;

    await page.touchscreen.tap(startX, startY);
    // Simulate touch drag
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 35, startY - 35, { steps: 10 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'mobile_02_joystick_dragging.png' });

    await page.mouse.up();
    await page.waitForTimeout(300);

    // Read player position after joystick move
    const posAfterMove = await page.evaluate(() => ({
      x: window.app.character.position.x,
      z: window.app.character.position.z
    }));
    console.log('Player Pos After Joystick Move:', posAfterMove);

    // 2. Test Mobile Skill Select (Select Blizzard - C)
    console.log('Tapping Mobile Blizzard Skill button...');
    const blizzardBtn = await page.$('.mobile-skill-btn[data-element="blizzard"]');
    if (blizzardBtn) {
      await blizzardBtn.tap();
      await page.waitForTimeout(300);
    }

    await page.screenshot({ path: 'mobile_03_skill_armed.png' });

    // 3. Test Mobile CAST button
    console.log('Tapping Mobile CAST button...');
    const castBtn = await page.$('#m-btn-cast');
    if (castBtn) {
      await castBtn.tap();
      await page.waitForTimeout(1200);
    }

    await page.screenshot({ path: 'mobile_04_blizzard_casting.png' });

    // 4. Test Mobile Blink Dash Button
    console.log('Tapping Mobile BLINK Dash button...');
    const dashBtn = await page.$('#m-btn-dash');
    if (dashBtn) {
      await dashBtn.tap();
      await page.waitForTimeout(200);
    }

    await page.screenshot({ path: 'mobile_05_blink_dash.png' });

    console.log('Mobile tests completed successfully!');
  } finally {
    await browser.close();
  }
}

testMobileControls();

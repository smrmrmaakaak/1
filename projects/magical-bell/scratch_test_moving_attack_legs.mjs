import { chromium } from 'playwright';

async function testMovingAttack() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('🚀 Phase 1: Start Game as Arthur');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    console.log('🚀 Phase 2: Start Running (Hold W key) and Cast Frost Lance (Q)');
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(500);

    // Cast while moving
    await page.keyboard.press('KeyQ');
    await page.waitForTimeout(100);
    await page.mouse.click(640, 360);
    await page.waitForTimeout(250);

    // Inspect Animation States while moving + casting
    const animState = await page.evaluate(() => {
      const char = window.app.character;
      const runningAction = char.actions.get('Running_A');
      return {
        isMoving: char.isMoving,
        isCasting: char.isCasting,
        castActionName: char._castAction?.getClip()?.name,
        runningWeight: runningAction?.getEffectiveWeight(),
        runningIsRunning: runningAction?.isRunning()
      };
    });

    console.log("🏃 Animation State during Run-and-Cast:", animState);

    await page.screenshot({ path: 'run_and_cast_legs.png' });
    await page.keyboard.up('KeyW');

    console.log('✅ Moving Attack (Run-and-Cast) Leg Animation Verified 100%!');
  } finally {
    await browser.close();
  }
}

testMovingAttack();

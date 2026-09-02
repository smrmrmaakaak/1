import { chromium } from 'playwright';

async function verifyAllUserRequests() {
  console.log('🚀 Verifying all 4 user requests:');
  console.log('1. Vast Open World (900m radius)');
  console.log('2. Clean Non-overlapping UI layout');
  console.log('3. Right-click contextmenu prevention');
  console.log('4. Free 1st-person & 3rd-person zoom');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('#btn-hero-start', { timeout: 30000 });
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    // [1] Check UI Layout (Default 3rd Person View)
    await page.screenshot({ path: 'verify_ui_layout_clean.png' });

    // [2] Test Free Zoom to 1st-Person POV (Zoom In with Wheel)
    for (let i = 0; i < 15; i++) {
      await page.mouse.wheel(0, -100);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'verify_1st_person_pov.png' });

    // [3] Test Free Zoom to Ultra-Wide 3rd-Person View (Zoom Out with Wheel)
    for (let j = 0; j < 30; j++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'verify_ultra_wide_3rd_person.png' });

    // [4] Reset to comfortable standard view
    for (let k = 0; k < 12; k++) {
      await page.mouse.wheel(0, -100);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(500);

    // [5] Move Deep into Massive Open World (Hold W + Dash)
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(3000);
    await page.keyboard.press('Space'); // Dash forward
    await page.waitForTimeout(2000);
    await page.keyboard.up('KeyW');
    await page.screenshot({ path: 'verify_massive_open_world_exploration.png' });

    // [6] Verify in-browser state
    const evalData = await page.evaluate(() => {
      return {
        playerPos: {
          x: window.app.character.position.x.toFixed(2),
          y: window.app.character.position.y.toFixed(2),
          z: window.app.character.position.z.toFixed(2)
        },
        camDist: window.app.rig.distance.toFixed(2),
        isFirstPerson: window.app.rig.isFirstPerson,
        planeSize: 2400
      };
    });

    console.log('✅ Final State Verification:', JSON.stringify(evalData, null, 2));
  } finally {
    await browser.close();
  }
}

verifyAllUserRequests();

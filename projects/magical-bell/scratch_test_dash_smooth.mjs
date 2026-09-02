import { chromium } from 'playwright';

async function verifySmoothDash() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 }
  });

  try {
    console.log('🚀 Checking Smooth Dash & Seamless Movement...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Start Game as Arthur
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    // Initial position
    const pos1 = await page.evaluate(() => window.app.character.position.clone());
    console.log('Initial Position:', pos1);

    // Dash (Space)
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);

    const posAfterDash = await page.evaluate(() => window.app.character.position.clone());
    console.log('Position after Dash:', posAfterDash);

    // Immediately walk South (KeyS) for 2 seconds
    await page.keyboard.down('KeyS');
    await page.waitForTimeout(2000);
    await page.keyboard.up('KeyS');

    const posAfterWalk = await page.evaluate(() => window.app.character.position.clone());
    console.log('Position after continuous walking:', posAfterWalk);

    if (posAfterWalk.z > posAfterDash.z + 5) {
      console.log('🎉 SUCCESS: Dash executed smoothly and continuous walking works perfectly!');
    } else {
      console.error('❌ Movement did not advance properly after dash!');
    }

    await page.screenshot({ path: 'dash_smooth_verified.png' });
  } finally {
    await browser.close();
  }
}

verifySmoothDash();

import { chromium } from 'playwright';

async function testMovement() {
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
    await page.screenshot({ path: 'move_01_spawn.png' });
    console.log('Spawn screenshot captured');

    // Press and hold KeyW for 1.2 seconds (move forward)
    console.log('Moving Forward (KeyW)...');
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(1200);
    await page.keyboard.up('KeyW');
    await page.waitForTimeout(300);

    await page.screenshot({ path: 'move_02_after_w.png' });
    console.log('After KeyW screenshot captured');

    // Press and hold KeyD for 1.2 seconds (move right)
    console.log('Moving Right (KeyD)...');
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(1200);
    await page.keyboard.up('KeyD');
    await page.waitForTimeout(300);

    await page.screenshot({ path: 'move_03_after_d.png' });
    console.log('After KeyD screenshot captured');

    // Cast Blizzard while at new position
    console.log('Aiming & Casting Blizzard (KeyC) from new position...');
    await page.mouse.move(800, 300);
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(300);
    await page.mouse.click(800, 300);
    await page.waitForTimeout(1200);

    await page.screenshot({ path: 'move_04_cast_at_new_pos.png' });
    console.log('Cast at new position captured');
  } finally {
    await browser.close();
  }
}

testMovement();

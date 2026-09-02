import { chromium } from 'playwright';

async function testWalkAnimation() {
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

    // Press and hold KeyW, capture stride frames
    console.log('Starting Walk (holding KeyW)...');
    await page.keyboard.down('KeyW');

    await page.waitForTimeout(300);
    await page.screenshot({ path: 'walk_frame_1.png' });

    await page.waitForTimeout(250);
    await page.screenshot({ path: 'walk_frame_2.png' });

    await page.waitForTimeout(250);
    await page.screenshot({ path: 'walk_frame_3.png' });

    await page.keyboard.up('KeyW');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'walk_frame_stopped.png' });

    console.log('Walk animation frames captured successfully!');
  } finally {
    await browser.close();
  }
}

testWalkAnimation();

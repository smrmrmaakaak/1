import { chromium } from 'playwright';

async function captureAnimation() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Aim and cast Blizzard (C)
    await page.mouse.move(750, 250);
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(200);
    await page.mouse.click(750, 250);

    // Capture t = 1.0s (mid storm)
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'blizzard_anim_1s.png' });

    // Capture t = 2.5s (full fury)
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'blizzard_anim_2_5s.png' });

    // Capture t = 4.0s (swirling vortex)
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'blizzard_anim_4s.png' });

    console.log('All animation frames captured successfully!');
  } finally {
    await browser.close();
  }
}

captureAnimation();

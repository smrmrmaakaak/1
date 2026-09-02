import { chromium } from 'playwright';

async function testIntro() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForTimeout(100);
    await page.screenshot({ path: 'intro_01_loading.png' });
    console.log('Intro loading screenshot captured');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'intro_02_gameplay.png' });
    console.log('Gameplay screenshot captured');
  } finally {
    await browser.close();
  }
}

testIntro();

import { chromium } from 'playwright';

async function testFantasySorcerer() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err));

  try {
    console.log('🚀 Phase 1: Navigating to page');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);

    const modelInfo = await page.evaluate(() => {
      const char = window.app?.character;
      return {
        hasModel: !!char?.model,
        pos: char?.root?.position,
        tiltPos: char?.tilt?.position,
        modelPos: char?.model?.position,
        modelScale: char?.model?.scale,
        childrenCount: char?.tilt?.children?.length,
        actions: Array.from(char?.actions?.keys() || [])
      };
    });
    console.log('MODEL DEBUG INFO:', JSON.stringify(modelInfo, null, 2));

  } finally {
    await browser.close();
  }
}

testFantasySorcerer();

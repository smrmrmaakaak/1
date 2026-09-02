import { chromium } from 'playwright';

async function checkStartup() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 844, height: 390 } });

  page.on('console', msg => console.log(`[STARTUP LOG] ${msg.text()}`));

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    const info = await page.evaluate(() => {
      const modal = document.getElementById('hero-select-modal');
      const loading = document.getElementById('loading');
      return {
        modalExists: !!modal,
        modalDisplay: modal ? window.getComputedStyle(modal).display : null,
        modalZIndex: modal ? window.getComputedStyle(modal).zIndex : null,
        modalVisibility: modal ? window.getComputedStyle(modal).visibility : null,
        loadingDisplay: loading ? window.getComputedStyle(loading).display : null,
        loadingOpacity: loading ? window.getComputedStyle(loading).opacity : null,
        appState: window.app?.game?.state
      };
    });
    console.log('Startup Info:', info);

    await page.screenshot({ path: 'startup_debug_view.png' });
  } finally {
    await browser.close();
  }
}

checkStartup();

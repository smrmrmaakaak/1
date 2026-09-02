import { chromium } from 'playwright';

async function testAppLoad() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`[${msg.type()}]`, msg.text()));
  page.on('pageerror', err => console.log('[PAGE ERROR]', err));

  try {
    console.log('Testing App.load() in browser...');
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForTimeout(6000);

    const state = await page.evaluate(() => {
      return {
        appExists: !!window.app,
        isLoadingHidden: document.querySelector('.loading-screen')?.classList.contains('is-hidden') || document.querySelector('.loading-screen')?.style.display === 'none',
        loadingText: document.querySelector('.loading-text')?.textContent,
        loadingProgress: document.querySelector('.loading-progress-fill')?.style.width,
        characterModel: !!window.app?.character?.model,
        characterHeroId: window.app?.character?.currentHeroId,
        cachedModels: Array.from(window.app?.character?._cachedGLTFs?.keys() || [])
      };
    });

    console.log('App State after 6s:', JSON.stringify(state, null, 2));
    await page.screenshot({ path: 'test_load_state.png' });
  } finally {
    await browser.close();
  }
}

testAppLoad();

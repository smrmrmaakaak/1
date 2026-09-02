import { chromium } from 'playwright';

async function testInspect() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1500);

  const data = await page.evaluate(() => {
    const list = [];
    for (const [k, pool] of window.app.abilities.pools.entries()) {
      const item = pool.acquire();
      pool.release(item);
      const keys = Object.keys(item);
      const emitterKeys = keys.filter(key => key.toLowerCase().includes('spark') || key.toLowerCase().includes('smoke') || key.toLowerCase().includes('ribbon') || key.toLowerCase().includes('ember') || key.toLowerCase().includes('shard'));
      const status = {};
      for (const ek of emitterKeys) {
        status[ek] = {
          type: typeof item[ek],
          isParticleSystem: item[ek]?.constructor?.name,
          hasEmit: typeof item[ek]?.emit
        };
      }
      list.push({ element: k, status });
    }
    return list;
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
}

testInspect();

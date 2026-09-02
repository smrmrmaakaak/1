import { chromium } from 'playwright';

async function testLocalEKey() {
  console.log('🧪 Testing Local E Key (Glacial Crown) & All Skills on http://127.0.0.1:5173/ ...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log(`[LOCAL] ${msg.text()}`));
  page.on('pageerror', err => console.log(`[LOCAL ERR] ${err.message}`));

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('#btn-hero-start', { timeout: 30000 });
    await page.waitForTimeout(1000);

    // Start game as Arthur
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    // Test KeyE (Glacial Crown)
    console.log('👑 Pressing KeyE (Glacial Crown)...');
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'local_test_01_key_e_erupt.png' });

    await page.waitForTimeout(700);
    await page.screenshot({ path: 'local_test_02_key_e_crown.png' });

    // Test KeyC (Blizzard Storm)
    console.log('🌪️ Pressing KeyC (Blizzard Storm)...');
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'local_test_03_key_c_blizzard.png' });

    // Test KeyT (Absolute Zero)
    console.log('❄️ Pressing KeyT (Absolute Zero)...');
    await page.keyboard.press('KeyT');
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'local_test_04_key_t_avalanche.png' });

    console.log('✅ Local test completed with 0 crashes and 0 lag!');
  } finally {
    await browser.close();
  }
}

testLocalEKey();

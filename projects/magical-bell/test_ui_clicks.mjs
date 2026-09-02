import { chromium } from 'playwright';

async function testUiCardClicks() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(2000);

  const heroIds = ['arthur', 'raiden', 'akainu', 'ace', 'lumina', 'tesla', 'boreas', 'sera'];
  for (const hid of heroIds) {
    const card = await page.$(`.showcase-hero-card[data-hero-id="${hid}"]`);
    if (card) {
      await card.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `final_ui_${hid}.png` });
    }
  }

  await browser.close();
  console.log('✅ UI card click tests complete!');
}

testUiCardClicks();

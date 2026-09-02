import { chromium } from 'playwright';

async function testComprehensiveSkills() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER CONSOLE ERROR:', msg.text());
      errors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
    errors.push(err.message);
  });

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(2000);

  // 1. Test Ace (불주먹, 십자화, 불기둥, 대염계 염제)
  console.log('--- Testing Ace ---');
  await page.click('.showcase-hero-card[data-hero-id="ace"]');
  await page.waitForTimeout(400);
  await page.click('#btn-hero-start');
  await page.waitForTimeout(1000);

  // Move mouse to set aim
  await page.mouse.move(900, 600);

  // Cast Q (불주먹)
  await page.keyboard.press('KeyQ');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'cast_verify_ace_q.png' });

  // Cast X (십자화)
  await page.keyboard.press('KeyX');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'cast_verify_ace_x.png' });

  // Cast C (불기둥)
  await page.keyboard.press('KeyC');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'cast_verify_ace_c.png' });

  // Cast T (대염계 염제)
  await page.keyboard.press('KeyT');
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'cast_verify_ace_t.png' });

  // 2. Test Whitebeard (진동 충격파, 램파트, 어스퀘이크, 기간틱 메가리스)
  console.log('--- Testing Whitebeard ---');
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1500);
  await page.click('.showcase-hero-card[data-hero-id="boreas"]');
  await page.waitForTimeout(400);
  await page.click('#btn-hero-start');
  await page.waitForTimeout(1000);

  await page.mouse.move(900, 600);
  await page.keyboard.press('KeyQ');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'cast_verify_whitebeard_q.png' });

  await page.keyboard.press('KeyC');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'cast_verify_whitebeard_c.png' });

  await page.keyboard.press('KeyT');
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'cast_verify_whitebeard_t.png' });

  // 3. Test Dragon (칼바람, 사이클론, 토네이도, 템페스트)
  console.log('--- Testing Dragon ---');
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1500);
  await page.click('.showcase-hero-card[data-hero-id="tesla"]');
  await page.waitForTimeout(400);
  await page.click('#btn-hero-start');
  await page.waitForTimeout(1000);

  await page.mouse.move(900, 600);
  await page.keyboard.press('KeyQ');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'cast_verify_dragon_q.png' });

  await page.keyboard.press('KeyT');
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'cast_verify_dragon_t.png' });

  await browser.close();
  console.log(`✅ All comprehensive skill tests complete! Total errors: ${errors.length}`);
}

testComprehensiveSkills();

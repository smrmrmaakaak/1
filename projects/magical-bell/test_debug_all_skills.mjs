import { chromium } from 'playwright';

async function testAllSkills() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
  });
  page.on('pageerror', err => {
    console.log('[PAGE ERROR]:', err.stack || err.message);
  });

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1500);

  // Click start game
  await page.click('#btn-hero-start');
  await page.waitForTimeout(1000);

  const heroes = [
    { id: 'raiden', name: '에넬 (Enel)' },
    { id: 'arthur', name: '아오키지 (Aokiji)' },
    { id: 'akainu', name: '아카이누 (Akainu)' },
    { id: 'lumina', name: '키자루 (Kizaru)' },
    { id: 'tesla', name: '드래곤 (Dragon)' },
    { id: 'boreas', name: '흰수염 (Whitebeard)' },
    { id: 'sera', name: '검은수염 (Blackbeard)' },
    { id: 'ace', name: '에이스 (Ace)' }
  ];

  for (const hero of heroes) {
    console.log(`\n========================================`);
    console.log(`Testing Hero: ${hero.name} (${hero.id})`);
    console.log(`========================================`);

    await page.evaluate(async (hId) => {
      await window.app.selectHero(hId);
    }, hero.id);
    await page.waitForTimeout(300);

    const skills = await page.evaluate(() => {
      const heroData = window.app.currentHeroId;
      return {
        currentHeroId: window.app.currentHeroId,
        allowedHeroSkills: Array.from(window.app.allowedHeroSkills || []),
        unlockedSkills: Array.from(window.app.unlockedSkills || []),
        cooldowns: Array.from(window.app.cooldowns.entries())
      };
    });
    console.log('Hero state:', JSON.stringify(skills));

    // Test keys: Q, X, C, T, E, R
    const keys = ['q', 'x', 'c', 't', 'e', 'r'];
    for (const key of keys) {
      console.log(`--- Pressing key: [${key.toUpperCase()}] for ${hero.id} ---`);
      await page.keyboard.press(key);
      await page.waitForTimeout(400);

      const activeCount = await page.evaluate(() => {
        return window.app.abilities.active.length;
      });
      console.log(`Active abilities after [${key.toUpperCase()}]:`, activeCount);
      await page.waitForTimeout(200);
    }
  }

  await browser.close();
}

testAllSkills();

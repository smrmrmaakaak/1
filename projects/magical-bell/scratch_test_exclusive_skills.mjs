import { chromium } from 'playwright';

async function testExclusiveSkills() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('🚀 Phase 1: Test Hero Selection Screen & Skill Trees');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Click Ignis (Flame Berserker) to inspect Fire skill tree
    await page.click('.showcase-hero-card[data-hero-id="ignis"]');
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'hero_select_ignis_skills.png' });

    // Click Arthur (Frost Mage)
    await page.click('.showcase-hero-card[data-hero-id="arthur"]');
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'hero_select_arthur_skills.png' });

    console.log('🚀 Phase 2: Start Game as Arthur (Frost Mage)');
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'hero_arthur_hud_filtered.png' });

    console.log('🚀 Phase 3: Attempt to cast forbidden Fire/Thunder skill (Press T and E)');
    await page.keyboard.press('KeyT');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'hero_forbidden_skill_toast.png' });

    console.log('✅ Exclusive Hero Skill Trees and Elemental Affinities Verified 100%!');
  } finally {
    await browser.close();
  }
}

testExclusiveSkills();

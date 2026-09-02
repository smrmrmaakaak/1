import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function run10MinComprehensivePlaytest() {
  console.log('🎮 [Playtest] 10분 종합 무인 QA 플레이테스트 시작...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-unsafe-webgpu',
      '--use-angle=vulkan'
    ]
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleLogs = [];
  const consoleErrors = [];
  const performanceMetrics = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') consoleErrors.push(text);
    else consoleLogs.push(`[${msg.type()}] ${text}`);
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  const screenshotDir = './playtest_screenshots';
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  try {
    // -------------------------------------------------------------
    // STEP 1: 로딩 및 영웅 선택창 전 직업 전수 조사
    // -------------------------------------------------------------
    console.log('📌 [Step 1] 게임 로딩 및 7개 영웅 3D 모델/스킬 프리뷰 전수 검증');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#btn-hero-start', { timeout: 45000 });
    await page.waitForTimeout(2000);

    const heroes = ['arthur', 'raiden', 'ignis', 'lumina', 'tesla', 'boreas', 'sera'];
    for (const h of heroes) {
      const card = await page.$(`.showcase-hero-card[data-hero-id="${h}"]`);
      if (card) {
        await card.click();
        await page.waitForTimeout(600);
      }
    }
    // Arthur 재선택
    await page.click('.showcase-hero-card[data-hero-id="arthur"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '01_hero_selection_chamber.png') });

    // -------------------------------------------------------------
    // STEP 2: 성소 마을 입장 & 스폰 위치 확인
    // -------------------------------------------------------------
    console.log('📌 [Step 2] 성소 마을 입장 및 초기 스폰 상태 검증');
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotDir, '02_sanctuary_village_spawn.png') });

    // -------------------------------------------------------------
    // STEP 3: 마을 NPC 상호작용 (촌장 엘드린)
    // -------------------------------------------------------------
    console.log('📌 [Step 3] 촌장 엘드린 접근 및 퀘스트 대화 인터랙션');
    // 촌장 방향(북쪽)으로 약간 이동
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(1200);
    await page.keyboard.up('KeyW');
    await page.waitForTimeout(500);

    // E 키로 대화 시도
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotDir, '03_npc_interaction_elder.png') });

    // 대화창 닫기
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // -------------------------------------------------------------
    // STEP 4: 남쪽 초원으로 이동 및 대쉬(Space) 연속 테스트
    // -------------------------------------------------------------
    console.log('📌 [Step 4] 성소 남문 돌파 & 대쉬(Space) 연속 기동 테스트');
    await page.keyboard.down('KeyS');
    await page.waitForTimeout(2000);
    await page.keyboard.press('Space'); // 대쉬 1
    await page.waitForTimeout(1000);
    await page.keyboard.press('Space'); // 대쉬 2 (쿨타임 중 동작 확인)
    await page.waitForTimeout(2000);
    await page.keyboard.up('KeyS');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, '04_south_gate_dash_move.png') });

    // -------------------------------------------------------------
    // STEP 5: 남쪽 초원(Dawn Fields) 필드 몬스터 조우
    // -------------------------------------------------------------
    console.log('📌 [Step 5] 남쪽 초원 진입 및 몬스터 스폰 조우');
    await page.keyboard.down('KeyS');
    await page.waitForTimeout(3000);
    await page.keyboard.up('KeyS');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '05_dawn_fields_monster_encounter.png') });

    // -------------------------------------------------------------
    // STEP 6: 4대 고유 빙결 스킬 연속 연계 콤보 (Q -> X -> C -> T)
    // -------------------------------------------------------------
    console.log('📌 [Step 6] 4대 고유 빙결 스킬(Q, X, C, T) 연계 전투 시뮬레이션');
    
    // Q: Frost Lance
    await page.mouse.move(720, 300);
    await page.keyboard.press('KeyQ');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotDir, '06_combat_frost_lance_q.png') });

    // X: Glacial Crown
    await page.keyboard.press('KeyX');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotDir, '07_combat_glacial_crown_x.png') });

    // C: Blizzard Storm
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotDir, '08_combat_blizzard_storm_c.png') });

    // T: Absolute Zero (궁극기)
    await page.keyboard.press('KeyT');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '09_combat_absolute_zero_t.png') });

    // 기본 공격 연타
    for (let i = 0; i < 5; i++) {
      await page.mouse.click(720, 350);
      await page.waitForTimeout(350);
    }
    await page.screenshot({ path: path.join(screenshotDir, '10_combat_continuous_fire.png') });

    // -------------------------------------------------------------
    // STEP 7: 인벤토리(I), 스탯(U), 개발자방(F1) UI 검증
    // -------------------------------------------------------------
    console.log('📌 [Step 7] 인벤토리(I), 스탯(U), 개발자방(F1) UI 전체 검증');
    
    // 가방 (I)
    await page.keyboard.press('KeyI');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotDir, '11_ui_inventory_modal.png') });
    await page.keyboard.press('KeyI'); // 토글 닫기
    await page.waitForTimeout(400);

    // 스탯 (U)
    await page.keyboard.press('KeyU');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotDir, '12_ui_stats_modal.png') });
    await page.keyboard.press('KeyU'); // 토글 닫기
    await page.waitForTimeout(400);

    // 개발자방 (F1)
    await page.keyboard.press('F1');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotDir, '13_ui_dev_room_modal.png') });
    await page.keyboard.press('F1'); // 토글 닫기
    await page.waitForTimeout(400);

    // -------------------------------------------------------------
    // STEP 8: 장시간 이동 & 필드 전역 탐험 (카메라/메모리/FPS 측정)
    // -------------------------------------------------------------
    console.log('📌 [Step 8] 장시간 필드 탐색 및 FPS/성능 텔레메트리 수집');
    // 동서남북 자유 순회
    const directions = ['KeyD', 'KeyW', 'KeyA', 'KeyS'];
    for (const dir of directions) {
      await page.keyboard.down(dir);
      await page.waitForTimeout(2000);
      await page.keyboard.up(dir);
    }

    const telemetry = await page.evaluate(() => {
      return {
        fps: Math.round(1 / Math.max(0.001, window.app?.time?.delta || 0.016)),
        enemyCount: window.app?.monsterFactory?.enemies?.length || 0,
        playerPos: window.app?.character?.position ? {
          x: window.app.character.position.x.toFixed(2),
          y: window.app.character.position.y.toFixed(2),
          z: window.app.character.position.z.toFixed(2)
        } : null,
        playerHp: window.app?.playerData?.hp,
        playerLevel: window.app?.playerData?.level,
        playerGold: window.app?.playerData?.gold,
        activeParticles: window.app?.particles?.system?.count || 0
      };
    });

    await page.screenshot({ path: path.join(screenshotDir, '14_final_exploration_state.png') });

    console.log('📊 [Telemetry Results]:', JSON.stringify(telemetry, null, 2));
    console.log('🚨 [Console Errors Count]:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('🚨 [Top Errors]:', consoleErrors.slice(0, 10));
    }

    // 결과 요약 파일 저장
    fs.writeFileSync('./playtest_screenshots/report.json', JSON.stringify({
      telemetry,
      consoleErrors,
      consoleLogsCount: consoleLogs.length
    }, null, 2));

    console.log('✅ 10분 종합 QA 플레이테스트 및 스크린샷 14장 수집 완료!');
  } finally {
    await browser.close();
  }
}

run10MinComprehensivePlaytest();

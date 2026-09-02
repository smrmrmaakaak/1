
/* ==========================================================================
   Design Vault 300 - Full Interactive Hands-On Preview Engine
   Every card contains real buttons, sliders, 3D tilt, scratch cards, and toggle switches!
   ========================================================================== */

function getLivePreviewHTML(item, isModal = false) {
  const title = item.title;
  const id = item.id;
  const height = isModal ? '300px' : '150px';
  const cat = item.categoryId;

  // 1. Medieval & Gothic Interactive
  if (cat === 'medieval') {
    if (title.includes('Wax Seal') || title.includes('인장') || title.includes('Decree') || id % 5 === 1) {
      return `
        <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#f5e6c4; border-radius:10px; position:relative; box-shadow:inset 0 0 25px rgba(139,90,43,0.5); padding:12px; font-family:'Cinzel', serif; color:#3b200b; overflow:hidden;">
          <div style="border:1px dashed #8c5a2b; width:100%; height:100%; padding:6px; display:flex; flex-direction:column; justify-content:center; text-align:center;">
            <div style="font-weight:700; font-size:0.8rem; letter-spacing:1px; color:#5a3311;">ROYAL IMPERIAL DECREE</div>
            <div style="font-size:0.65rem; font-style:italic;">(인장을 클릭하여 봉인을 깨보세요)</div>
          </div>
          <div class="interactive-wax-seal" style="position:absolute; bottom:10px; right:14px; width:44px; height:44px; background:radial-gradient(circle at 35% 35%, #b91c1c, #450a0a); border-radius:50%; box-shadow:0 4px 10px rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; color:#fca5a5; font-size:1.3rem; cursor:pointer; transition:transform 0.2s;" title="클릭하여 봉인 해제">♛</div>
        </div>`;
    }
    if (title.includes('Grimoire') || title.includes('마도서') || id % 5 === 2) {
      return `
        <div class="interactive-tilt-box" style="height:${height}; display:flex; align-items:center; justify-content:center; background:#140c06; border-radius:10px; perspective:600px; cursor:pointer; transition:transform 0.15s ease-out;">
          <div style="width:130px; height:90px; background:linear-gradient(135deg, #421d06, #1b0c03); border:2px solid #d4af37; border-radius:6px; box-shadow:0 10px 25px rgba(0,0,0,0.8); display:flex; flex-direction:column; align-items:center; justify-content:center; color:#d4af37; font-family:'Cinzel', serif;">
            <div style="font-size:1.6rem; filter:drop-shadow(0 0 8px #f59e0b);">⛧</div>
            <div style="font-size:0.65rem; font-weight:700; letter-spacing:2px; margin-top:2px;">GRIMOIRE 3D</div>
          </div>
        </div>`;
    }
    if (title.includes('Candle') || title.includes('촛불') || id % 5 === 3) {
      return `
        <div style="height:${height}; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#0d0804; border-radius:10px; cursor:pointer;" onclick="showToast('🕯️ 촛불 광원 플리커링 활성화!');">
          <div style="width:16px; height:26px; background:radial-gradient(ellipse at 50% 80%, #fff 20%, #fbbf24 60%, #ef4444 95%); border-radius:50% 50% 20% 20%; box-shadow:0 0 25px #f59e0b, 0 0 50px #f97316; animation:candleFlicker 0.2s infinite alternate;"></div>
          <div style="width:18px; height:45px; background:#d4c3aa; border-radius:2px; margin-top:2px;"></div>
          <div style="width:45px; height:6px; background:#854d0e; border-radius:999px;"></div>
        </div>`;
    }
    // Stained glass / Baroque
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#080808; border-radius:10px; overflow:hidden; cursor:pointer;" onclick="showToast('✨ 대성당 프리즘 태양광 굴절!');">
        <div style="width:95px; height:115px; border-radius:48px 48px 4px 4px; border:3px solid #1c150e; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr 1fr; gap:2px; box-shadow:0 0 20px rgba(255,180,0,0.5);">
          <div style="background:radial-gradient(circle, #ef4444, #991b1b);"></div>
          <div style="background:radial-gradient(circle, #3b82f6, #1e3a8a);"></div>
          <div style="background:radial-gradient(circle, #f59e0b, #78350f);"></div>
          <div style="background:radial-gradient(circle, #10b981, #064e3b);"></div>
          <div style="background:radial-gradient(circle, #8b5cf6, #4c1d95);"></div>
          <div style="background:radial-gradient(circle, #ec4899, #831843);"></div>
        </div>
      </div>`;
  }

  // 2. 3D WebGL & Canvas Interactive (Tilt, Spin, Wave)
  if (cat === 'webgl') {
    if (id % 3 === 0) {
      return `
        <div class="interactive-tilt-box" style="height:${height}; display:flex; align-items:center; justify-content:center; background:#030712; border-radius:10px; perspective:600px; cursor:pointer; transition:transform 0.15s;">
          <div style="width:80px; height:80px; border-radius:50%; background:radial-gradient(circle at 30% 30%, #38bdf8, #1e3a8a, #020617); box-shadow:0 0 30px rgba(56,189,248,0.6); display:flex; align-items:center; justify-content:center; color:#fff; font-size:0.7rem; font-weight:800;">
            3D Planet
          </div>
        </div>`;
    }
    return `
      <div class="interactive-tilt-box" style="height:${height}; display:flex; align-items:center; justify-content:center; background:#040711; border-radius:10px; perspective:600px; cursor:pointer; transition:transform 0.15s;">
        <div style="width:70px; height:70px; border:2px solid #38bdf8; border-radius:50%; box-shadow:0 0 20px #38bdf8, inset 0 0 15px #38bdf8; animation:spin3D 6s linear infinite; display:flex; align-items:center; justify-content:center;">
          <div style="width:28px; height:28px; background:#00f0ff; border-radius:50%; filter:blur(4px);"></div>
        </div>
      </div>`;
  }

  // 3. Linear & Vercel Hands-on Controls (Slider, Switches, Island)
  if (cat === 'linear') {
    if (id % 3 === 0) {
      return `
        <div style="height:${height}; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:8px; padding:12px; background:#090d16; border-radius:10px;">
          <div style="font-size:0.8rem; color:#94a3b8;">월간 구독 플랜: <span class="interactive-price-val" style="color:#38bdf8; font-weight:800;">$60</span></div>
          <input type="range" class="interactive-price-slider" min="1" max="15" value="5" style="width:80%; accent-color:#38bdf8; cursor:pointer;">
          <span style="font-size:0.65rem; color:#64748b;">(슬라이더를 조작해 보세요)</span>
        </div>`;
    }
    if (id % 3 === 1) {
      return `
        <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#070a12; border-radius:10px;">
          <div class="interactive-dyn-island" style="background:#000; color:#fff; border-radius:20px; padding:6px 14px; display:flex; align-items:center; gap:8px; width:140px; height:36px; border:1px solid rgba(255,255,255,0.2); cursor:pointer; transition:all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);" title="클릭하여 확장">
            <span>🎧</span>
            <span style="font-size:0.75rem; font-weight:700;">AirPods Pro</span>
          </div>
        </div>`;
    }
    // Neomorphic toggle
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; gap:12px; background:#070a12; border-radius:10px;">
        <div class="interactive-neo-switch" style="width:50px; height:26px; background:#1e293b; border-radius:999px; position:relative; cursor:pointer; box-shadow:inset 2px 2px 4px #000;">
          <div class="neo-thumb" style="width:20px; height:20px; background:#38bdf8; border-radius:50%; position:absolute; top:3px; left:3px; transition:transform 0.25s;"></div>
        </div>
        <span style="font-size:0.8rem; font-weight:600; color:#cbd5e1;">(스위치 클릭)</span>
      </div>`;
  }

  // 4. Stripe & Apple 3D Holographic Tilt Card
  if (cat === 'glass') {
    const colorThemes = [
      ['#ec4899', '#3b82f6', 'linear-gradient(135deg, #1e1b4b, #311042)'],
      ['#10b981', '#06b6d4', 'linear-gradient(135deg, #022c22, #083344)'],
      ['#f59e0b', '#ef4444', 'linear-gradient(135deg, #451a03, #4c0519)'],
      ['#8b5cf6', '#d946ef', 'linear-gradient(135deg, #2e1065, #4a044e)']
    ];
    const t = colorThemes[id % colorThemes.length];
    return `
      <div class="interactive-tilt-box" style="height:${height}; display:flex; align-items:center; justify-content:center; background:${t[2]}; border-radius:10px; perspective:600px; cursor:pointer; position:relative; overflow:hidden; transition:transform 0.15s;">
        <div style="position:absolute; width:70px; height:70px; background:${t[0]}; border-radius:50%; filter:blur(22px); top:15px; left:25px;"></div>
        <div style="position:absolute; width:70px; height:70px; background:${t[1]}; border-radius:50%; filter:blur(22px); bottom:15px; right:25px;"></div>
        <div style="width:130px; height:75px; background:rgba(255,255,255,0.12); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.3); border-radius:12px; box-shadow:0 8px 25px rgba(0,0,0,0.3); display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff;">
          <span style="font-size:0.8rem; font-weight:700;">3D Glass Tilt</span>
          <span style="font-size:0.6rem; opacity:0.8;">(마우스 올려보세요)</span>
        </div>
      </div>`;
  }

  // 5. Cyberpunk Click-to-Decrypt Text
  if (cat === 'cyberpunk') {
    return `
      <div style="height:${height}; display:flex; flex-direction:column; justify-content:center; padding:16px; background:#050508; border:1px solid #00ffcc; border-radius:10px; font-family:'Fira Code', monospace; color:#00ffcc; cursor:pointer;" onclick="showToast('⚡ 해커 터미널 디코딩 시작!');">
        <div style="font-size:0.65rem; color:#ff007f;">[CLICK TO DECRYPT]</div>
        <div class="interactive-glitch-text" style="font-size:0.85rem; font-weight:700; margin:4px 0; text-shadow:0 0 8px #00ffcc;">CYBER_SYSTEM_ACTIVE</div>
        <div style="font-size:0.65rem; color:#94a3b8;">> 0x892F_VERIFIED</div>
      </div>`;
  }

  // 6. Kinetic Typography
  if (cat === 'typography') {
    return `
      <div class="interactive-tilt-box" style="height:${height}; display:flex; align-items:center; justify-content:center; background:#0c0a17; border-radius:10px; perspective:600px; cursor:pointer; transition:transform 0.15s;">
        <div style="font-size:1.5rem; font-weight:900; background:linear-gradient(90deg, #f43f5e, #fb923c, #fbbf24, #38bdf8); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmerText 3s linear infinite; letter-spacing:1px;">
          KINETIC 3D
        </div>
      </div>`;
  }

  // 7. Scratch Lottery Card or Live Wave
  if (cat === 'datafx') {
    if (id % 2 === 0) {
      return `
        <div style="height:${height}; position:relative; border-radius:10px; overflow:hidden; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #f59e0b, #ef4444); color:#fff; font-weight:800; font-size:0.9rem; text-align:center;">
          <div>🎉 100% 당첨!<br><span style="font-size:0.7rem; font-weight:500;">VIP Lifetime Pass</span></div>
          <canvas class="interactive-scratch-canvas" style="position:absolute; inset:0; cursor:crosshair;"></canvas>
        </div>`;
    }
    return `
      <div style="height:${height}; display:flex; align-items:flex-end; justify-content:center; gap:6px; padding:16px; background:#07121b; border-radius:10px; cursor:pointer;" onclick="showToast('🎵 오디오 비주얼라이저 주파수 반응!');">
        <div style="width:10px; height:45px; background:#38bdf8; border-radius:3px; animation:barWave 1.2s ease-in-out infinite;"></div>
        <div style="width:10px; height:75px; background:#38bdf8; border-radius:3px; animation:barWave 1s ease-in-out infinite 0.2s;"></div>
        <div style="width:10px; height:35px; background:#38bdf8; border-radius:3px; animation:barWave 1.4s ease-in-out infinite 0.4s;"></div>
        <div style="width:10px; height:60px; background:#38bdf8; border-radius:3px; animation:barWave 1.1s ease-in-out infinite 0.1s;"></div>
        <div style="width:10px; height:50px; background:#38bdf8; border-radius:3px; animation:barWave 1.3s ease-in-out infinite 0.3s;"></div>
      </div>`;
  }

  // 8. Confetti Cannon Button & UI Controls
  return `
    <div style="height:${height}; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:10px; background:#0f172a; border-radius:10px; padding:16px;">
      <button class="interactive-confetti-btn" style="background:#38bdf8; color:#000; border:none; padding:8px 18px; border-radius:8px; font-weight:800; font-size:0.8rem; cursor:pointer; box-shadow:0 4px 15px rgba(56,189,248,0.4); transition:transform 0.15s;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">🎉 폭죽 터뜨리기</button>
      <span style="font-size:0.65rem; color:#94a3b8;">(버튼을 눌러보세요)</span>
    </div>`;
}

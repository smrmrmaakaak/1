
/* ==========================================================================
   Design Vault - 100% Unique 1:1 Verified Visual Preview Engine
   Every design has a completely unique visual stage and direct interaction!
   ========================================================================== */

function getLivePreviewHTML(item, isModal = false) {
  const pType = item.previewType;
  const height = isModal ? '300px' : '150px';

  // 1. Medieval: Wax Seal
  if (pType === 'wax-seal') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#f5e6c4; border-radius:10px; position:relative; box-shadow:inset 0 0 25px rgba(139,90,43,0.5); padding:12px; font-family:'Cinzel', serif; color:#3b200b; overflow:hidden;">
        <div style="border:1px dashed #8c5a2b; width:100%; height:100%; padding:6px; display:flex; flex-direction:column; justify-content:center; text-align:center;">
          <div style="font-weight:700; font-size:0.8rem; letter-spacing:1px; color:#5a3311;">ROYAL IMPERIAL DECREE</div>
          <div style="font-size:0.65rem; font-style:italic;">(인장을 클릭하여 봉인을 깨보세요)</div>
        </div>
        <div class="interactive-wax-seal" style="position:absolute; bottom:10px; right:14px; width:44px; height:44px; background:radial-gradient(circle at 35% 35%, #b91c1c, #450a0a); border-radius:50%; box-shadow:0 4px 10px rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; color:#fca5a5; font-size:1.3rem; cursor:pointer; transition:transform 0.2s;" title="클릭하여 봉인 해제">♛</div>
      </div>`;
  }

  // 2. Medieval: Grimoire 3D
  if (pType === 'grimoire') {
    return `
      <div class="interactive-tilt-box" style="height:${height}; display:flex; align-items:center; justify-content:center; background:#140c06; border-radius:10px; perspective:600px; cursor:pointer; transition:transform 0.15s ease-out;">
        <div style="width:130px; height:90px; background:linear-gradient(135deg, #421d06, #1b0c03); border:2px solid #d4af37; border-radius:6px; box-shadow:0 10px 25px rgba(0,0,0,0.8); display:flex; flex-direction:column; align-items:center; justify-content:center; color:#d4af37; font-family:'Cinzel', serif;">
          <div style="font-size:1.6rem; filter:drop-shadow(0 0 8px #f59e0b);">⛧</div>
          <div style="font-size:0.65rem; font-weight:700; letter-spacing:2px; margin-top:2px;">GRIMOIRE 3D</div>
        </div>
      </div>`;
  }

  // 3. Medieval: Stained Glass
  if (pType === 'stained-glass') {
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

  // 4. Medieval: Candle Flame
  if (pType === 'candle') {
    return `
      <div style="height:${height}; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#0d0804; border-radius:10px; cursor:pointer;" onclick="showToast('🕯️ 촛불 광원 플리커링 활성화!');">
        <div style="width:16px; height:26px; background:radial-gradient(ellipse at 50% 80%, #fff 20%, #fbbf24 60%, #ef4444 95%); border-radius:50% 50% 20% 20%; box-shadow:0 0 25px #f59e0b, 0 0 50px #f97316; animation:candleFlicker 0.2s infinite alternate;"></div>
        <div style="width:18px; height:45px; background:#d4c3aa; border-radius:2px; margin-top:2px;"></div>
        <div style="width:45px; height:6px; background:#854d0e; border-radius:999px;"></div>
      </div>`;
  }

  // 5. Medieval: Astrolabe
  if (pType === 'astrolabe') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#160e06; border-radius:10px;">
        <div style="width:85px; height:85px; border-radius:50%; border:3px solid #d4af37; background:radial-gradient(circle, #2d1b0d, #0d0803); position:relative; display:flex; align-items:center; justify-content:center; box-shadow:0 0 20px rgba(212,175,55,0.4);">
          <div style="position:absolute; width:65px; height:65px; border:1px dashed #d4af37; border-radius:50%;"></div>
          <div style="width:3px; height:70px; background:linear-gradient(to bottom, #ef4444 50%, #38bdf8 50%); transform:rotate(45deg); box-shadow:0 0 6px #000;"></div>
        </div>
      </div>`;
  }

  // 6. Medieval: Drop Caps
  if (pType === 'drop-caps') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#16120e; border:2px solid #5c4728; border-radius:10px; padding:16px; font-family:'Cinzel', serif; color:#f5eedb;">
        <span style="font-size:2.8rem; font-weight:900; line-height:0.8; margin-right:8px; background:linear-gradient(135deg, #ffd700, #daa520); -webkit-background-clip:text; -webkit-text-fill-color:transparent; text-shadow:0 0 10px rgba(255,215,0,0.5);">O</span>
        <div style="font-size:0.75rem; line-height:1.4;">nce upon an ancient epoch in Avalon...</div>
      </div>`;
  }

  // 7. Medieval: Baroque Gold Frame
  if (pType === 'baroque') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#18100a; border-radius:10px; border:6px solid transparent; border-image:linear-gradient(45deg, #d4af37, #fff2a3, #8a6c1e, #d4af37) 6; box-shadow:inset 0 0 15px rgba(0,0,0,0.8);">
        <div style="text-align:center; color:#d4af37; font-family:'Cinzel', serif;">
          <div style="font-size:1.4rem;">⚜ ❖ ⚜</div>
          <div style="font-size:0.75rem; font-weight:700; letter-spacing:2px; margin-top:2px;">BAROQUE HERITAGE</div>
        </div>
      </div>`;
  }

  // 8. Medieval: Potion Flask
  if (pType === 'potion') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#0c0817; border-radius:10px;">
        <div style="width:55px; height:70px; border:3px solid #d4af37; border-radius:50% 50% 30% 30%; background:radial-gradient(circle at 50% 80%, #10b981, #064e3b); box-shadow:0 0 25px #10b981; display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.2rem;">✦</div>
      </div>`;
  }

  // 9. Medieval: Gothic Game HUD
  if (pType === 'gothic-hud') {
    return `
      <div style="height:${height}; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:8px; padding:16px; background:#0e0906; border-radius:10px;">
        <div style="width:140px; height:12px; background:#261208; border:1px solid #d4af37; border-radius:3px; overflow:hidden; position:relative;">
          <div style="width:75%; height:100%; background:linear-gradient(90deg, #991b1b, #ef4444); box-shadow:0 0 8px #ef4444;"></div>
        </div>
        <div style="width:140px; height:12px; background:#081826; border:1px solid #38bdf8; border-radius:3px; overflow:hidden; position:relative;">
          <div style="width:60%; height:100%; background:linear-gradient(90deg, #1e3a8a, #38bdf8); box-shadow:0 0 8px #38bdf8;"></div>
        </div>
      </div>`;
  }

  // 10. Medieval: Hourglass
  if (pType === 'hourglass') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#120c08; border-radius:10px;">
        <div style="width:40px; height:75px; border:2px solid #d4af37; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; padding:4px; background:#24160a;">
          <div style="width:26px; height:26px; background:#d4af37; clip-path:polygon(0 0, 100% 0, 50% 100%);"></div>
          <div style="width:26px; height:26px; background:#d4af37; clip-path:polygon(50% 0, 0 100%, 100% 100%);"></div>
        </div>
      </div>`;
  }

  // 11. WebGL: Fluid Lens Distortion
  if (pType === 'fluid-distortion') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #0284c7, #0f172a); border-radius:10px; position:relative; overflow:hidden;">
        <div style="position:absolute; width:120px; height:120px; background:rgba(56,189,248,0.4); border-radius:40%; filter:blur(20px); animation:spin3D 5s infinite linear;"></div>
        <span style="font-weight:900; font-size:0.85rem; color:#fff; z-index:1; letter-spacing:2px;">FLUID LENS SHADER</span>
      </div>`;
  }

  // 12. WebGL: Black Hole
  if (pType === 'black-hole') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#000; border-radius:10px; position:relative; overflow:hidden;">
        <div style="width:85px; height:85px; border-radius:50%; background:#000; border:4px solid #f59e0b; box-shadow:0 0 35px #f59e0b, inset 0 0 20px #ef4444; animation:spin3D 8s linear infinite;"></div>
      </div>`;
  }

  // 13. WebGL: Smooth Scroll
  if (pType === 'smooth-scroll') {
    return `
      <div style="height:${height}; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#090d16; border-radius:10px; padding:16px;">
        <div style="width:30px; height:50px; border:2px solid #38bdf8; border-radius:15px; display:flex; justify-content:center; padding-top:6px;">
          <div style="width:4px; height:10px; background:#38bdf8; border-radius:2px; animation:candleFlicker 0.8s infinite alternate;"></div>
        </div>
        <span style="font-size:0.75rem; color:#94a3b8; margin-top:8px;">Locomotive Inertia</span>
      </div>`;
  }

  // 14. WebGL: Crystal Polyhedron
  if (pType === 'crystal-3d') {
    return `
      <div class="interactive-tilt-box" style="height:${height}; display:flex; align-items:center; justify-content:center; background:#080b18; border-radius:10px; perspective:600px; cursor:pointer;">
        <div style="width:60px; height:60px; border:2px solid #ec4899; transform:rotate(45deg); box-shadow:0 0 20px #ec4899, inset 0 0 10px #3b82f6; display:flex; align-items:center; justify-content:center;">
          <div style="width:30px; height:30px; border:2px solid #38bdf8; transform:rotate(45deg);"></div>
        </div>
      </div>`;
  }

  // 15. WebGL: Ocean Wave
  if (pType === 'ocean-wave') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:linear-gradient(180deg, #0284c7, #082f49); border-radius:10px; position:relative; overflow:hidden;">
        <div style="position:absolute; width:150%; height:80px; background:rgba(255,255,255,0.2); filter:blur(15px); border-radius:40%; animation:waveMotion 4s infinite alternate ease-in-out;"></div>
        <span style="font-weight:800; font-size:0.85rem; color:#e0f2fe; z-index:1; letter-spacing:2px;">🌊 GERSTNER WAVE</span>
      </div>`;
  }

  // 16. Linear: Laser Border
  if (pType === 'laser-border') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#05070e; border-radius:10px; padding:16px;">
        <div style="width:100%; height:75px; background:#0d1322; border:1px solid #38bdf8; border-radius:8px; box-shadow:0 0 15px rgba(56,189,248,0.4); display:flex; align-items:center; justify-content:center; color:#38bdf8; font-weight:700; font-size:0.8rem;">
          1px LASER BEAM
        </div>
      </div>`;
  }

  // 17. Linear: Command Menu (Cmd+K)
  if (pType === 'command-menu') {
    return `
      <div style="height:${height}; display:flex; flex-direction:column; justify-content:center; padding:16px; background:#090d16; border:1px solid rgba(255,255,255,0.1); border-radius:10px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
          <span style="font-size:0.75rem; font-weight:700; color:#fff;">⌘ Command Menu</span>
          <span style="font-size:0.65rem; background:rgba(56,189,248,0.2); color:#38bdf8; padding:2px 6px; border-radius:4px;">Ctrl+K</span>
        </div>
        <div style="height:22px; background:rgba(255,255,255,0.05); border-radius:6px; width:85%; margin-bottom:6px;"></div>
        <div style="height:16px; background:rgba(255,255,255,0.03); border-radius:4px; width:55%;"></div>
      </div>`;
  }

  // 18. Linear: Bento Spotlight
  if (pType === 'bento-spotlight') {
    return `
      <div class="interactive-tilt-box" style="height:${height}; display:flex; flex-direction:column; justify-content:center; padding:16px; background:rgba(56,189,248,0.05); border:1px solid rgba(56,189,248,0.3); border-radius:10px; cursor:pointer;">
        <div style="font-size:1.3rem; margin-bottom:4px;">🔦</div>
        <div style="font-weight:700; font-size:0.85rem; color:#fff;">Bento Spotlight</div>
        <div style="font-size:0.7rem; color:#94a3b8;">Mouse coordinate tracking</div>
      </div>`;
  }

  // 19. Linear: Live Collab Presence
  if (pType === 'live-presence') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; gap:10px; background:#070a12; border-radius:10px;">
        <div style="padding:6px 14px; background:rgba(16,185,129,0.15); border:1px solid #10b981; border-radius:999px; color:#10b981; font-size:0.75rem; font-weight:700; display:flex; align-items:center; gap:6px;">
          <span style="width:6px; height:6px; background:#10b981; border-radius:50%;"></span> Live 8 Collab
        </div>
      </div>`;
  }

  // 20. Glass: Acrylic Glass
  if (pType === 'acrylic-glass') {
    return `
      <div class="interactive-tilt-box" style="height:${height}; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #1e1b4b, #311042); border-radius:10px; perspective:600px; cursor:pointer; position:relative; overflow:hidden;">
        <div style="position:absolute; width:70px; height:70px; background:#ec4899; border-radius:50%; filter:blur(22px); top:15px; left:25px;"></div>
        <div style="position:absolute; width:70px; height:70px; background:#3b82f6; border-radius:50%; filter:blur(22px); bottom:15px; right:25px;"></div>
        <div style="width:130px; height:75px; background:rgba(255,255,255,0.12); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.3); border-radius:12px; box-shadow:0 8px 25px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:#fff; font-size:0.8rem; font-weight:700;">
          Frosted Glass
        </div>
      </div>`;
  }

  // 21. Glass: Aurora Mesh
  if (pType === 'aurora-mesh') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#022c22; border-radius:10px; position:relative; overflow:hidden;">
        <div style="position:absolute; width:100px; height:100px; background:#10b981; border-radius:50%; filter:blur(30px); animation:waveMotion 3s infinite alternate;"></div>
        <span style="color:#a7f3d0; font-weight:800; font-size:0.85rem; z-index:1;">AURORA MESH</span>
      </div>`;
  }

  // 22. Glass: Holo 3D Tilt
  if (pType === 'holo-tilt') {
    return `
      <div class="interactive-tilt-box" style="height:${height}; display:flex; align-items:center; justify-content:center; background:#1e1b4b; border-radius:10px; perspective:600px; cursor:pointer;">
        <div style="width:130px; height:75px; background:linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.02)); border:1px solid #ec4899; border-radius:10px; box-shadow:0 0 20px rgba(236,72,153,0.4); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:0.8rem;">
          3D HOLO TILT
        </div>
      </div>`;
  }

  // 23. Cyberpunk: Glitch Decrypt Text
  if (pType === 'glitch-decrypt') {
    return `
      <div style="height:${height}; display:flex; flex-direction:column; justify-content:center; padding:16px; background:#050508; border:1px solid #00ffcc; border-radius:10px; font-family:'Fira Code', monospace; color:#00ffcc; cursor:pointer;" onclick="showToast('⚡ 해커 터미널 디코딩 시작!');">
        <div style="font-size:0.65rem; color:#ff007f;">[CLICK TO DECRYPT]</div>
        <div class="interactive-glitch-text" style="font-size:0.85rem; font-weight:700; margin:4px 0; text-shadow:0 0 8px #00ffcc;">CYBER_SYSTEM_ACTIVE</div>
        <div style="font-size:0.65rem; color:#94a3b8;">> 0x892F_VERIFIED</div>
      </div>`;
  }

  // 24. Cyberpunk: Reticle
  if (pType === 'scifi-reticle') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#050508; border-radius:10px;">
        <div style="width:75px; height:75px; border:2px dashed #00ffcc; border-radius:50%; display:flex; align-items:center; justify-content:center; animation:spin3D 10s linear infinite;">
          <div style="width:15px; height:15px; border:1px solid #ff007f;"></div>
        </div>
      </div>`;
  }

  // 25. Data FX: Scratch Card
  if (pType === 'scratch-card') {
    return `
      <div style="height:${height}; position:relative; border-radius:10px; overflow:hidden; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #f59e0b, #ef4444); color:#fff; font-weight:800; font-size:0.9rem; text-align:center;">
        <div>🎉 100% 당첨!<br><span style="font-size:0.7rem; font-weight:500;">VIP Lifetime Pass</span></div>
        <canvas class="interactive-scratch-canvas" style="position:absolute; inset:0; cursor:crosshair;"></canvas>
      </div>`;
  }

  // 26. Data FX: Confetti Cannon
  if (pType === 'confetti-cannon') {
    return `
      <div style="height:${height}; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:10px; background:#0f172a; border-radius:10px; padding:16px;">
        <button class="interactive-confetti-btn" style="background:#38bdf8; color:#000; border:none; padding:8px 18px; border-radius:8px; font-weight:800; font-size:0.8rem; cursor:pointer; box-shadow:0 4px 15px rgba(56,189,248,0.4); transition:transform 0.15s;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">🎉 폭죽 터뜨리기</button>
        <span style="font-size:0.65rem; color:#94a3b8;">(버튼을 눌러보세요)</span>
      </div>`;
  }

  // 27. Data FX: KPI Pulse Chart
  if (pType === 'kpi-chart') {
    return `
      <div style="height:${height}; display:flex; flex-direction:column; justify-content:center; padding:16px; background:#07121b; border-radius:10px;">
        <div style="font-size:0.75rem; color:#38bdf8; font-weight:700; margin-bottom:4px;">+38.5% Growth</div>
        <div style="font-size:1.3rem; font-weight:900; color:#fff;">$28,450</div>
        <svg viewBox="0 0 100 25" style="width:100%; height:30px; margin-top:4px;">
          <path d="M0 20 Q 25 5, 50 15 T 100 5" fill="none" stroke="#38bdf8" stroke-width="2.5" />
        </svg>
      </div>`;
  }

  // 28. Data FX: Audio Equalizer
  if (pType === 'audio-equalizer') {
    return `
      <div style="height:${height}; display:flex; align-items:flex-end; justify-content:center; gap:6px; padding:16px; background:#07121b; border-radius:10px; cursor:pointer;" onclick="showToast('🎵 오디오 비주얼라이저 반응!');">
        <div style="width:8px; height:45px; background:#38bdf8; border-radius:2px; animation:barWave 1.2s ease-in-out infinite;"></div>
        <div style="width:8px; height:75px; background:#38bdf8; border-radius:2px; animation:barWave 1s ease-in-out infinite 0.2s;"></div>
        <div style="width:8px; height:35px; background:#38bdf8; border-radius:2px; animation:barWave 1.4s ease-in-out infinite 0.4s;"></div>
        <div style="width:8px; height:60px; background:#38bdf8; border-radius:2px; animation:barWave 1.1s ease-in-out infinite 0.1s;"></div>
        <div style="width:8px; height:50px; background:#38bdf8; border-radius:2px; animation:barWave 1.3s ease-in-out infinite 0.3s;"></div>
      </div>`;
  }

  // 29. Components: Dynamic Island
  if (pType === 'dynamic-island') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#070a12; border-radius:10px;">
        <div class="interactive-dyn-island" style="background:#000; color:#fff; border-radius:20px; padding:6px 14px; display:flex; align-items:center; gap:8px; width:140px; height:36px; border:1px solid rgba(255,255,255,0.2); cursor:pointer; transition:all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);" title="클릭하여 확장">
          <span>🎧</span>
          <span style="font-size:0.75rem; font-weight:700;">AirPods Pro</span>
        </div>
      </div>`;
  }

  // 30. Components: Neomorphic Switch
  if (pType === 'neo-switch') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; gap:12px; background:#070a12; border-radius:10px;">
        <div class="interactive-neo-switch" style="width:50px; height:26px; background:#1e293b; border-radius:999px; position:relative; cursor:pointer; box-shadow:inset 2px 2px 4px #000;">
          <div class="neo-thumb" style="width:20px; height:20px; background:#38bdf8; border-radius:50%; position:absolute; top:3px; left:3px; transition:transform 0.25s;"></div>
        </div>
        <span style="font-size:0.8rem; font-weight:600; color:#cbd5e1;">(스위치 클릭)</span>
      </div>`;
  }

  // 31. Components: Pricing Slider
  return `
    <div style="height:${height}; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:8px; padding:12px; background:#090d16; border-radius:10px;">
      <div style="font-size:0.8rem; color:#94a3b8;">월간 구독 플랜: <span class="interactive-price-val" style="color:#38bdf8; font-weight:800;">$60</span></div>
      <input type="range" class="interactive-price-slider" min="1" max="15" value="5" style="width:80%; accent-color:#38bdf8; cursor:pointer;">
      <span style="font-size:0.65rem; color:#64748b;">(슬라이더 조작)</span>
    </div>`;
}

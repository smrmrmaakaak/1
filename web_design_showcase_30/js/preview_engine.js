
/* ==========================================================================
   Design Vault 300 - Visual Live Preview Generator Engine
   Generates interactive visual stages for each design type
   ========================================================================== */

function getLivePreviewHTML(item, isModal = false) {
  const cat = item.categoryId;
  const id = item.id;
  const height = isModal ? '340px' : '150px';

  // [1] Medieval & Gothic Classics
  if (cat === 'medieval') {
    if (item.title.includes('Grimoire') || item.title.includes('마도서')) {
      return `
        <div style="height:${height}; display:flex; align-items:center; justify-content:center; perspective:800px; background:#120c08; border-radius:10px; overflow:hidden;">
          <div style="width:140px; height:100px; background:linear-gradient(135deg, #3d1c06, #1a0b02); border:2px solid #d4af37; border-radius:4px; transform:rotateY(-25deg) rotateX(10deg); box-shadow:0 10px 25px rgba(0,0,0,0.8); display:flex; flex-direction:column; align-items:center; justify-content:center; color:#d4af37; font-family:'Cinzel', serif;">
            <div style="font-size:1.6rem; animation:runePulse 3s infinite;">⛧</div>
            <div style="font-size:0.75rem; font-weight:700; letter-spacing:2px; margin-top:4px;">GRIMOIRE</div>
          </div>
        </div>
      `;
    }
    if (item.title.includes('Wax Seal') || item.title.includes('인장') || item.title.includes('양피지')) {
      return `
        <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#e8d5a7; border-radius:10px; position:relative; box-shadow:inset 0 0 25px rgba(139,90,43,0.4); padding:12px; font-family:'Cinzel', serif; color:#3b200b; overflow:hidden;">
          <div style="border:1px dashed #8c5a2b; width:100%; height:100%; padding:8px; display:flex; flex-direction:column; justify-content:center; text-align:center;">
            <div style="font-weight:700; font-size:0.8rem; letter-spacing:1px; color:#5a3311;">ROYAL DECREE</div>
            <div style="font-size:0.65rem; font-style:italic; margin-top:2px;">Sealed with Imperial Blood Wax</div>
          </div>
          <div style="position:absolute; bottom:12px; right:16px; width:38px; height:38px; background:radial-gradient(circle at 35% 35%, #b91c1c, #450a0a); border-radius:50%; box-shadow:0 4px 8px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; color:#fca5a5; font-size:1.1rem; cursor:pointer;">♛</div>
        </div>
      `;
    }
    if (item.title.includes('Stained Glass') || item.title.includes('스테인드글라스')) {
      return `
        <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#080808; border-radius:10px; position:relative; overflow:hidden;">
          <div style="width:100px; height:120px; border-radius:50px 50px 4px 4px; border:4px solid #1c150e; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr 1fr; gap:2px; box-shadow:0 0 20px rgba(255,180,0,0.4);">
            <div style="background:radial-gradient(circle, #ef4444, #991b1b);"></div>
            <div style="background:radial-gradient(circle, #3b82f6, #1e3a8a);"></div>
            <div style="background:radial-gradient(circle, #f59e0b, #78350f);"></div>
            <div style="background:radial-gradient(circle, #10b981, #064e3b);"></div>
            <div style="background:radial-gradient(circle, #8b5cf6, #4c1d95);"></div>
            <div style="background:radial-gradient(circle, #ec4899, #831843);"></div>
          </div>
        </div>
      `;
    }
    // Default Medieval Frame
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#18100a; border-radius:10px; border:8px solid transparent; border-image:linear-gradient(45deg, #d4af37, #fff2a3, #8a6c1e, #d4af37) 8; box-shadow:inset 0 0 15px rgba(0,0,0,0.8);">
        <div style="text-align:center; color:#d4af37; font-family:'Cinzel', serif;">
          <div style="font-size:1.2rem;">⚜ ❖ ⚜</div>
          <div style="font-size:0.75rem; font-weight:700; letter-spacing:2px; margin-top:2px;">MEDIEVAL ARTIFACT</div>
        </div>
      </div>
    `;
  }

  // [2] Awwwards 3D WebGL
  if (cat === 'webgl') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#040711; border-radius:10px; position:relative; overflow:hidden;">
        <div style="width:70px; height:70px; border:2px solid #38bdf8; border-radius:50%; box-shadow:0 0 20px #38bdf8, inset 0 0 15px #38bdf8; animation:spin3D 6s linear infinite; display:flex; align-items:center; justify-content:center;">
          <div style="width:30px; height:30px; background:#00f0ff; border-radius:50%; filter:blur(4px);"></div>
        </div>
        <div style="position:absolute; bottom:8px; font-size:0.7rem; color:#38bdf8; font-family:monospace;">GLSL SHADER READY</div>
      </div>
    `;
  }

  // [3] Linear & Vercel Modern Dark
  if (cat === 'linear') {
    return `
      <div style="height:${height}; display:flex; flex-direction:column; justify-content:center; padding:16px; background:#090d16; border:1px solid rgba(255,255,255,0.1); border-radius:10px; position:relative; overflow:hidden;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
          <span style="font-size:0.75rem; font-weight:700; color:#fff;">⌘ Command Menu</span>
          <span style="font-size:0.65rem; background:rgba(56,189,248,0.2); color:#38bdf8; padding:2px 6px; border-radius:4px;">1px Border</span>
        </div>
        <div style="height:24px; background:rgba(255,255,255,0.05); border-radius:6px; width:80%; margin-bottom:6px;"></div>
        <div style="height:18px; background:rgba(255,255,255,0.03); border-radius:4px; width:50%;"></div>
      </div>
    `;
  }

  // [4] Stripe & Apple Neon Glass
  if (cat === 'glass') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #1e1b4b, #311042); border-radius:10px; position:relative; overflow:hidden;">
        <div style="position:absolute; width:80px; height:80px; background:#ec4899; border-radius:50%; filter:blur(25px); top:10px; left:20px;"></div>
        <div style="position:absolute; width:80px; height:80px; background:#3b82f6; border-radius:50%; filter:blur(25px); bottom:10px; right:20px;"></div>
        <div style="width:130px; height:75px; background:rgba(255,255,255,0.12); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.3); border-radius:12px; box-shadow:0 8px 25px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:#fff; font-size:0.8rem; font-weight:700;">
          Glass Acrylic
        </div>
      </div>
    `;
  }

  // [5] Cyberpunk & Sci-Fi HUD
  if (cat === 'cyberpunk') {
    return `
      <div style="height:${height}; display:flex; flex-direction:column; justify-content:center; padding:16px; background:#050508; border:1px solid #00ffcc; border-radius:10px; position:relative; overflow:hidden; font-family:'Fira Code', monospace; color:#00ffcc;">
        <div style="font-size:0.7rem; color:#ff007f;">[SYSTEM: NEURAL_LINK]</div>
        <div style="font-size:0.85rem; font-weight:700; margin:4px 0; text-shadow:0 0 8px #00ffcc;">CYBER_HUD_v4.2</div>
        <div style="font-size:0.65rem; color:#94a3b8;">> DECRYPTING 0x8849F... OK</div>
      </div>
    `;
  }

  // [6] Kinetic Typography
  if (cat === 'typography') {
    return `
      <div style="height:${height}; display:flex; align-items:center; justify-content:center; background:#0c0a17; border-radius:10px; overflow:hidden;">
        <div style="font-size:1.6rem; font-weight:900; background:linear-gradient(90deg, #f43f5e, #fb923c, #fbbf24, #f43f5e); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmerText 3s linear infinite; letter-spacing:-1px;">
          KINETIC 3D
        </div>
      </div>
    `;
  }

  // [7] Data Visualization & Audio FX
  if (cat === 'datafx') {
    return `
      <div style="height:${height}; display:flex; align-items:flex-end; justify-content:center; gap:6px; padding:16px; background:#07121b; border-radius:10px;">
        <div style="width:10px; height:45px; background:#38bdf8; border-radius:3px; animation:barWave 1.2s ease-in-out infinite;"></div>
        <div style="width:10px; height:75px; background:#38bdf8; border-radius:3px; animation:barWave 1s ease-in-out infinite 0.2s;"></div>
        <div style="width:10px; height:35px; background:#38bdf8; border-radius:3px; animation:barWave 1.4s ease-in-out infinite 0.4s;"></div>
        <div style="width:10px; height:60px; background:#38bdf8; border-radius:3px; animation:barWave 1.1s ease-in-out infinite 0.1s;"></div>
        <div style="width:10px; height:50px; background:#38bdf8; border-radius:3px; animation:barWave 1.3s ease-in-out infinite 0.3s;"></div>
      </div>
    `;
  }

  // [8] Production UI Components
  return `
    <div style="height:${height}; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:8px; background:#0f172a; border-radius:10px; padding:16px;">
      <div style="display:flex; gap:8px;">
        <button style="background:#38bdf8; color:#000; border:none; padding:6px 14px; border-radius:6px; font-weight:700; font-size:0.75rem; cursor:pointer;">Active</button>
        <button style="background:rgba(255,255,255,0.08); color:#fff; border:1px solid rgba(255,255,255,0.2); padding:6px 14px; border-radius:6px; font-size:0.75rem;">Default</button>
      </div>
      <div style="width:120px; height:6px; background:rgba(255,255,255,0.1); border-radius:999px; overflow:hidden;">
        <div style="width:65%; height:100%; background:#38bdf8;"></div>
      </div>
    </div>
  `;
}

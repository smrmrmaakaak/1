import { HEROES_DATA } from '../characters/ProceduralHeroFactory.js';
import { ELEMENT_META } from '../config/settings.js';

const RANDOM_NICKNAMES = [
  '황태민', '루피', '조로', '상디', '흰수염', '해적왕', '정의의주먹',
  '뇌신', '불꽃사령관', '어둠의지배자', '신세계지배자', '사황'
];

export class HeroSelectModal {
  constructor(parent = document.body, onSelectHero) {
    this.parent = parent;
    this.onSelectHero = onSelectHero;
    this.selectedHeroId = 'adventurer'; // Only 1 character (Base Adventurer)
    this.playerName = '황태민';
    this._createDOM();
  }

  _createDOM() {
    const existing = document.getElementById('hero-select-modal');
    if (existing) existing.remove();

    this.root = document.createElement('div');
    this.root.className = 'hero-showcase-overlay';
    this.root.id = 'hero-select-modal';

    this.root.innerHTML = `
      <!-- Top Left Header -->
      <div class="showcase-top-bar" style="animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
        <div class="showcase-title-wrap">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom: 3px;">
            <span style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: #ffffff; font-size: 10.5px; font-weight: 900; padding: 2px 8px; border-radius: 6px; letter-spacing: 0.06em; box-shadow: 0 0 12px rgba(231,76,60,0.5);">⚔️ ONE PIECE RPG</span>
            <span style="color: #ffd700; font-size: 11.5px; font-weight: 800;">🔴 실시간 멀티플레이어</span>
          </div>
          <h1 class="showcase-title" style="font-size: 26px; background: linear-gradient(135deg, #ffffff, #ffd700, #ff8800); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 2px 10px rgba(0,0,0,0.8)); margin: 2px 0;">
            🏴‍☠️ 원피스 게임
          </h1>
          <p class="showcase-subtitle" style="color: #cbd5e1; font-size: 12px; margin: 0;">
            모든 플레이어는 무능력자 모험가로 시작하며, 악마의 열매를 먹어야 전설의 스킬이 각성합니다!
          </p>
        </div>
      </div>

      <!-- Right Floating Character Creation Card -->
      <div class="showcase-right-panel" id="hero-detail-panel" style="animation: slideLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1); width: 340px;">
        <div class="showcase-profile-box" style="border-color: #38bdf8; box-shadow: 0 16px 40px rgba(0,0,0,0.7), 0 0 30px rgba(56, 189, 248, 0.3); padding: 16px;">
          <!-- Character Header -->
          <div class="showcase-hero-header" style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div class="showcase-profile-icon" style="border-color: #38bdf8; background: radial-gradient(circle, rgba(56, 189, 248, 0.25), transparent); color: #38bdf8; font-size: 28px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 2px solid;">
              ⚔️
            </div>
            <div style="flex: 1; overflow: hidden;">
              <div style="font-size: 11px; color: #38bdf8; font-weight: 800; text-transform: uppercase;">기본 캐릭터</div>
              <h2 class="showcase-hero-name" style="color: #ffffff; text-shadow: 0 0 10px #38bdf8; font-size: 18px; margin: 1px 0;">신입 모험가 (무능력자)</h2>
              <div class="showcase-hero-title" style="color: #94a3b8; font-size: 11px;">기본 물리 평타 3단 콤보 구사</div>
            </div>
          </div>

          <!-- Nickname Input -->
          <div style="margin: 10px 0; background: rgba(0,0,0,0.5); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 6px 10px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 12px; color: #ffd700; font-weight: bold; white-space: nowrap;">모험가명</span>
            <input type="text" id="input-hero-nickname" value="${this.playerName}" maxlength="12" style="flex: 1; background: transparent; border: none; color: #fff; font-size: 13px; font-weight: bold; outline: none;" />
            <button id="btn-dice-random" title="랜덤 닉네임" style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 12px; color: #fff;">🎲 랜덤</button>
          </div>

          <!-- Combat System Guide -->
          <div style="background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
            <div style="color: #f59e0b; font-size: 11px; font-weight: 800; margin-bottom: 4px;">👊 기본 공격 시스템</div>
            <div style="color: #e2e8f0; font-size: 11px; line-height: 1.4;">
              • <b>마우스 좌클릭</b> 또는 모바일 <b>[ATTACK]</b> 버튼으로 3단 물리 평타 콤보를 구사합니다.<br/>
              • 1타(베기) ➔ 2타(정권) ➔ 3타(돌려차기 크리티컬 넉백!)
            </div>
          </div>

          <!-- Devil Fruit Guide -->
          <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15)); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 10px; padding: 10px; margin-bottom: 14px;">
            <div style="color: #c084fc; font-size: 11px; font-weight: 800; margin-bottom: 4px;">🍇 악마의 열매 능력 각성</div>
            <div style="color: #f1f5f9; font-size: 11px; line-height: 1.4;">
              가방(<b>[I]</b>) 또는 세계를 탐험하며 악마의 열매를 먹으면 외형 변신과 함께 <b>4대 고유 전설 스킬([Q], [E], [R], [T])</b>이 각성합니다!
            </div>
          </div>

          <!-- Start Adventure Action Button -->
          <button class="btn-showcase-start" id="btn-hero-start" title="신세계 출항" style="width: 100%; background: linear-gradient(135deg, #e74c3c 0%, #d35400 50%, #f39c12 100%); box-shadow: 0 4px 20px rgba(231, 76, 60, 0.7); font-size: 15px; font-weight: 900; padding: 12px; border-radius: 12px; border: 2px solid rgba(255,255,255,0.4); color: #fff; cursor: pointer; transition: transform 0.1s;">
            🚀 신세계 출항 (GAME START)
          </button>
        </div>
      </div>
    `;

    this.parent.appendChild(this.root);
    this._bindEvents();
  }

  _bindEvents() {
    this.root.addEventListener('click', (e) => {
      if (e.target.id === 'btn-dice-random' || e.target.closest('#btn-dice-random')) {
        e.stopPropagation();
        const randName = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
        const input = this.root.querySelector('#input-hero-nickname');
        if (input) {
          input.value = randName;
          this.playerName = randName;
        }
      } else if (e.target.id === 'btn-hero-start' || e.target.closest('#btn-hero-start')) {
        e.stopPropagation();
        const input = this.root.querySelector('#input-hero-nickname');
        if (input && input.value.trim()) {
          this.playerName = input.value.trim();
        }
        this.confirmSelection();
      }
    });

    const input = this.root.querySelector('#input-hero-nickname');
    if (input) {
      input.addEventListener('input', (e) => {
        this.playerName = e.target.value;
      });
    }
  }

  selectHero(heroId) {
    this.selectedHeroId = 'adventurer';
  }

  show() {
    this.root.style.display = 'block';
    this.root.style.opacity = '1';
    this.root.style.pointerEvents = 'auto';
  }

  hide() {
    this.root.style.opacity = '0';
    this.root.style.pointerEvents = 'none';
    setTimeout(() => {
      this.root.style.display = 'none';
    }, 400);
  }

  confirmSelection() {
    this.hide();
    this.onSelectHero?.('adventurer', this.playerName);
  }
}

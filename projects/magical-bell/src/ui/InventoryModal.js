import { HEROES_DATA } from '../characters/ProceduralHeroFactory.js';

export class InventoryModal {
  constructor(parent = document.body, playerData, onHealPlayer) {
    this.parent = parent;
    this.playerData = playerData;
    this.onHealPlayer = onHealPlayer;
    this.isOpen = false;
    this.selectedItemIndex = -1;

    this._createDOM();
    this._bindEvents();

    this.playerData.onInventoryChanged = () => this.refresh();
    this.playerData.onStatsChanged = () => this.refresh();
  }

  _createDOM() {
    this.root = document.createElement('div');
    this.root.id = 'rpg-inventory-modal';
    this.root.className = 'rpg-inventory-modal';
    this.root.style.display = 'none';

    this.root.innerHTML = `
      <div class="rpg-modal-backdrop"></div>
      <div class="rpg-modal-window">
        <!-- Header -->
        <div class="rpg-modal-header">
          <h2 class="rpg-modal-title">🎒 캐릭터 정보 & 인벤토리</h2>
          <button class="btn-rpg-close" id="btn-inv-close">✕</button>
        </div>

        <div class="rpg-modal-body">
          <!-- Left: Character Stats & Equipment -->
          <div class="rpg-left-panel">
            <h3 class="rpg-section-title">🛡️ 장비 슬롯</h3>
            <div class="rpg-equip-slots" id="equip-slots-container">
              <!-- Populated dynamically -->
            </div>

            <h3 class="rpg-section-title" style="margin-top: 14px;">
              📊 캐릭터 스탯 
              <span class="stat-pts-badge" id="inv-stat-points">잔여 포인트: 0</span>
            </h3>
            <div class="rpg-stats-list" id="stats-list-container">
              <!-- Populated dynamically -->
            </div>
          </div>

          <!-- Right: Grid Inventory (24 slots) -->
          <div class="rpg-right-panel">
            <div class="rpg-inv-header">
              <h3 class="rpg-section-title">📦 가방 (보관함)</h3>
              <span class="rpg-gold-display">🪙 <b id="inv-gold-val">0</b> G</span>
            </div>

            <div class="rpg-grid-slots" id="inv-grid-container">
              <!-- Populated dynamically -->
            </div>

            <!-- Item Detail / Action Box -->
            <div class="rpg-item-detail" id="item-detail-box">
              <p class="empty-select-hint">아이템을 선택하여 상세 정보 및 장착/사용 옵션을 확인하세요.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.parent.appendChild(this.root);
  }

  _bindEvents() {
    this.root.querySelector('#btn-inv-close')?.addEventListener('click', () => this.hide());
    this.root.querySelector('.rpg-modal-backdrop')?.addEventListener('click', () => this.hide());

    // Stat allocation buttons
    this.root.addEventListener('click', (e) => {
      const btnStat = e.target.closest('.btn-add-stat');
      if (btnStat) {
        const statName = btnStat.dataset.stat;
        this.playerData.allocateStat(statName);
      }

      const invSlot = e.target.closest('.rpg-inv-slot');
      if (invSlot) {
        const idx = parseInt(invSlot.dataset.index, 10);
        this.selectItem(idx);
      }

      const equipSlot = e.target.closest('.rpg-equip-slot');
      if (equipSlot) {
        const slotType = equipSlot.dataset.slot;
        this.playerData.unequipItem(slotType);
      }

      const btnEquip = e.target.closest('#btn-action-equip');
      if (btnEquip) {
        this.playerData.equipItem(this.selectedItemIndex);
        this.selectedItemIndex = -1;
      }

      const btnUse = e.target.closest('#btn-action-use');
      if (btnUse) {
        this.playerData.useConsumable(this.selectedItemIndex, this.onHealPlayer);
        this.selectedItemIndex = -1;
      }

      const btnFruit = e.target.closest('#btn-action-fruit');
      if (btnFruit && this.selectedItemIndex >= 0) {
        const item = this.playerData.inventory[this.selectedItemIndex];
        if (item && item.type === 'fruit') {
          this.playerData.eatFruit(item.fruitId);
          this.selectedItemIndex = -1;
        }
      }

      const btnRemoveFruit = e.target.closest('#btn-action-remove-fruit');
      if (btnRemoveFruit && this.selectedItemIndex >= 0) {
        this.playerData.removeFruit();
        this.selectedItemIndex = -1;
      }
    });
  }

  selectItem(index) {
    this.selectedItemIndex = index;
    this.refresh();
  }

  refresh() {
    if (!this.isOpen) return;
    const p = this.playerData;
    const stats = p.getEffectiveStats();

    // 1. Update Gold & Stat points
    this.root.querySelector('#inv-gold-val').textContent = p.gold.toLocaleString();
    this.root.querySelector('#inv-stat-points').textContent = `잔여 포인트: ${p.statPoints}`;

    // 2. Render Equipment Slots
    const equipContainer = this.root.querySelector('#equip-slots-container');
    const slots = [
      { key: 'weapon', label: '무기', icon: '🪄' },
      { key: 'armor', label: '갑옷', icon: '🥋' },
      { key: 'ring', label: '반지', icon: '💍' },
      { key: 'relic', label: '유물', icon: '🔮' }
    ];

    equipContainer.innerHTML = slots.map(s => {
      const item = p.equipment[s.key];
      return `
        <div class="rpg-equip-slot ${item ? item.rarity : 'empty'}" data-slot="${s.key}">
          <div class="equip-slot-icon">${item ? item.icon : s.icon}</div>
          <div class="equip-slot-info">
            <div class="equip-slot-type">${s.label}</div>
            <div class="equip-slot-name">${item ? item.name : '(장착 없음)'}</div>
          </div>
          ${item ? '<span class="unequip-tag" title="클릭하여 해제">해제</span>' : ''}
        </div>
      `;
    }).join('');

    // 3. Render Stats List
    const statsContainer = this.root.querySelector('#stats-list-container');
    const statDefs = [
      { key: 'str', label: '힘 (STR)', val: stats.str, desc: '물리 공격력 및 근접 피해' },
      { key: 'int', label: '지능 (INT)', val: stats.int, desc: `주문 공격력 +${((stats.spellPowerMult - 1) * 100).toFixed(0)}%` },
      { key: 'vit', label: '체력 (VIT)', val: stats.vit, desc: `최대 체력 ${stats.maxHp}` },
      { key: 'agi', label: '민첩 (AGI)', val: stats.agi, desc: `이속 +${((stats.speedMult - 1) * 100).toFixed(0)}%, 쿨감` }
    ];

    statsContainer.innerHTML = statDefs.map(s => `
      <div class="stat-row">
        <div class="stat-meta">
          <span class="stat-label">${s.label}</span>
          <span class="stat-desc">${s.desc}</span>
        </div>
        <div class="stat-actions">
          <b class="stat-value">${s.val}</b>
          ${p.statPoints > 0 ? `<button class="btn-add-stat" data-stat="${s.key}">+</button>` : ''}
        </div>
      </div>
    `).join('');

    // 4. Render Grid Inventory (24 slots)
    const gridContainer = this.root.querySelector('#inv-grid-container');
    let gridHTML = '';
    for (let i = 0; i < p.inventoryMax; i++) {
      const item = p.inventory[i];
      const isSelected = this.selectedItemIndex === i;
      gridHTML += `
        <div class="rpg-inv-slot ${item ? item.rarity : 'empty'} ${isSelected ? 'selected' : ''}" data-index="${i}">
          ${item ? `
            <span class="inv-item-icon">${item.icon}</span>
            ${item.count > 1 ? `<span class="inv-item-count">${item.count}</span>` : ''}
          ` : ''}
        </div>
      `;
    }
    gridContainer.innerHTML = gridHTML;

    // 5. Render Selected Item Detail
    const detailBox = this.root.querySelector('#item-detail-box');
    const selectedItem = p.inventory[this.selectedItemIndex];
    if (selectedItem) {
      detailBox.innerHTML = `
        <div class="detail-header">
          <span class="detail-icon">${selectedItem.icon}</span>
          <div>
            <div class="detail-name ${selectedItem.rarity}">${selectedItem.name}</div>
            <div class="detail-type">${selectedItem.type.toUpperCase()} • ${selectedItem.rarity.toUpperCase()}</div>
          </div>
        </div>
        <p class="detail-desc">${selectedItem.desc}</p>
        <div class="detail-actions">
          ${selectedItem.type === 'consumable' ? `
            <button class="btn-item-action use" id="btn-action-use">🧪 물약 복용하기</button>
          ` : selectedItem.type === 'fruit' ? `
            <button class="btn-item-action fruit" id="btn-action-fruit" style="background: linear-gradient(135deg, #a855f7, #ec4899); border: none; color: #fff; font-weight: 900; box-shadow: 0 0 15px rgba(168, 85, 247, 0.5);">🍇 악마의 열매 복용 (능력 각성)</button>
          ` : selectedItem.type === 'fruit_remover' ? `
            <button class="btn-item-action fruit-remover" id="btn-action-remove-fruit" style="background: linear-gradient(135deg, #0ea5e9, #0284c7); border: none; color: #fff; font-weight: 900;">🌊 능력 정화 (무능력자로 환원)</button>
          ` : `
            <button class="btn-item-action equip" id="btn-action-equip">⚔️ 장착하기</button>
          `}
        </div>
      `;
    } else {
      detailBox.innerHTML = `<p class="empty-select-hint">아이템을 선택하여 상세 정보 및 장착/사용 옵션을 확인하세요.</p>`;
    }
  }

  show() {
    this.isOpen = true;
    this.root.style.display = 'flex';
    this.refresh();
  }

  hide() {
    this.isOpen = false;
    this.root.style.display = 'none';
  }

  toggle() {
    if (this.isOpen) this.hide();
    else this.show();
  }
}

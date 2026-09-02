export class NPCDialogModal {
  constructor(parent = document.body, { questManager, onQuestClaimed }) {
    this.parent = parent;
    this.questManager = questManager;
    this.onQuestClaimed = onQuestClaimed;
    this.isOpen = false;
    this.currentNPC = null;

    this._createDOM();
    this._bindEvents();
  }

  _createDOM() {
    this.root = document.createElement('div');
    this.root.id = 'npc-dialog-modal';
    this.root.className = 'npc-dialog-modal';
    this.root.style.display = 'none';

    this.root.innerHTML = `
      <div class="rpg-modal-backdrop"></div>
      <div class="npc-dialog-box">
        <div class="npc-dialog-header">
          <div class="npc-dialog-avatar" id="dialog-npc-icon">🧙‍♂️</div>
          <div class="npc-dialog-names">
            <h2 class="dialog-npc-name" id="dialog-npc-name">촌장 엘드린</h2>
            <span class="dialog-npc-title" id="dialog-npc-title">성소의 수호 장로</span>
          </div>
          <button class="btn-rpg-close" id="btn-dialog-close">✕</button>
        </div>

        <div class="npc-dialog-body">
          <p class="dialog-speech-text" id="dialog-speech-text">
            어서오게나, 젊은 용사여! 공허의 무리가 성소를 위협하고 있네.
          </p>

          <!-- Quest Offering / Complete Section -->
          <div class="dialog-quest-section" id="dialog-quest-section" style="display: none;">
            <div class="dialog-quest-badge">📜 관련 퀘스트</div>
            <h3 class="dialog-quest-title" id="dialog-quest-title"></h3>
            <p class="dialog-quest-desc" id="dialog-quest-desc"></p>
            <div class="dialog-quest-reward" id="dialog-quest-reward"></div>
          </div>
        </div>

        <div class="npc-dialog-footer" id="dialog-footer-actions">
          <button class="btn-dialog-action primary" id="btn-dialog-confirm">수락 / 완료</button>
          <button class="btn-dialog-action secondary" id="btn-dialog-leave">대화 종료</button>
        </div>
      </div>
    `;

    this.parent.appendChild(this.root);
  }

  _bindEvents() {
    this.root.querySelector('#btn-dialog-close')?.addEventListener('click', () => this.hide());
    this.root.querySelector('.rpg-modal-backdrop')?.addEventListener('click', () => this.hide());
    this.root.querySelector('#btn-dialog-leave')?.addEventListener('click', () => this.hide());
  }

  open(npcData) {
    this.currentNPC = npcData;
    this.isOpen = true;
    this.root.style.display = 'flex';

    this.root.querySelector('#dialog-npc-name').textContent = npcData.name;
    this.root.querySelector('#dialog-npc-title').textContent = npcData.title;

    // Trigger talk progress on QuestManager
    this.questManager.onTalkWithNPC(npcData.id);

    // Find quest related to this NPC
    const quest = this.questManager.quests.find(q => q.npcId === npcData.id && !q.isClaimed);

    const speechEl = this.root.querySelector('#dialog-speech-text');
    const questSection = this.root.querySelector('#dialog-quest-section');
    const confirmBtn = this.root.querySelector('#btn-dialog-confirm');

    if (quest) {
      questSection.style.display = 'block';
      this.root.querySelector('#dialog-quest-title').textContent = quest.title;
      this.root.querySelector('#dialog-quest-desc').textContent = quest.desc;
      
      let rewardText = `보상: 🌟 +${quest.rewardExp} EXP / 🪙 +${quest.rewardGold} G`;
      if (quest.rewardItem) {
        rewardText += ` / ${quest.rewardItem.icon} [${quest.rewardItem.name}]`;
      }
      this.root.querySelector('#dialog-quest-reward').textContent = rewardText;

      if (quest.isCompleted) {
        speechEl.textContent = npcData?.dialogs?.questComplete || '훌륭하네! 퀘스트를 완료했군.';
        confirmBtn.textContent = '🎁 퀘스트 보상 수령';
        confirmBtn.onclick = () => {
          this.questManager.claimReward(quest.id);
          this.onQuestClaimed?.();
          this.hide();
        };
      } else {
        speechEl.textContent = npcData?.dialogs?.questAvailable || '자네에게 부탁할 임무가 있네.';
        confirmBtn.textContent = '⚔️ 퀘스트 임무 진행';
        confirmBtn.onclick = () => {
          this.hide();
        };
      }
    } else {
      questSection.style.display = 'none';
      speechEl.textContent = npcData?.dialogs?.default || '반갑네, 젊은 용사여!';
      confirmBtn.textContent = '확인';
      confirmBtn.onclick = () => this.hide();
    }
  }

  hide() {
    this.isOpen = false;
    this.root.style.display = 'none';
  }
}

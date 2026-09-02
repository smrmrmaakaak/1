/**
 * RPG Quest System: handles main & sub-quests, progress tracking and completion rewards.
 */

export const QUEST_DATA = [
  {
    id: 'q_talk_elder',
    title: '[메인] 성소의 인도자',
    npcId: 'elder',
    type: 'talk',
    desc: '성소 중앙 마법진에 서 있는 촌장 엘드린을 찾아가 대화하세요.',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    rewardExp: 80,
    rewardGold: 100,
    rewardItem: null
  },
  {
    id: 'q_hunt_minions',
    title: '[토벌] 초원의 공허 미니언',
    npcId: 'blacksmith',
    type: 'hunt',
    targetType: 'minion',
    desc: '성소 남쪽 여명의 초원으로 나가 공허 미니언 5마리를 처치하세요.',
    targetCount: 5,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    rewardExp: 200,
    rewardGold: 150,
    rewardItem: {
      id: 'guardian_ring',
      name: '성소 수호자의 은반지',
      icon: '💍',
      type: 'ring',
      rarity: 'rare',
      desc: '주문력 +25, 쿨다운 감소 +5%',
      stats: { int: 8, agi: 4 }
    }
  },
  {
    id: 'q_hunt_pyros',
    title: '[토벌] 불타는 협곡의 파이로',
    npcId: 'mage_lia',
    type: 'hunt',
    targetType: 'pyro',
    desc: '동쪽 흑요석 협곡으로 진입하여 화염 파이로 3마리를 소탕하세요.',
    targetCount: 3,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    rewardExp: 450,
    rewardGold: 300,
    rewardItem: {
      id: 'flame_cloak',
      name: '용기의 불꽃 망토',
      icon: '🦹',
      type: 'armor',
      rarity: 'epic',
      desc: '최대 체력 +350, 공격력 +20',
      stats: { vit: 15, str: 10 }
    }
  },
  {
    id: 'q_boss_abyss',
    title: '[결전] 심연의 공허 군주 레이드',
    npcId: 'elder',
    type: 'hunt',
    targetType: 'boss',
    desc: '북쪽 심연의 제단에서 리젠되는 거대 공허의 군주를 토벌하세요!',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    rewardExp: 1200,
    rewardGold: 1000,
    rewardItem: {
      id: 'legendary_orb',
      name: '🌟 전설의 아케인 오브',
      icon: '🔮',
      type: 'relic',
      rarity: 'legendary',
      desc: '모든 스탯 +15, 모든 주문 공격력 +40%',
      stats: { str: 15, int: 15, vit: 15, agi: 15 }
    }
  }
];

export class QuestManager {
  constructor(playerData) {
    this.playerData = playerData;
    this.quests = JSON.parse(JSON.stringify(QUEST_DATA));
    this.activeQuestIndex = 0;
    this.onQuestUpdated = null;
  }

  getActiveQuest() {
    for (const q of this.quests) {
      if (!q.isClaimed) return q;
    }
    return null;
  }

  onEnemyKilled(enemyType) {
    let updated = false;
    for (const q of this.quests) {
      if (!q.isCompleted && q.type === 'hunt' && q.targetType === enemyType) {
        q.currentCount = Math.min(q.targetCount, q.currentCount + 1);
        if (q.currentCount >= q.targetCount) {
          q.isCompleted = true;
        }
        updated = true;
      }
    }
    if (updated) {
      this.onQuestUpdated?.();
    }
  }

  onTalkWithNPC(npcId) {
    let updated = false;
    for (const q of this.quests) {
      // Complete talk quest
      if (!q.isCompleted && q.type === 'talk' && q.npcId === npcId) {
        q.currentCount = 1;
        q.isCompleted = true;
        updated = true;
      }
    }
    if (updated) {
      this.onQuestUpdated?.();
    }
  }

  claimReward(questId) {
    const q = this.quests.find(item => item.id === questId);
    if (!q || !q.isCompleted || q.isClaimed) return false;

    q.isClaimed = true;
    if (q.rewardExp) this.playerData.addExp(q.rewardExp);
    if (q.rewardGold) this.playerData.gold += q.rewardGold;
    if (q.rewardItem) this.playerData.addItem(q.rewardItem);

    this.onQuestUpdated?.();
    return true;
  }
}

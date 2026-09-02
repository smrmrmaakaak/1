/**
 * Player RPG progression, stats, inventory and equipment manager.
 */
export class RPGPlayerData {
  constructor(heroId = 'adventurer') {
    this.heroId = heroId;
    this.level = 1;
    this.exp = 0;
    this.maxExp = 100;
    this.gold = 150;
    this.hp = 1290;

    // Base Stat Attributes
    this.baseStats = {
      str: 10, // Physical & Attack Power
      int: 12, // Magic Spell Power & Mana
      vit: 14, // Max Health & Health Regen
      agi: 10  // Move Speed, Dash Cooldown, Attack Speed
    };

    this.allocatedStats = {
      str: 0,
      int: 0,
      vit: 0,
      agi: 0
    };

    this.statPoints = 5; // Initial bonus points

    this.currentFruit = null; // null = Normal Human (무능력자)

    // Inventory & Equipment
    this.inventoryMax = 24;
    this.inventory = [
      {
        id: 'fruit_dark',
        name: '어둠어둠 열매',
        icon: '🍇',
        type: 'fruit',
        fruitId: 'fruit_dark',
        rarity: 'mythic',
        desc: '복용 시 어둠어둠 열매(사황 검은수염) 능력이 각성합니다. [Q] 암수, [E] 해방, [R] 흑염 침식, [T] 45m 결계 룸 『흑암 성역』 스킬이 개방됩니다.',
        count: 1
      },
      {
        id: 'fruit_fire',
        name: '이글이글 열매',
        icon: '🔥',
        type: 'fruit',
        fruitId: 'fruit_fire',
        rarity: 'legendary',
        desc: '복용 시 이글이글 열매(에이스) 능력이 각성합니다. [Q] 불주먹 화권, [E] 십자화, [R] 화주, [T] 대염계 염제 스킬이 개방됩니다.',
        count: 1
      },
      {
        id: 'fruit_ice',
        name: '빙빙 열매',
        icon: '🧊',
        type: 'fruit',
        fruitId: 'fruit_ice',
        rarity: 'legendary',
        desc: '복용 시 빙빙 열매(아오키지) 능력이 각성합니다. [Q] 아이스 세이버, [E] 아이스 에이지, [R] 눈보라, [T] 눈사태 스킬이 개방됩니다.',
        count: 1
      },
      {
        id: 'fruit_lightning',
        name: '쿠릉쿠릉 열매',
        icon: '⚡',
        type: 'fruit',
        fruitId: 'fruit_lightning',
        rarity: 'legendary',
        desc: '복용 시 쿠릉쿠릉 열매(에넬) 능력이 각성합니다. [Q] 낙뢰, [E] 뇌수 결속, [R] 연쇄 뇌격, [T] 2억 볼트 신의 심판 스킬이 개방됩니다.',
        count: 1
      },
      {
        id: 'fruit_extract_water',
        name: '바다의 성수 (능력 추출제)',
        icon: '🌊',
        type: 'fruit_remover',
        rarity: 'rare',
        desc: '사용 시 몸 안에 깃든 악마의 열매 능력을 정화하여 무능력자(기본 모험가) 상태로 되돌립니다.',
        count: 3
      },
      {
        id: 'hp_potion_1',
        name: '하급 생명력 물약',
        icon: '🧪',
        type: 'consumable',
        rarity: 'common',
        desc: '사용 시 HP 300을 즉시 회복합니다.',
        count: 5,
        heal: 300
      },
      {
        id: 'starter_ring',
        name: '성소 수습생의 반지',
        icon: '💍',
        type: 'ring',
        rarity: 'rare',
        desc: '주문력 +15, 최대 마나 +50',
        stats: { int: 5, vit: 3 }
      }
    ];

    this.equipment = {
      weapon: {
        id: 'novice_staff',
        name: '견습 마법사의 지팡이',
        icon: '🪄',
        type: 'weapon',
        rarity: 'common',
        desc: '주문 공격력 +20',
        stats: { int: 8, str: 2 }
      },
      armor: {
        id: 'linen_robe',
        name: '수련자의 린넨 로브',
        icon: '🥋',
        type: 'armor',
        rarity: 'common',
        desc: '최대 체력 +150',
        stats: { vit: 8 }
      },
      ring: null,
      relic: null
    };

    this.onLevelUp = null;
    this.onStatsChanged = null;
    this.onInventoryChanged = null;
    this.onFruitChanged = null;
  }

  eatFruit(fruitId) {
    this.currentFruit = fruitId;
    this.onFruitChanged?.(fruitId);
    this.onStatsChanged?.();
    return true;
  }

  removeFruit() {
    this.currentFruit = null;
    this.onFruitChanged?.(null);
    this.onStatsChanged?.();
    return true;
  }

  addExp(amount) {
    this.exp += amount;
    let leveledUp = false;

    while (this.exp >= this.maxExp) {
      this.exp -= this.maxExp;
      this.level++;
      this.maxExp = Math.floor(this.maxExp * 1.45 + 50);
      this.statPoints += 3;
      leveledUp = true;
    }

    if (leveledUp) {
      this.onLevelUp?.(this.level);
    }
    this.onStatsChanged?.();
    return leveledUp;
  }

  allocateStat(statName) {
    if (this.statPoints <= 0) return false;
    if (this.allocatedStats[statName] === undefined) return false;

    this.allocatedStats[statName]++;
    this.statPoints--;
    this.onStatsChanged?.();
    return true;
  }

  getEffectiveStats() {
    const total = {
      str: this.baseStats.str + this.allocatedStats.str,
      int: this.baseStats.int + this.allocatedStats.int,
      vit: this.baseStats.vit + this.allocatedStats.vit,
      agi: this.baseStats.agi + this.allocatedStats.agi
    };

    // Add equipped gear stats
    for (const item of Object.values(this.equipment)) {
      if (item && item.stats) {
        for (const [k, v] of Object.entries(item.stats)) {
          if (total[k] !== undefined) total[k] += v;
        }
      }
    }

    // Derived battle stats
    const maxHp = 800 + total.vit * 35;
    const spellPowerMult = 1.0 + (total.int * 0.035);
    const speedMult = 1.0 + (total.agi * 0.015);
    const cooldownMult = Math.max(0.4, 1.0 - (total.agi * 0.012));

    return {
      ...total,
      maxHp,
      spellPowerMult,
      speedMult,
      cooldownMult
    };
  }

  equipItem(itemIndex) {
    const item = this.inventory[itemIndex];
    if (!item) return false;

    const slot = item.type;
    if (!this.equipment.hasOwnProperty(slot)) return false;

    const previousEquipped = this.equipment[slot];
    this.equipment[slot] = item;
    this.inventory.splice(itemIndex, 1);

    if (previousEquipped) {
      this.inventory.push(previousEquipped);
    }

    this.onInventoryChanged?.();
    this.onStatsChanged?.();
    return true;
  }

  unequipItem(slot) {
    const item = this.equipment[slot];
    if (!item || this.inventory.length >= this.inventoryMax) return false;

    this.equipment[slot] = null;
    this.inventory.push(item);

    this.onInventoryChanged?.();
    this.onStatsChanged?.();
    return true;
  }

  useConsumable(itemIndex, onHeal) {
    const item = this.inventory[itemIndex];
    if (!item || item.type !== 'consumable') return false;

    if (item.heal) {
      onHeal?.(item.heal);
    }

    item.count = (item.count || 1) - 1;
    if (item.count <= 0) {
      this.inventory.splice(itemIndex, 1);
    }

    this.onInventoryChanged?.();
    return true;
  }

  addItem(newItem) {
    if (this.inventory.length >= this.inventoryMax) return false;
    
    // Stack consumables
    if (newItem.type === 'consumable') {
      const existing = this.inventory.find(i => i.id === newItem.id);
      if (existing) {
        existing.count = (existing.count || 1) + (newItem.count || 1);
        this.onInventoryChanged?.();
        return true;
      }
    }

    this.inventory.push(newItem);
    this.onInventoryChanged?.();
    return true;
  }
}

/**
 * Open-world Zone System: tracks player zone transitions, safety, and level recommendations.
 * Scaled for 75,000m (75km) Colossal Open World Continent Scale
 */

export const WORLD_ZONES = {
  VILLAGE: {
    id: 'village',
    name: '성소 제국 대수도 (Sanctuary Imperial Haven)',
    sub: '평화로운 안전 구역 — 황실 대성당 & NPC 정비 광장',
    levelReq: '안전 구역 (중앙 광장 반경 95m)',
    isSafe: true,
    color: '#38bdf8'
  },
  DAWN_FIELDS: {
    id: 'dawn_fields',
    name: '여명의 대평원 (Dawn Continental Plains)',
    sub: 'Lv.1 ~ Lv.15 광활한 대륙 초원 사냥터 (공허 미니언 군락)',
    levelReq: 'Lv. 1+ (남쪽 초원 사냥터)',
    isSafe: false,
    color: '#4ade80'
  },
  OBSIDIAN_CANYON: {
    id: 'obsidian_canyon',
    name: '흑요석 용암 대산맥 (Obsidian Volcano Range)',
    sub: 'Lv.15 ~ Lv.30 정예 화산 사냥터 (화염 파이로 / 브루트 골렘)',
    levelReq: 'Lv. 15+ (동/서 화산 협곡)',
    isSafe: false,
    color: '#fb923c'
  },
  ABYSS_LAIR: {
    id: 'abyss_lair',
    name: '심연의 차원 성역 (Abyss Void Realm)',
    sub: 'Lv.30+ 거대 레이드 던전 (공허의 절대 군주 서식지)',
    levelReq: 'Lv. 30+ (북쪽 심연 차원문)',
    isSafe: false,
    color: '#e879f9'
  }
};

export class WorldZoneManager {
  constructor(onZoneChanged) {
    this.currentZone = WORLD_ZONES.VILLAGE;
    this.onZoneChanged = onZoneChanged;
  }

  getZoneAt(playerPos) {
    const x = playerPos.x;
    const z = playerPos.z;
    const distFromCenter = Math.sqrt(x * x + z * z);

    // 1. Sanctuary Imperial Capital: Central Safe Plaza (Radius 95m)
    if (distFromCenter <= 95.0) {
      return WORLD_ZONES.VILLAGE;
    } 
    // 2. Abyssal Void Realm: North of Z: -160m
    else if (z < -160.0) {
      return WORLD_ZONES.ABYSS_LAIR;
    } 
    // 3. Obsidian Volcano Canyon: East / West of |X|: 180m
    else if (Math.abs(x) > 180.0) {
      return WORLD_ZONES.OBSIDIAN_CANYON;
    } 
    // 4. Dawn Continental Plains: Southern and surrounding meadows (Z > 95m)
    else {
      return WORLD_ZONES.DAWN_FIELDS;
    }
  }

  update(playerPos) {
    const newZone = this.getZoneAt(playerPos);
    if (newZone.id !== this.currentZone.id) {
      this.currentZone = newZone;
      if (this.onZoneChanged) {
        this.onZoneChanged(this.currentZone);
      }
    }
  }
}

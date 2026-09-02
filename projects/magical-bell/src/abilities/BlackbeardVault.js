/**
 * Blackbeard Swallow Vault (검은수염 어둠 속 포획 저장소)
 * - [E] 블랙홀(Black Hole)로 바닥 속에 삼켜버린 모든 적/허수아비/지형 잔해를 기억
 * - [R] 해방(Liberation) 시 삼켜졌던 개체들을 하늘 높이 토해내며 전방 융단폭격으로 발사
 */
export class BlackbeardVault {
  static swallowed = [];

  static recordSwallowed(entity) {
    this.swallowed.push({
      id: entity.id || Math.random().toString(36),
      name: entity.name || '훈련용 허수아비',
      isDummy: !!entity.mesh,
      originalPos: entity.position ? entity.position.clone() : null,
      entity: entity
    });
  }

  static popAll() {
    const list = [...this.swallowed];
    this.swallowed = [];
    return list;
  }

  static get count() {
    return this.swallowed.length;
  }

  static clear() {
    this.swallowed = [];
  }
}

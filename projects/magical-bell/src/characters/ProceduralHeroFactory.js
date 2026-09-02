import {
  Group,
  Mesh,
  MeshStandardMaterial,
  BoxGeometry,
  CylinderGeometry,
  ConeGeometry,
  TorusGeometry,
  SphereGeometry,
  OctahedronGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  Vector3,
  Color,
  DoubleSide
} from 'three';
export const HERO_GLB_MAP = {
  arthur: './models/Mage.glb',
  raiden: './models/Paladin.glb',
  akainu: './models/Knight.glb',
  ignis: './models/Knight.glb',
  ace: './models/Rogue.glb',
  lumina: './models/Ranger.glb',
  tesla: './models/Rogue_Hooded.glb',
  boreas: './models/Barbarian.glb',
  sera: './models/Skeleton_Warrior.glb',
  adventurer: './models/Knight.glb'
};

export const HEROES_DATA = {
  arthur: {
    id: 'arthur',
    name: '아오키지 (Aokiji)',
    title: '얼음 해군 대장 (쿠잔)',
    attribute: 'ice',
    attributeName: '❄️ 얼음 속성',
    attributeLabel: 'ICE',
    element: 'frost',
    elementName: '❄️ 얼음 속성 (빙빙 열매)',
    skills: ['ice', 'glacier', 'blizzard', 'avalanche'],
    defaultSkill: 'ice',
    icon: '❄️',
    color: '#38bdf8',
    passive: '얼음 결빙 지속시간 +30%, 쇄빙 폭발 치명타 +120%',
    desc: '빙빙 열매의 능력을 구사하는 전 해군 대장. 얼음 송곳창(아이스 세이버)과 거대 빙하, 눈보라를 일으켜 전장의 모든 적을 얼어붙게 만듭니다.'
  },
  raiden: {
    id: 'raiden',
    name: '에넬 (Enel)',
    title: '번개 신 (스카이피아)',
    attribute: 'lightning',
    attributeName: '⚡ 번개 속성',
    attributeLabel: 'LIGHTNING',
    element: 'thunder',
    elementName: '⚡ 번개 속성 (쿠릉쿠릉 열매)',
    skills: ['thunder', 'snare', 'chain_lightning', 'thunder_judgment'],
    defaultSkill: 'thunder',
    icon: '⚡',
    color: '#fbbf24',
    passive: '이동속도 +15%, 2억 볼트 감전 뇌격 피해 +25%',
    desc: '쿠릉쿠릉 열매의 능력을 구사하는 자칭 유일신. 수억 볼트의 번개 낙뢰와 신의 심판 뇌격으로 전장의 적들을 순식간에 감전시킵니다.'
  },
  akainu: {
    id: 'akainu',
    name: '아카이누 (Akainu)',
    title: '해군 원수 (사카즈키)',
    attribute: 'magma',
    attributeName: '🌋 마그마 속성',
    attributeLabel: 'MAGMA',
    element: 'magma',
    elementName: '🌋 마그마 속성 (마그마그 열매)',
    skills: ['fire_blast', 'meteor', 'hellfire', 'inferno'],
    defaultSkill: 'fire_blast',
    icon: '🌋',
    color: '#ef4444',
    passive: '마그마 연소 지속 피해 +50%, 화산 폭발 치명타 +30%',
    desc: '철저한 정의를 관철하는 해군 원수. 지면을 뒤덮는 3D 끓는 용암 호수와 유성 화산 폭격으로 전장의 모든 악을 녹여버립니다.'
  },
  ace: {
    id: 'ace',
    name: '에이스 (Ace)',
    title: '불꽃의 계승자 (골 D. 에이스)',
    attribute: 'fire',
    attributeName: '🔥 불 속성',
    attributeLabel: 'FIRE',
    element: 'fire',
    elementName: '🔥 불 속성 (이글이글 열매)',
    skills: ['fire_fist', 'cross_fire', 'fire_pillar', 'dai_entei'],
    defaultSkill: 'fire_fist',
    icon: '🔥',
    color: '#f97316',
    passive: '화염 스킬 쿨다운 -15%, 화염 피해 +35%',
    desc: '이글이글 불꽃의 힘을 자유자재로 다루는 불꽃의 전사. 전방을 일도양단하는 거대한 불주먹과 십자화, 불기둥과 태양빛 대염계 염제로 전장을 불태웁니다.'
  },
  lumina: {
    id: 'lumina',
    name: '키자루 (Kizaru)',
    title: '빛 해군 대장 (볼사리노)',
    attribute: 'light',
    attributeName: '✨ 빛 속성',
    attributeLabel: 'LIGHT',
    element: 'arcane',
    elementName: '✨ 빛 속성 (번쩍번쩍 열매)',
    skills: ['beam', 'holy_cross', 'sanctuary_dome', 'divine_judgment'],
    defaultSkill: 'beam',
    icon: '🌟',
    color: '#fde047',
    passive: '빛의 속도 레이저 피해 +40%, 마력 회복 +20%',
    desc: '번쩍번쩍 열매의 능력을 구사하는 해군 대장. 초고출력 섬광 빔과 야사카니의 굽은 구슬 광탄으로 적을 일격에 관통합니다.'
  },
  tesla: {
    id: 'tesla',
    name: '드래곤 (Dragon)',
    title: '혁명군 총사령관 (몽키 D. 드래곤)',
    attribute: 'wind',
    attributeName: '🌪️ 바람 속성',
    attributeLabel: 'WIND',
    element: 'wind',
    elementName: '🌪️ 바람 속성 (폭풍우)',
    skills: ['wind_blade', 'cyclone_burst', 'tornado_vortex', 'tempest_catastrophe'],
    defaultSkill: 'wind_blade',
    icon: '🌪️',
    color: '#34d399',
    passive: '돌풍 넉백 범위 +50%, 공격 속도 +20%',
    desc: '세계 최악의 범죄자이자 혁명군 총사령관. 거대한 폭풍우와 진공 칼바람, 토네이도 소용돌이로 전장을 휩쓸어버립니다.'
  },
  boreas: {
    id: 'boreas',
    name: '흰수염 (Whitebeard)',
    title: '세계 최강의 사황 (에드워드 뉴게이트)',
    attribute: 'earth',
    attributeName: '🌍 대지/진동 속성',
    attributeLabel: 'EARTH',
    element: 'earth',
    elementName: '🌍 대지 속성 (흔들흔들 열매)',
    skills: ['earth_spike', 'stone_rampart', 'earthquake', 'gigantic_megalith'],
    defaultSkill: 'earth_spike',
    icon: '🌍',
    color: '#a3e635',
    passive: '최대 체력 +600, 지진 충격파 공격력 +40%',
    desc: '대기를 부수고 지진을 일으키는 세계 최강의 사황. 흔들리지 않는 대지와 진동 충격파로 전장을 초토화합니다.'
  },
  sera: {
    id: 'sera',
    name: '검은수염 (Blackbeard)',
    title: '어둠의 사황 (마샬 D. 티치)',
    attribute: 'dark',
    attributeName: '🌑 어둠 속성',
    attributeLabel: 'DARK',
    element: 'abyss',
    elementName: '🌑 어둠 속성 (어둠어둠 열매)',
    skills: ['void_orb', 'shadow_grasp', 'void_singularity', 'abyss_eruption'],
    defaultSkill: 'void_orb',
    icon: '🌑',
    color: '#a855f7',
    passive: '암흑 인력으로 적 견인, 45m 결계 룸 봉인',
    desc: '사황 검은수염 티치. 모든 악마의 열매 능력을 무력화시키는 어둠어둠 열매와 거대한 45m 암흑 결계 룸을 다룹니다.'
  },
  adventurer: {
    id: 'adventurer',
    name: '모험가 (Adventurer)',
    title: '신입 모험가 (무능력자)',
    attribute: 'none',
    attributeName: '⚔️ 물리 평타',
    attributeLabel: 'PHYSICAL',
    element: 'physical',
    elementName: '⚔️ 물리 공격 (무능력자)',
    skills: [],
    defaultSkill: 'basic_attack',
    icon: '⚔️',
    color: '#94a3b8',
    passive: '물리 평타 3단 콤보 공격 속도 +15%, 이동속도 +10%',
    desc: '아직 악마의 열매를 먹지 않은 신입 모험가입니다. 마우스 좌클릭 및 [ATTACK] 버튼으로 3단 물리 타격 평타를 구사하며, 악마의 열매를 복용하면 초인적인 원소 스킬이 개방됩니다.'
  }
};

export const BASE_ADVENTURER = HEROES_DATA.adventurer;

export const DEVIL_FRUITS = {
  fruit_dark: {
    id: 'fruit_dark',
    heroId: 'sera',
    name: '어둠어둠 열매',
    nameEn: 'Dark-Dark Fruit (Yami Yami no Mi)',
    user: '사황 검은수염 (마샬 D. 티치)',
    icon: '🍇',
    color: '#a855f7',
    attributeName: '🌑 어둠 속성',
    element: 'abyss',
    skills: ['void_orb', 'shadow_grasp', 'void_singularity', 'abyss_eruption'],
    desc: '복용 시 어둠어둠 열매의 능력이 각성합니다. [Q] 암수(블랙홀), [E] 해방, [R] 흑염 침식, [T] 45m 결계 룸 『흑암 성역』 스킬을 구사할 수 있게 됩니다.'
  },
  fruit_ice: {
    id: 'fruit_ice',
    heroId: 'arthur',
    name: '빙빙 열매',
    nameEn: 'Ice-Ice Fruit (Hie Hie no Mi)',
    user: '전 해군 대장 아오키지 (쿠잔)',
    icon: '🧊',
    color: '#38bdf8',
    attributeName: '❄️ 얼음 속성',
    element: 'frost',
    skills: ['ice', 'glacier', 'blizzard', 'avalanche'],
    desc: '복용 시 빙빙 열매의 능력이 각성합니다. [Q] 아이스 세이버, [E] 아이스 에이지(빙하), [R] 눈보라, [T] 눈사태 빙산 붕괴를 구사할 수 있게 됩니다.'
  },
  fruit_lightning: {
    id: 'fruit_lightning',
    heroId: 'raiden',
    name: '쿠릉쿠릉 열매',
    nameEn: 'Rumble-Rumble Fruit (Goro Goro no Mi)',
    user: '번개의 신 에넬',
    icon: '⚡',
    color: '#fbbf24',
    attributeName: '⚡ 번개 속성',
    element: 'thunder',
    skills: ['thunder', 'snare', 'chain_lightning', 'thunder_judgment'],
    desc: '복용 시 쿠릉쿠릉 열매의 능력이 각성합니다. [Q] 번개 낙뢰, [E] 뇌수 결속, [R] 연쇄 뇌격, [T] 신의 심판(2억 볼트)을 구사할 수 있게 됩니다.'
  },
  fruit_fire: {
    id: 'fruit_fire',
    heroId: 'ace',
    name: '이글이글 열매',
    nameEn: 'Flame-Flame Fruit (Mera Mera no Mi)',
    user: '불꽃의 골 D. 에이스',
    icon: '🔥',
    color: '#f97316',
    attributeName: '🔥 불 속성',
    element: 'fire',
    skills: ['fire_fist', 'cross_fire', 'fire_pillar', 'dai_entei'],
    desc: '복용 시 이글이글 열매의 능력이 각성합니다. [Q] 화권(불주먹), [E] 십자화, [R] 화주(불기둥), [T] 대염계 염제를 구사할 수 있게 됩니다.'
  },
  fruit_magma: {
    id: 'fruit_magma',
    heroId: 'akainu',
    name: '마그마그 열매',
    nameEn: 'Mag-Mag Fruit (Magu Magu no Mi)',
    user: '해군 원수 아카이누 (사카즈키)',
    icon: '🌋',
    color: '#ef4444',
    attributeName: '🌋 마그마 속성',
    element: 'magma',
    skills: ['fire_blast', 'meteor', 'hellfire', 'inferno'],
    desc: '복용 시 마그마그 열매의 능력이 각성합니다. [Q] 명구, [E] 유성화산 폭격, [R] 연옥 업화, [T] 지옥 마그마 대분화를 구사할 수 있게 됩니다.'
  },
  fruit_light: {
    id: 'fruit_light',
    heroId: 'lumina',
    name: '번쩍번쩍 열매',
    nameEn: 'Glint-Glint Fruit (Pika Pika no Mi)',
    user: '해군 대장 키자루 (볼사리노)',
    icon: '✨',
    color: '#fde047',
    attributeName: '✨ 빛 속성',
    element: 'arcane',
    skills: ['beam', 'holy_cross', 'sanctuary_dome', 'divine_judgment'],
    desc: '복용 시 번쩍번쩍 열매의 능력이 각성합니다. [Q] 광선 빔, [E] 팔지경, [R] 야사카니의 곡옥, [T] 천총운검 광선폭풍을 구사할 수 있게 됩니다.'
  },
  fruit_wind: {
    id: 'fruit_wind',
    heroId: 'tesla',
    name: '폭풍폭풍 열매',
    nameEn: 'Storm-Storm Fruit',
    user: '혁명군 총사령관 드래곤',
    icon: '🌪️',
    color: '#34d399',
    attributeName: '🌪️ 바람 속성',
    element: 'wind',
    skills: ['wind_blade', 'cyclone_burst', 'tornado_vortex', 'tempest_catastrophe'],
    desc: '복용 시 폭풍폭풍 열매의 능력이 각성합니다. [Q] 진공 절단파, [E] 돌풍 폭발, [R] 회오리 소용돌이, [T] 천지개벽 태풍을 구사할 수 있게 됩니다.'
  },
  fruit_quake: {
    id: 'fruit_quake',
    heroId: 'boreas',
    name: '흔들흔들 열매',
    nameEn: 'Tremor-Tremor Fruit (Gura Gura no Mi)',
    user: '사황 흰수염 (에드워드 뉴게이트)',
    icon: '💥',
    color: '#a3e635',
    attributeName: '🌍 진동/대지 속성',
    element: 'earth',
    skills: ['earth_spike', 'stone_rampart', 'earthquake', 'gigantic_megalith'],
    desc: '복용 시 흔들흔들 열매의 능력이 각성합니다. [Q] 대기 파쇄권, [E] 지각 단층 붕괴, [R] 해일 지진파, [T] 천지 분쇄 대충격을 구사할 수 있게 됩니다.'
  }
};

HEROES_DATA.adventurer = BASE_ADVENTURER;

/**
 * Procedural 3D Hero Generator with 7 Unique Elemental Heroes.
 */
export class ProceduralHeroFactory {
  static createHero(heroId) {
    const root = new Group();
    root.name = `Hero_${heroId}`;

    if (_heroGlbCache.has(heroId)) {
      const glbClone = _heroGlbCache.get(heroId).clone();
      glbClone.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      root.add(glbClone);
      return root;
    }

    // If not yet cached, load asynchronously and append
    const url = HERO_GLB_MAP[heroId] || HERO_GLB_MAP.arthur;
    _gltfLoader.load(url, (gltf) => {
      _heroGlbCache.set(heroId, gltf.scene);
      const glbClone = gltf.scene.clone();
      glbClone.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      // Clear procedural fallback and attach AAA Model
      while (root.children.length > 0) {
        root.remove(root.children[0]);
      }
      root.add(glbClone);
    });

    // Instant procedural fallback during first ms load
    let fallback;
    switch (heroId) {
      case 'arthur': fallback = this.createArthur(); break;
      case 'raiden': fallback = this.createRaiden(); break;
      case 'ignis': fallback = this.createIgnis(); break;
      case 'lumina': fallback = this.createLumina(); break;
      case 'tesla': fallback = this.createTesla(); break;
      case 'boreas': fallback = this.createBoreas(); break;
      case 'sera': fallback = this.createSera(); break;
      default: fallback = this.createArthur(); break;
    }
    root.add(fallback);
    return root;
  }

  /* ------------------------------------------------------------------ */
  /* 1. ARTHUR - FROST SORCERER (얼음 마법사)                            */
  /* ------------------------------------------------------------------ */
  static createArthur() {
    const root = new Group();
    root.name = 'Hero_Arthur';

    const matRobe = new MeshStandardMaterial({ color: 0x0f2b48, roughness: 0.4, metalness: 0.3 });
    const matFrostCyan = new MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.2, roughness: 0.1 });
    const matSilver = new MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 });
    const matSkin = new MeshStandardMaterial({ color: 0xffdfba, roughness: 0.6 });

    const hips = new Group();
    hips.position.y = 1.0;
    root.add(hips);

    // Pelvis & Lower Robe
    const pelvis = new Mesh(new BoxGeometry(0.48, 0.35, 0.35), matRobe);
    const robeSkirt = new Mesh(new CylinderGeometry(0.24, 0.42, 0.65, 8), matRobe);
    robeSkirt.position.y = -0.35;
    hips.add(pelvis, robeSkirt);

    // Spine & Chest
    const spine = new Group();
    spine.position.y = 0.25;
    hips.add(spine);

    const chest = new Mesh(new BoxGeometry(0.55, 0.5, 0.38), matRobe);
    chest.position.y = 0.25;
    const frostChestCore = new Mesh(new OctahedronGeometry(0.14), matFrostCyan);
    frostChestCore.position.set(0, 0.28, 0.21);
    spine.add(chest, frostChestCore);

    // Head & Wizard Hat
    const head = new Group();
    head.position.y = 0.6;
    spine.add(head);

    const face = new Mesh(new BoxGeometry(0.25, 0.25, 0.25), matSkin);
    face.position.y = 0.12;

    const hatBrim = new Mesh(new CylinderGeometry(0.45, 0.45, 0.04, 12), matRobe);
    hatBrim.position.y = 0.25;
    const hatCone = new Mesh(new ConeGeometry(0.28, 0.55, 8), matRobe);
    hatCone.position.set(0, 0.52, -0.05);
    hatCone.rotation.x = -0.15;
    const hatGem = new Mesh(new OctahedronGeometry(0.08), matFrostCyan);
    hatGem.position.set(0, 0.32, 0.28);
    head.add(face, hatBrim, hatCone, hatGem);

    // Left Arm
    const leftArm = new Group();
    leftArm.position.set(-0.42, 0.4, 0);
    spine.add(leftArm);
    const pauldronL = new Mesh(new DodecahedronGeometry(0.18), matFrostCyan);
    const sleeveL = new Mesh(new CylinderGeometry(0.09, 0.14, 0.6, 6), matRobe);
    sleeveL.position.y = -0.3;
    leftArm.add(pauldronL, sleeveL);

    // Right Arm & Staff
    const rightArm = new Group();
    rightArm.position.set(0.42, 0.4, 0);
    spine.add(rightArm);
    const pauldronR = new Mesh(new DodecahedronGeometry(0.18), matFrostCyan);
    const sleeveR = new Mesh(new CylinderGeometry(0.09, 0.14, 0.6, 6), matRobe);
    sleeveR.position.y = -0.3;
    rightArm.add(pauldronR, sleeveR);

    // Frost Staff
    const staff = new Group();
    staff.position.set(0.1, -0.2, 0.2);
    staff.rotation.x = Math.PI / 4;
    rightArm.add(staff);
    const staffHandle = new Mesh(new CylinderGeometry(0.03, 0.03, 1.6, 6), matSilver);
    staffHandle.position.y = 0.5;
    const staffHead = new Mesh(new TorusGeometry(0.18, 0.03, 6, 12), matSilver);
    staffHead.position.y = 1.35;
    const staffOrb = new Mesh(new IcosahedronGeometry(0.12), matFrostCyan);
    staffOrb.position.y = 1.35;
    staff.add(staffHandle, staffHead, staffOrb);

    // Legs
    const leftLeg = new Group(); leftLeg.position.set(-0.18, -0.1, 0); hips.add(leftLeg);
    const bootL = new Mesh(new BoxGeometry(0.18, 0.65, 0.26), matRobe); bootL.position.y = -0.35; leftLeg.add(bootL);

    const rightLeg = new Group(); rightLeg.position.set(0.18, -0.1, 0); hips.add(rightLeg);
    const bootR = new Mesh(new BoxGeometry(0.18, 0.65, 0.26), matRobe); bootR.position.y = -0.35; rightLeg.add(bootR);

    let animTime = 0;
    const update = (dt, isMoving, walkCycle) => {
      animTime += dt;
      frostChestCore.rotation.y += dt * 2.0;
      staffOrb.rotation.x += dt * 2.5;
      staffOrb.rotation.y += dt * 1.8;
      matFrostCyan.emissiveIntensity = 2.0 + Math.sin(animTime * 4.0) * 0.8;

      if (isMoving) {
        const swing = Math.sin(walkCycle);
        leftLeg.rotation.x = swing * 0.6;
        rightLeg.rotation.x = -swing * 0.6;
        leftArm.rotation.x = -swing * 0.45;
        rightArm.rotation.x = swing * 0.25;
        hips.position.y = 1.0 + Math.abs(Math.sin(walkCycle * 2)) * 0.06;
      } else {
        const breath = Math.sin(animTime * 2.2);
        spine.position.y = 0.25 + breath * 0.02;
        leftLeg.rotation.x = 0; rightLeg.rotation.x = 0;
        leftArm.rotation.x = breath * 0.04; rightArm.rotation.x = -breath * 0.03;
        hips.position.y = 1.0;
      }
    };

    return { root, update };
  }

  /* ------------------------------------------------------------------ */
  /* 2. RAIDEN - STORM WALKER (번개 암살자)                              */
  /* ------------------------------------------------------------------ */
  static createRaiden() {
    const root = new Group();
    root.name = 'Hero_Raiden';

    const matSuit = new MeshStandardMaterial({ color: 0x090d16, roughness: 0.3, metalness: 0.7 });
    const matStormGold = new MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 2.8, roughness: 0.1 });
    const matArmorDark = new MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.9 });

    const hips = new Group();
    hips.position.y = 1.0;
    root.add(hips);

    const pelvis = new Mesh(new BoxGeometry(0.46, 0.32, 0.32), matSuit);
    const belt = new Mesh(new BoxGeometry(0.5, 0.1, 0.36), matStormGold);
    hips.add(pelvis, belt);

    const spine = new Group();
    spine.position.y = 0.22;
    hips.add(spine);

    const chest = new Mesh(new BoxGeometry(0.54, 0.5, 0.36), matSuit);
    chest.position.y = 0.25;
    const armorPlate = new Mesh(new BoxGeometry(0.42, 0.35, 0.1), matArmorDark);
    armorPlate.position.set(0, 0.25, 0.18);
    spine.add(chest, armorPlate);

    // Lightning Thunder Ring behind back
    const thunderRing = new Mesh(new TorusGeometry(0.44, 0.03, 6, 16), matStormGold);
    thunderRing.position.set(0, 0.45, -0.22);
    spine.add(thunderRing);

    // Head & Ninja Mask
    const head = new Group();
    head.position.y = 0.58;
    spine.add(head);

    const ninjaHead = new Mesh(new BoxGeometry(0.26, 0.26, 0.26), matSuit);
    ninjaHead.position.y = 0.13;
    const visor = new Mesh(new BoxGeometry(0.28, 0.06, 0.12), matStormGold);
    visor.position.set(0, 0.15, 0.14);
    const scarf = new Mesh(new BoxGeometry(0.32, 0.14, 0.32), matStormGold);
    scarf.position.y = 0.02;
    head.add(ninjaHead, visor, scarf);

    // Dual Plasma Daggers (L & R Arms)
    const leftArm = new Group(); leftArm.position.set(-0.4, 0.42, 0); spine.add(leftArm);
    const armMeshL = new Mesh(new BoxGeometry(0.16, 0.55, 0.16), matSuit); armMeshL.position.y = -0.25; leftArm.add(armMeshL);
    const bladeL = new Mesh(new BoxGeometry(0.04, 0.7, 0.1), matStormGold); bladeL.position.set(0, -0.45, 0.2); bladeL.rotation.x = Math.PI / 3; leftArm.add(bladeL);

    const rightArm = new Group(); rightArm.position.set(0.4, 0.42, 0); spine.add(rightArm);
    const armMeshR = new Mesh(new BoxGeometry(0.16, 0.55, 0.16), matSuit); armMeshR.position.y = -0.25; rightArm.add(armMeshR);
    const bladeR = new Mesh(new BoxGeometry(0.04, 0.7, 0.1), matStormGold); bladeR.position.set(0, -0.45, 0.2); bladeR.rotation.x = Math.PI / 3; rightArm.add(bladeR);

    // Legs
    const leftLeg = new Group(); leftLeg.position.set(-0.18, -0.1, 0); hips.add(leftLeg);
    const legL = new Mesh(new BoxGeometry(0.18, 0.65, 0.2), matSuit); legL.position.y = -0.32; leftLeg.add(legL);

    const rightLeg = new Group(); rightLeg.position.set(0.18, -0.1, 0); hips.add(rightLeg);
    const legR = new Mesh(new BoxGeometry(0.18, 0.65, 0.2), matSuit); legR.position.y = -0.32; rightLeg.add(legR);

    let animTime = 0;
    const update = (dt, isMoving, walkCycle) => {
      animTime += dt;
      thunderRing.rotation.z += dt * 3.5;
      matStormGold.emissiveIntensity = 2.5 + Math.sin(animTime * 8.0) * 1.2;

      if (isMoving) {
        const swing = Math.sin(walkCycle);
        leftLeg.rotation.x = swing * 0.75;
        rightLeg.rotation.x = -swing * 0.75;
        leftArm.rotation.x = -swing * 0.6;
        rightArm.rotation.x = swing * 0.6;
        hips.position.y = 1.0 + Math.abs(Math.sin(walkCycle * 2)) * 0.09;
      } else {
        const breath = Math.sin(animTime * 2.8);
        spine.position.y = 0.22 + breath * 0.02;
        leftLeg.rotation.x = 0; rightLeg.rotation.x = 0;
        leftArm.rotation.x = 0.1; rightArm.rotation.x = 0.1;
        hips.position.y = 1.0;
      }
    };

    return { root, update };
  }

  /* ------------------------------------------------------------------ */
  /* 3. IGNIS - PYROMANCER (화염 전사)                                  */
  /* ------------------------------------------------------------------ */
  static createIgnis() {
    const root = new Group();
    root.name = 'Hero_Ignis';

    const matObsidian = new MeshStandardMaterial({ color: 0x181a20, roughness: 0.25, metalness: 0.85 });
    const matGoldTrim = new MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.95 });
    const matMagmaCore = new MeshStandardMaterial({ color: 0xff3300, emissive: 0xff4400, emissiveIntensity: 2.8, roughness: 0.1 });
    const matCape = new MeshStandardMaterial({ color: 0x881111, roughness: 0.7, side: DoubleSide });
    const matEyeGlow = new MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 3.5 });

    const hips = new Group(); hips.position.y = 1.05; root.add(hips);
    const pelvis = new Mesh(new BoxGeometry(0.55, 0.35, 0.4), matObsidian);
    const belt = new Mesh(new BoxGeometry(0.6, 0.12, 0.45), matGoldTrim);
    const beltBuckle = new Mesh(new OctahedronGeometry(0.12), matMagmaCore); beltBuckle.position.z = 0.25;
    hips.add(pelvis, belt, beltBuckle);

    const spine = new Group(); spine.position.y = 0.25; hips.add(spine);
    const chest = new Mesh(new BoxGeometry(0.7, 0.55, 0.48), matObsidian); chest.position.y = 0.28;
    const chestCore = new Mesh(new OctahedronGeometry(0.18), matMagmaCore); chestCore.position.set(0, 0.32, 0.27);
    const cape = new Mesh(new BoxGeometry(0.65, 1.3, 0.04), matCape); cape.position.set(0, -0.2, -0.26); cape.rotation.x = 0.15;
    spine.add(chest, chestCore, cape);

    // Horned Helm
    const head = new Group(); head.position.y = 0.65; spine.add(head);
    const helmBase = new Mesh(new DodecahedronGeometry(0.26), matObsidian); helmBase.position.y = 0.15;
    for (const side of [-1, 1]) {
      const hornBase = new Mesh(new CylinderGeometry(0.04, 0.1, 0.3, 6), matObsidian); hornBase.position.set(side * 0.24, 0.3, 0.05); hornBase.rotation.set(-0.3, 0, -side * 0.5);
      const hornTip = new Mesh(new ConeGeometry(0.05, 0.35, 6), matMagmaCore); hornTip.position.set(side * 0.36, 0.52, -0.05); hornTip.rotation.set(-0.6, 0, -side * 0.7);
      head.add(hornBase, hornTip);
    }
    const eyeVisor = new Mesh(new BoxGeometry(0.3, 0.06, 0.1), matEyeGlow); eyeVisor.position.set(0, 0.15, 0.23);
    head.add(helmBase, eyeVisor);

    // Left Arm & Pauldron
    const leftArm = new Group(); leftArm.position.set(-0.52, 0.45, 0); spine.add(leftArm);
    const pauldronL = new Mesh(new BoxGeometry(0.38, 0.22, 0.38), matObsidian);
    const bicepL = new Mesh(new CylinderGeometry(0.1, 0.12, 0.55, 6), matObsidian); bicepL.position.y = -0.25;
    leftArm.add(pauldronL, bicepL);

    // Right Arm & Greatsword
    const rightArm = new Group(); rightArm.position.set(0.52, 0.45, 0); spine.add(rightArm);
    const pauldronR = new Mesh(new BoxGeometry(0.38, 0.22, 0.38), matObsidian);
    const bicepR = new Mesh(new CylinderGeometry(0.1, 0.12, 0.55, 6), matObsidian); bicepR.position.y = -0.25;
    rightArm.add(pauldronR, bicepR);

    const sword = new Group(); sword.position.set(0, -0.35, 0.15); sword.rotation.x = Math.PI / 3; sword.rotation.z = -0.2; rightArm.add(sword);
    const swordBlade = new Mesh(new BoxGeometry(0.22, 1.4, 0.06), matObsidian); swordBlade.position.y = 0.95;
    const swordCore = new Mesh(new BoxGeometry(0.08, 1.25, 0.08), matMagmaCore); swordCore.position.y = 0.92;
    sword.add(swordBlade, swordCore);

    // Legs
    const leftLeg = new Group(); leftLeg.position.set(-0.22, 0, 0); hips.add(leftLeg);
    const bootL = new Mesh(new BoxGeometry(0.24, 0.7, 0.32), matObsidian); bootL.position.y = -0.35; leftLeg.add(bootL);

    const rightLeg = new Group(); rightLeg.position.set(0.22, 0, 0); hips.add(rightLeg);
    const bootR = new Mesh(new BoxGeometry(0.24, 0.7, 0.32), matObsidian); bootR.position.y = -0.35; rightLeg.add(bootR);

    const halo = new Mesh(new TorusGeometry(0.48, 0.035, 8, 24), matMagmaCore); halo.position.set(0, 0.9, -0.2); spine.add(halo);

    let animTime = 0;
    const update = (dt, isMoving, walkCycle) => {
      animTime += dt;
      halo.rotation.z += dt * 0.8;
      matMagmaCore.emissiveIntensity = 2.5 + Math.sin(animTime * 4.5) * 1.2;
      cape.rotation.x = 0.15 + (isMoving ? 0.45 : 0.08) + Math.sin(animTime * (isMoving ? 12 : 3)) * 0.1;

      if (isMoving) {
        const swing = Math.sin(walkCycle);
        leftLeg.rotation.x = swing * 0.65; rightLeg.rotation.x = -swing * 0.65;
        leftArm.rotation.x = -swing * 0.5; rightArm.rotation.x = swing * 0.3;
        hips.position.y = 1.05 + Math.abs(Math.sin(walkCycle * 2)) * 0.08;
      } else {
        const breath = Math.sin(animTime * 2.2);
        spine.position.y = 0.25 + breath * 0.03;
        leftLeg.rotation.x = 0; rightLeg.rotation.x = 0;
        leftArm.rotation.x = breath * 0.05; rightArm.rotation.x = -breath * 0.04;
        hips.position.y = 1.05;
      }
    };

    return { root, update };
  }

  /* ------------------------------------------------------------------ */
  /* 4. LUMINA - ARCANE SAGE (빛의 사제)                                */
  /* ------------------------------------------------------------------ */
  static createLumina() {
    const root = new Group();
    root.name = 'Hero_Lumina';

    const matWhiteRobe = new MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.2 });
    const matArcanePink = new MeshStandardMaterial({ color: 0xf472b6, emissive: 0xdb2777, emissiveIntensity: 2.6, roughness: 0.1 });
    const matGold = new MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.2, metalness: 0.95 });
    const matSkin = new MeshStandardMaterial({ color: 0xffdfba, roughness: 0.6 });

    const hips = new Group(); hips.position.y = 1.0; root.add(hips);
    const dress = new Mesh(new CylinderGeometry(0.2, 0.46, 0.75, 8), matWhiteRobe); dress.position.y = -0.3; hips.add(dress);

    const spine = new Group(); spine.position.y = 0.22; hips.add(spine);
    const chest = new Mesh(new BoxGeometry(0.5, 0.48, 0.34), matWhiteRobe); chest.position.y = 0.24;
    const goldCorset = new Mesh(new BoxGeometry(0.42, 0.22, 0.36), matGold); goldCorset.position.y = 0.12;
    spine.add(chest, goldCorset);

    // Glowing Arcane Wings
    const wingL = new Mesh(new BoxGeometry(0.65, 0.85, 0.03), matArcanePink); wingL.position.set(-0.45, 0.4, -0.2); wingL.rotation.set(0.2, 0.4, 0.3);
    const wingR = new Mesh(new BoxGeometry(0.65, 0.85, 0.03), matArcanePink); wingR.position.set(0.45, 0.4, -0.2); wingR.rotation.set(0.2, -0.4, -0.3);
    spine.add(wingL, wingR);

    // Head & Tiara
    const head = new Group(); head.position.y = 0.58; spine.add(head);
    const face = new Mesh(new BoxGeometry(0.24, 0.24, 0.24), matSkin); face.position.y = 0.12;
    const tiara = new Mesh(new TorusGeometry(0.16, 0.02, 6, 12), matGold); tiara.position.set(0, 0.22, 0.05); tiara.rotation.x = Math.PI / 3;
    const tiaraGem = new Mesh(new OctahedronGeometry(0.07), matArcanePink); tiaraGem.position.set(0, 0.3, 0.15);
    head.add(face, tiara, tiaraGem);

    // Arms & Scepter
    const leftArm = new Group(); leftArm.position.set(-0.38, 0.4, 0); spine.add(leftArm);
    const sleeveL = new Mesh(new CylinderGeometry(0.08, 0.13, 0.55, 6), matWhiteRobe); sleeveL.position.y = -0.28; leftArm.add(sleeveL);

    const rightArm = new Group(); rightArm.position.set(0.38, 0.4, 0); spine.add(rightArm);
    const sleeveR = new Mesh(new CylinderGeometry(0.08, 0.13, 0.55, 6), matWhiteRobe); sleeveR.position.y = -0.28; rightArm.add(sleeveR);

    const scepter = new Group(); scepter.position.set(0.1, -0.2, 0.2); scepter.rotation.x = Math.PI / 4; rightArm.add(scepter);
    const rod = new Mesh(new CylinderGeometry(0.025, 0.025, 1.4, 6), matGold); rod.position.y = 0.5;
    const sunGem = new Mesh(new OctahedronGeometry(0.16), matArcanePink); sunGem.position.y = 1.25;
    scepter.add(rod, sunGem);

    // Legs
    const leftLeg = new Group(); leftLeg.position.set(-0.16, -0.1, 0); hips.add(leftLeg);
    const bootL = new Mesh(new BoxGeometry(0.16, 0.65, 0.22), matWhiteRobe); bootL.position.y = -0.32; leftLeg.add(bootL);

    const rightLeg = new Group(); rightLeg.position.set(0.16, -0.1, 0); hips.add(rightLeg);
    const bootR = new Mesh(new BoxGeometry(0.16, 0.65, 0.22), matWhiteRobe); bootR.position.y = -0.32; rightLeg.add(bootR);

    let animTime = 0;
    const update = (dt, isMoving, walkCycle) => {
      animTime += dt;
      sunGem.rotation.y += dt * 3.0;
      wingL.rotation.y = 0.4 + Math.sin(animTime * 3.5) * 0.15;
      wingR.rotation.y = -0.4 - Math.sin(animTime * 3.5) * 0.15;
      matArcanePink.emissiveIntensity = 2.2 + Math.sin(animTime * 3.0) * 0.8;

      if (isMoving) {
        const swing = Math.sin(walkCycle);
        leftLeg.rotation.x = swing * 0.55; rightLeg.rotation.x = -swing * 0.55;
        leftArm.rotation.x = -swing * 0.4; rightArm.rotation.x = swing * 0.2;
        hips.position.y = 1.0 + Math.abs(Math.sin(walkCycle * 2)) * 0.05;
      } else {
        const breath = Math.sin(animTime * 2.0);
        spine.position.y = 0.22 + breath * 0.02;
        leftLeg.rotation.x = 0; rightLeg.rotation.x = 0;
        leftArm.rotation.x = breath * 0.03; rightArm.rotation.x = -breath * 0.03;
        hips.position.y = 1.0;
      }
    };

    return { root, update };
  }

  /* ------------------------------------------------------------------ */
  /* 5. TESLA - TRAP MASTER (기계 엔지니어)                              */
  /* ------------------------------------------------------------------ */
  static createTesla() {
    const root = new Group();
    root.name = 'Hero_Tesla';

    const matCoat = new MeshStandardMaterial({ color: 0x3b1c54, roughness: 0.4, metalness: 0.3 });
    const matTeslaPurple = new MeshStandardMaterial({ color: 0xc084fc, emissive: 0x9333ea, emissiveIntensity: 2.8, roughness: 0.1 });
    const matBronze = new MeshStandardMaterial({ color: 0xcd7f32, roughness: 0.25, metalness: 0.9 });
    const matSkin = new MeshStandardMaterial({ color: 0xffdfba, roughness: 0.6 });

    const hips = new Group(); hips.position.y = 1.0; root.add(hips);
    const pelvis = new Mesh(new BoxGeometry(0.5, 0.34, 0.36), matCoat);
    const belt = new Mesh(new BoxGeometry(0.54, 0.12, 0.4), matBronze);
    hips.add(pelvis, belt);

    const spine = new Group(); spine.position.y = 0.24; hips.add(spine);
    const chest = new Mesh(new BoxGeometry(0.58, 0.52, 0.4), matCoat); chest.position.y = 0.26;

    // Tesla Coil Backpack
    const backpack = new Mesh(new BoxGeometry(0.42, 0.5, 0.22), matBronze); backpack.position.set(0, 0.3, -0.26);
    const coilL = new Mesh(new CylinderGeometry(0.06, 0.06, 0.45, 8), matTeslaPurple); coilL.position.set(-0.14, 0.6, -0.26);
    const coilR = new Mesh(new CylinderGeometry(0.06, 0.06, 0.45, 8), matTeslaPurple); coilR.position.set(0.14, 0.6, -0.26);
    spine.add(chest, backpack, coilL, coilR);

    // Head & Steampunk Goggles
    const head = new Group(); head.position.y = 0.6; spine.add(head);
    const face = new Mesh(new BoxGeometry(0.26, 0.26, 0.26), matSkin); face.position.y = 0.13;
    const goggles = new Mesh(new BoxGeometry(0.3, 0.1, 0.14), matBronze); goggles.position.set(0, 0.16, 0.14);
    const goggleLensL = new Mesh(new CylinderGeometry(0.05, 0.05, 0.04, 8), matTeslaPurple); goggleLensL.position.set(-0.08, 0.16, 0.21); goggleLensL.rotation.x = Math.PI / 2;
    const goggleLensR = new Mesh(new CylinderGeometry(0.05, 0.05, 0.04, 8), matTeslaPurple); goggleLensR.position.set(0.08, 0.16, 0.21); goggleLensR.rotation.x = Math.PI / 2;
    head.add(face, goggles, goggleLensL, goggleLensR);

    // Arms & Plasma Cannon
    const leftArm = new Group(); leftArm.position.set(-0.44, 0.42, 0); spine.add(leftArm);
    const armL = new Mesh(new BoxGeometry(0.18, 0.55, 0.18), matCoat); armL.position.y = -0.25; leftArm.add(armL);

    const rightArm = new Group(); rightArm.position.set(0.44, 0.42, 0); spine.add(rightArm);
    const armR = new Mesh(new BoxGeometry(0.18, 0.55, 0.18), matCoat); armR.position.y = -0.25; rightArm.add(armR);

    const cannon = new Group(); cannon.position.set(0, -0.3, 0.15); cannon.rotation.x = Math.PI / 4; rightArm.add(cannon);
    const cannonBarrel = new Mesh(new CylinderGeometry(0.08, 0.1, 0.8, 8), matBronze); cannonBarrel.position.y = 0.4;
    const cannonRing = new Mesh(new TorusGeometry(0.12, 0.03, 6, 12), matTeslaPurple); cannonRing.position.y = 0.7; cannonRing.rotation.x = Math.PI / 2;
    cannon.add(cannonBarrel, cannonRing);

    // Legs
    const leftLeg = new Group(); leftLeg.position.set(-0.18, -0.1, 0); hips.add(leftLeg);
    const bootL = new Mesh(new BoxGeometry(0.2, 0.65, 0.25), matBronze); bootL.position.y = -0.32; leftLeg.add(bootL);

    const rightLeg = new Group(); rightLeg.position.set(0.18, -0.1, 0); hips.add(rightLeg);
    const bootR = new Mesh(new BoxGeometry(0.2, 0.65, 0.25), matBronze); bootR.position.y = -0.32; rightLeg.add(bootR);

    let animTime = 0;
    const update = (dt, isMoving, walkCycle) => {
      animTime += dt;
      matTeslaPurple.emissiveIntensity = 2.4 + Math.sin(animTime * 6.0) * 1.0;
      cannonRing.rotation.z += dt * 4.0;

      if (isMoving) {
        const swing = Math.sin(walkCycle);
        leftLeg.rotation.x = swing * 0.65; rightLeg.rotation.x = -swing * 0.65;
        leftArm.rotation.x = -swing * 0.5; rightArm.rotation.x = swing * 0.3;
        hips.position.y = 1.0 + Math.abs(Math.sin(walkCycle * 2)) * 0.07;
      } else {
        const breath = Math.sin(animTime * 2.2);
        spine.position.y = 0.24 + breath * 0.02;
        leftLeg.rotation.x = 0; rightLeg.rotation.x = 0;
        leftArm.rotation.x = breath * 0.04; rightArm.rotation.x = -breath * 0.04;
        hips.position.y = 1.0;
      }
    };

    return { root, update };
  }

  /* ------------------------------------------------------------------ */
  /* 6. BOREAS - GLACIAL KNIGHT (빙하 성기사)                             */
  /* ------------------------------------------------------------------ */
  static createBoreas() {
    const root = new Group();
    root.name = 'Hero_Boreas';

    const matPlate = new MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.9 });
    const matGlacierCyan = new MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 2.6, roughness: 0.1 });
    const matGold = new MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.95 });

    const hips = new Group(); hips.position.y = 1.05; root.add(hips);
    const pelvis = new Mesh(new BoxGeometry(0.56, 0.36, 0.42), matPlate);
    const belt = new Mesh(new BoxGeometry(0.6, 0.12, 0.46), matGold);
    hips.add(pelvis, belt);

    const spine = new Group(); spine.position.y = 0.26; hips.add(spine);
    const chest = new Mesh(new BoxGeometry(0.72, 0.56, 0.5), matPlate); chest.position.y = 0.28;
    const frostPlate = new Mesh(new BoxGeometry(0.48, 0.38, 0.12), matGlacierCyan); frostPlate.position.set(0, 0.28, 0.24);
    spine.add(chest, frostPlate);

    // Crown Helmet
    const head = new Group(); head.position.y = 0.66; spine.add(head);
    const helm = new Mesh(new BoxGeometry(0.3, 0.3, 0.3), matPlate); helm.position.y = 0.15;
    const crown = new Mesh(new TorusGeometry(0.2, 0.04, 6, 8), matGold); crown.position.set(0, 0.28, 0); crown.rotation.x = Math.PI / 2;
    const crownSpike = new Mesh(new ConeGeometry(0.08, 0.24, 4), matGlacierCyan); crownSpike.position.set(0, 0.42, 0);
    head.add(helm, crown, crownSpike);

    // Shield (Left Arm)
    const leftArm = new Group(); leftArm.position.set(-0.52, 0.45, 0); spine.add(leftArm);
    const armL = new Mesh(new BoxGeometry(0.22, 0.55, 0.22), matPlate); armL.position.y = -0.25; leftArm.add(armL);
    const shield = new Mesh(new BoxGeometry(0.12, 0.95, 0.65), matPlate); shield.position.set(-0.16, -0.2, 0.2);
    const shieldEmblem = new Mesh(new OctahedronGeometry(0.2), matGlacierCyan); shieldEmblem.position.set(-0.24, -0.2, 0.2);
    leftArm.add(shield, shieldEmblem);

    // Warhammer (Right Arm)
    const rightArm = new Group(); rightArm.position.set(0.52, 0.45, 0); spine.add(rightArm);
    const armR = new Mesh(new BoxGeometry(0.22, 0.55, 0.22), matPlate); armR.position.y = -0.25; rightArm.add(armR);

    const hammer = new Group(); hammer.position.set(0, -0.3, 0.15); hammer.rotation.x = Math.PI / 3; rightArm.add(hammer);
    const handle = new Mesh(new CylinderGeometry(0.04, 0.04, 1.2, 8), matGold); handle.position.y = 0.4;
    const hammerHead = new Mesh(new BoxGeometry(0.35, 0.25, 0.25), matGlacierCyan); hammerHead.position.y = 0.95;
    hammer.add(handle, hammerHead);

    // Legs
    const leftLeg = new Group(); leftLeg.position.set(-0.22, 0, 0); hips.add(leftLeg);
    const bootL = new Mesh(new BoxGeometry(0.24, 0.72, 0.35), matPlate); bootL.position.y = -0.35; leftLeg.add(bootL);

    const rightLeg = new Group(); rightLeg.position.set(0.22, 0, 0); hips.add(rightLeg);
    const bootR = new Mesh(new BoxGeometry(0.24, 0.72, 0.35), matPlate); bootR.position.y = -0.35; rightLeg.add(bootR);

    let animTime = 0;
    const update = (dt, isMoving, walkCycle) => {
      animTime += dt;
      matGlacierCyan.emissiveIntensity = 2.4 + Math.sin(animTime * 3.5) * 0.9;

      if (isMoving) {
        const swing = Math.sin(walkCycle);
        leftLeg.rotation.x = swing * 0.6; rightLeg.rotation.x = -swing * 0.6;
        leftArm.rotation.x = -swing * 0.3; rightArm.rotation.x = swing * 0.4;
        hips.position.y = 1.05 + Math.abs(Math.sin(walkCycle * 2)) * 0.07;
      } else {
        const breath = Math.sin(animTime * 2.0);
        spine.position.y = 0.26 + breath * 0.02;
        leftLeg.rotation.x = 0; rightLeg.rotation.x = 0;
        leftArm.rotation.x = 0.2; rightArm.rotation.x = -0.1;
        hips.position.y = 1.05;
      }
    };

    return { root, update };
  }

  /* ------------------------------------------------------------------ */
  /* 7. SERA - TEMPEST WITCH (폭풍 마녀)                                 */
  /* ------------------------------------------------------------------ */
  static createSera() {
    const root = new Group();
    root.name = 'Hero_Sera';

    const matWitchDress = new MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.2 });
    const matTealGlow = new MeshStandardMaterial({ color: 0x2dd4bf, emissive: 0x0d9488, emissiveIntensity: 2.8, roughness: 0.1 });
    const matGold = new MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2, metalness: 0.9 });
    const matSkin = new MeshStandardMaterial({ color: 0xffdfba, roughness: 0.6 });

    const hips = new Group(); hips.position.y = 1.1; root.add(hips);
    const dressSkirt = new Mesh(new ConeGeometry(0.5, 0.9, 12, 1, true), matWitchDress); dressSkirt.position.y = -0.4; hips.add(dressSkirt);

    const spine = new Group(); spine.position.y = 0.22; hips.add(spine);
    const chest = new Mesh(new BoxGeometry(0.48, 0.48, 0.32), matWitchDress); chest.position.y = 0.24;
    const necklace = new Mesh(new OctahedronGeometry(0.1), matTealGlow); necklace.position.set(0, 0.38, 0.18);
    spine.add(chest, necklace);

    // Witch Pointy Hat
    const head = new Group(); head.position.y = 0.58; spine.add(head);
    const face = new Mesh(new BoxGeometry(0.24, 0.24, 0.24), matSkin); face.position.y = 0.12;
    const hatBrim = new Mesh(new CylinderGeometry(0.5, 0.5, 0.03, 16), matWitchDress); hatBrim.position.y = 0.24;
    const hatCone = new Mesh(new ConeGeometry(0.28, 0.7, 8), matWitchDress); hatCone.position.set(0, 0.58, -0.08); hatCone.rotation.x = -0.25;
    const hatRibbon = new Mesh(new TorusGeometry(0.24, 0.03, 6, 12), matTealGlow); hatRibbon.position.y = 0.28; hatRibbon.rotation.x = Math.PI / 2;
    head.add(face, hatBrim, hatCone, hatRibbon);

    // Orbiting 3 Wind Orbs
    const orbRing = new Group(); orbRing.position.y = 0.6; spine.add(orbRing);
    const orbs = [];
    for (let i = 0; i < 3; i++) {
      const orb = new Mesh(new IcosahedronGeometry(0.1), matTealGlow);
      const angle = (i * Math.PI * 2) / 3;
      orb.position.set(Math.cos(angle) * 0.65, 0, Math.sin(angle) * 0.65);
      orbRing.add(orb);
      orbs.push(orb);
    }

    // Arms
    const leftArm = new Group(); leftArm.position.set(-0.38, 0.4, 0); spine.add(leftArm);
    const sleeveL = new Mesh(new CylinderGeometry(0.08, 0.16, 0.55, 6), matWitchDress); sleeveL.position.y = -0.28; leftArm.add(sleeveL);

    const rightArm = new Group(); rightArm.position.set(0.38, 0.4, 0); spine.add(rightArm);
    const sleeveR = new Mesh(new CylinderGeometry(0.08, 0.16, 0.55, 6), matWitchDress); sleeveR.position.y = -0.28; rightArm.add(sleeveR);

    let animTime = 0;
    const update = (dt, isMoving, walkCycle) => {
      animTime += dt;
      orbRing.rotation.y += dt * 3.2;
      matTealGlow.emissiveIntensity = 2.4 + Math.sin(animTime * 4.0) * 0.9;

      // Floating bobbing effect
      const floatBob = Math.sin(animTime * 3.0) * 0.08;
      hips.position.y = 1.1 + floatBob;

      if (isMoving) {
        spine.rotation.x = 0.18;
        leftArm.rotation.x = -0.3; rightArm.rotation.x = -0.3;
      } else {
        spine.rotation.x = 0;
        leftArm.rotation.x = Math.sin(animTime * 2.0) * 0.05;
        rightArm.rotation.x = -Math.sin(animTime * 2.0) * 0.05;
      }
    };

    return { root, update };
  }
}

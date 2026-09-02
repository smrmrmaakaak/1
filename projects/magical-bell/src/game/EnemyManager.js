import {
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  IcosahedronGeometry,
  ConeGeometry,
  BoxGeometry,
  CylinderGeometry,
  TorusGeometry,
  PlaneGeometry,
  Vector3,
  Color
} from 'three';
import { ProceduralMonsterFactory } from '../characters/ProceduralMonsterFactory.js';
import { BurstMode } from '../effects/BurstSphere.js';

export const ENEMY_TYPES = {
  MINION: 'minion',
  BRUTE: 'brute',
  PYRO: 'pyro',
  BOSS: 'boss'
};

const TYPE_CONFIG = {
  minion: {
    maxHp: 150,
    speed: 3.5,
    attack: 10,
    radius: 0.7,
    scale: 0.8,
    color: 0x9933ff,
    emissive: 0x6611cc,
    score: 100,
    gold: 15
  },
  brute: {
    maxHp: 550,
    speed: 1.8,
    attack: 25,
    radius: 1.2,
    scale: 1.4,
    color: 0x2288cc,
    emissive: 0x004488,
    score: 250,
    gold: 45
  },
  pyro: {
    maxHp: 320,
    speed: 2.5,
    attack: 20,
    radius: 0.9,
    scale: 1.0,
    color: 0xff4411,
    emissive: 0xaa2200,
    score: 180,
    gold: 25
  },
  boss: {
    maxHp: 2400,
    speed: 1.2,
    attack: 50,
    radius: 2.2,
    scale: 2.2,
    color: 0xff0055,
    emissive: 0x990033,
    score: 1000,
    gold: 150
  }
};

/* Shared geometries to prevent GC and allocation overhead */
const GEO_CACHE = {
  minionCore: new IcosahedronGeometry(0.6, 0),
  minionBlade: new ConeGeometry(0.2, 0.9, 3),
  bruteTorso: new BoxGeometry(1.2, 1.4, 0.9),
  bruteHead: new IcosahedronGeometry(0.4, 1),
  bruteArm: new BoxGeometry(0.4, 1.2, 0.5),
  pyroBody: new CylinderGeometry(0.3, 0.7, 1.4, 6),
  pyroHead: new ConeGeometry(0.5, 0.8, 5),
  pyroRing: new TorusGeometry(0.8, 0.08, 6, 16),
  bossMonolith: new IcosahedronGeometry(1.4, 1),
  bossRing1: new TorusGeometry(2.2, 0.12, 8, 32),
  bossRing2: new TorusGeometry(2.6, 0.12, 8, 32),
  hpBg: new PlaneGeometry(1.2, 0.12),
  hpFill: new PlaneGeometry(1.16, 0.08)
};

/* Shift fill plane origin to left edge for clean scale.x bar animation */
GEO_CACHE.hpFill.translate(0.58, 0, 0);

const HP_BG_MAT = new MeshBasicMaterial({ color: 0x111520, depthTest: false, depthWrite: false });
const HP_GREEN_MAT = new MeshBasicMaterial({ color: 0x00ff88, depthTest: false, depthWrite: false });
const HP_YELLOW_MAT = new MeshBasicMaterial({ color: 0xffaa00, depthTest: false, depthWrite: false });
const HP_RED_MAT = new MeshBasicMaterial({ color: 0xff2244, depthTest: false, depthWrite: false });

const _v1 = new Vector3();
const _v2 = new Vector3();
const _toEnemy = new Vector3();

/**
 * High-performance Enemy entity with zero runtime allocations
 */
class Enemy {
  constructor(type, scene, manager = null) {
    this.type = type;
    this.config = TYPE_CONFIG[type];
    this.scene = scene;
    this.manager = manager;

    this.group = new Group();
    this.group.name = `Enemy_${type}`;

    this.hp = this.config.maxHp;
    this.maxHp = this.config.maxHp;
    this.speed = this.config.speed;
    this.isDead = false;

    this.position = new Vector3();
    this.knockback = new Vector3();

    // Status effects
    this.slowTimer = 0;
    this.slowFactor = 1.0;
    this.freezeTimer = 0;
    this.burnTimer = 0;
    this.burnDps = 0;
    this.burnTick = 0;
    this.flashTimer = 0;

    this.animTime = Math.random() * 10;
    this.attackCooldown = 0;

    this._buildMesh();
    this._buildHpBar();

    this.scene.add(this.group);
  }

  _buildMesh() {
    const cfg = this.config;

    if (this.type === ENEMY_TYPES.MINION) {
      this.meshGroup = ProceduralMonsterFactory.createMinion();
    } else if (this.type === ENEMY_TYPES.BRUTE) {
      this.meshGroup = ProceduralMonsterFactory.createBrute();
    } else if (this.type === ENEMY_TYPES.PYRO) {
      this.meshGroup = ProceduralMonsterFactory.createPyro();
    } else if (this.type === ENEMY_TYPES.BOSS) {
      this.meshGroup = ProceduralMonsterFactory.createBoss();
    } else {
      this.meshGroup = ProceduralMonsterFactory.createMinion();
    }

    this.meshGroup.scale.setScalar(cfg.scale);
    this.group.add(this.meshGroup);
  }

  _buildHpBar() {
    this.hpGroup = new Group();
    const yOffset = this.type === ENEMY_TYPES.BOSS ? 4.6 : (this.type === ENEMY_TYPES.BRUTE ? 2.8 : 2.0);
    this.hpGroup.position.set(0, yOffset, 0);

    const bgMesh = new Mesh(GEO_CACHE.hpBg, HP_BG_MAT);
    bgMesh.renderOrder = 999;
    const fillMesh = new Mesh(GEO_CACHE.hpFill, HP_GREEN_MAT);
    fillMesh.renderOrder = 1000;
    fillMesh.position.set(-0.58, 0, 0.005); // align left

    this.hpGroup.add(bgMesh, fillMesh);
    this.hpFillMesh = fillMesh;

    if (this.type === ENEMY_TYPES.BOSS) {
      this.hpGroup.scale.set(1.8, 1.8, 1.8);
    }

    this.group.add(this.hpGroup);
  }

  updateHpBar() {
    const ratio = Math.max(0, this.hp / this.maxHp);
    this.hpFillMesh.scale.x = ratio;

    if (ratio > 0.5) {
      this.hpFillMesh.material = HP_GREEN_MAT;
    } else if (ratio > 0.25) {
      this.hpFillMesh.material = HP_YELLOW_MAT;
    } else {
      this.hpFillMesh.material = HP_RED_MAT;
    }
  }

  spawn(x, z) {
    this.position.set(x, 0, z);
    this.group.position.copy(this.position);
    this.hp = this.maxHp;
    this.isDead = false;
    this.slowTimer = 0;
    this.freezeTimer = 0;
    this.burnTimer = 0;
    this.knockback.set(0, 0, 0);
    this.group.visible = true;
    this.updateHpBar();
  }

  takeDamage(amount, isCrit = false, options = {}) {
    if (this.isDead) return 0;
    this.hp -= amount;
    this.flashTimer = 0.12;

    this.manager?.sound?.playHit(isCrit);

    if (options.isSinking) {
      this.isSinking = true;
      this.isTrapped = true;
      this.freezeTimer = 5.0;
    }

    if (options.knockback) {
      this.knockback.add(options.knockback);
    }
    if (options.freeze) {
      this.freezeTimer = Math.max(this.freezeTimer, options.freeze);
    }
    if (options.slow) {
      this.slowTimer = Math.max(this.slowTimer, options.slowDuration || 2.0);
      this.slowFactor = options.slow;
    }
    if (options.burn) {
      this.burnTimer = Math.max(this.burnTimer, options.burnDuration || 3.0);
      this.burnDps = options.burn;
    }

    this.updateHpBar();

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
    }
    return amount;
  }

  update(dt, playerPos, camera, onAttackPlayer) {
    if (this.isDead) return;

    this.animTime += dt;

    // Flash effect
    if (this.baseMaterial) {
      if (this.flashTimer > 0) {
        this.flashTimer -= dt;
        this.baseMaterial.emissiveIntensity = 2.5;
      } else {
        this.baseMaterial.emissiveIntensity = 0.6;
      }
    }

    // DoT burn
    if (this.burnTimer > 0) {
      this.burnTimer -= dt;
      this.burnTick += dt;
      if (this.burnTick >= 0.3) {
        this.burnTick = 0;
        this.takeDamage(this.burnDps * 0.3);
      }
    }

    // Silence & Blind Handling (Dark Domain Room Effect)
    if (this.silenceTimer > 0) {
      this.silenceTimer -= dt;
      this.isSilenced = true;
      this.baseMaterial.emissiveIntensity = 0.1;
    } else {
      this.isSilenced = false;
    }

    // Freeze / Slow / Sinking
    let currentSpeed = this.speed;
    if (this.isSinking || this.isTrapped || this.freezeTimer > 0) {
      this.freezeTimer = Math.max(0, this.freezeTimer - dt);
      currentSpeed = 0;
    } else if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      currentSpeed *= this.slowFactor;
    }

    // Knockback decay
    if (this.knockback.lengthSq() > 0.001) {
      this.position.addScaledVector(this.knockback, dt);
      this.knockback.multiplyScalar(Math.max(0, 1 - 8 * dt));
    }

    // Move toward player
    _v1.subVectors(playerPos, this.position);
    _v1.y = 0;
    const distToPlayer = _v1.length();

    if (distToPlayer > 1.4 && currentSpeed > 0) {
      _v1.normalize();
      this.position.addScaledVector(_v1, currentSpeed * dt);
      // Face player
      this.group.rotation.y = Math.atan2(_v1.x, _v1.z);
    } else if (distToPlayer <= 1.5) {
      this.attackCooldown -= dt;
      if (this.attackCooldown <= 0 && !this.isSilenced) {
        this.attackCooldown = 1.0;
        onAttackPlayer?.(this.config.attack);
      }
    }

    // Billboard HP bar to camera
    if (camera) {
      this.hpGroup.quaternion.copy(camera.quaternion);
    }

    // Procedural Monster Locomotion & Idle Breathing
    if (this.meshGroup.userData && typeof this.meshGroup.userData.animate === 'function') {
      this.meshGroup.userData.animate(this.animTime, currentSpeed > 0 ? 1.0 : 0.15);
    }

    this.group.position.copy(this.position);
  }

  dispose() {
    this.scene.remove(this.group);
    this.baseMaterial.dispose();
  }
}

/**
 * Enemy Manager & Wave Controller (High Performance)
 */
export class EnemyManager {
  constructor(scene, floatingText, particles) {
    this.scene = scene;
    this.floatingText = floatingText;
    this.particles = particles;
    this.camera = null;
    this.gameManager = null;
    this.playerData = null;
    this.questManager = null;
    this.rpgHUD = null;
    this.isRPGMode = true;

    this.enemies = [];
    this.pool = {
      [ENEMY_TYPES.MINION]: [],
      [ENEMY_TYPES.BRUTE]: [],
      [ENEMY_TYPES.PYRO]: [],
      [ENEMY_TYPES.BOSS]: []
    };

    this.wave = 1;
    this.waveState = 'idle';
    this.enemiesToSpawn = [];
    this.spawnTimer = 0;
    this.rpgRespawnTimer = 1.0;

    this.kills = 0;
    this.score = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.onWaveClear = null;
    this.onAttackPlayer = null;
  }

  setCamera(camera) {
    this.camera = camera;
  }

  setSound(sound) {
    this.sound = sound;
  }

  setCombatEffects(bursts, shake, flash) {
    this.bursts = bursts;
    this.shake = shake;
    this.flash = flash;
  }

  setGameManager(gm) {
    this.gameManager = gm;
  }

  setRPGContext(playerData, questManager, rpgHUD) {
    this.playerData = playerData;
    this.questManager = questManager;
    this.rpgHUD = rpgHUD;
    this.isRPGMode = true;
  }

  startWave(waveNumber = 1) {
    this.wave = waveNumber;
    this.waveState = 'spawning';
    this.enemiesToSpawn = [];

    const minionCount = 4 + waveNumber * 3;
    const bruteCount = Math.floor(waveNumber * 1.2);
    const pyroCount = Math.floor(waveNumber * 0.8);
    const hasBoss = waveNumber % 3 === 0;

    for (let i = 0; i < minionCount; i++) this.enemiesToSpawn.push(ENEMY_TYPES.MINION);
    for (let i = 0; i < bruteCount; i++) this.enemiesToSpawn.push(ENEMY_TYPES.BRUTE);
    for (let i = 0; i < pyroCount; i++) this.enemiesToSpawn.push(ENEMY_TYPES.PYRO);
    if (hasBoss) this.enemiesToSpawn.push(ENEMY_TYPES.BOSS);

    for (let i = this.enemiesToSpawn.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.enemiesToSpawn[i], this.enemiesToSpawn[j]] = [this.enemiesToSpawn[j], this.enemiesToSpawn[i]];
    }

    this.spawnTimer = 0.5;
  }

  _spawnOne(type, playerPos) {
    let enemy = this.pool[type].pop();
    if (!enemy) {
      enemy = new Enemy(type, this.scene, this);
    }

    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 18 + Math.random() * 6;
    enemy.spawn(
      playerPos.x + Math.cos(angle) * spawnDist,
      playerPos.z + Math.sin(angle) * spawnDist
    );
    this.enemies.push(enemy);
  }

  _spawnRPGFieldEnemy(playerPos) {
    const distFromCenter = Math.hypot(playerPos.x, playerPos.z);
    // Don't spawn inside Sanctuary Capital Core
    if (distFromCenter < 180.0) return;

    let type = ENEMY_TYPES.MINION;
    if (playerPos.z < -7000) {
      const hasBoss = this.enemies.some(e => e.type === ENEMY_TYPES.BOSS && !e.isDead);
      type = (!hasBoss && Math.random() < 0.35) ? ENEMY_TYPES.BOSS : ENEMY_TYPES.BRUTE;
    } else if (Math.abs(playerPos.x) > 7000) {
      type = Math.random() < 0.6 ? ENEMY_TYPES.PYRO : ENEMY_TYPES.BRUTE;
    } else {
      type = Math.random() < 0.8 ? ENEMY_TYPES.MINION : ENEMY_TYPES.BRUTE;
    }

    let enemy = this.pool[type].pop();
    if (!enemy) {
      enemy = new Enemy(type, this.scene, this);
    }

    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 28 + Math.random() * 16;
    const spawnX = playerPos.x + Math.cos(angle) * spawnDist;
    const spawnZ = playerPos.z + Math.sin(angle) * spawnDist;

    // Ensure spawn outside sanctuary core
    if (Math.hypot(spawnX, spawnZ) > 180.0) {
      enemy.spawn(spawnX, spawnZ);
      this.enemies.push(enemy);
    }
  }

  spawnDirect(type, x, z) {
    let enemy = this.pool[type]?.pop();
    if (!enemy) {
      enemy = new Enemy(type, this.scene, this);
    }
    enemy.spawn(x, z);
    this.enemies.push(enemy);
    return enemy;
  }

  clearAllEnemies() {
    while (this.enemies.length > 0) {
      const enemy = this.enemies.pop();
      enemy.isDead = true;
      enemy.group.visible = false;
      this.pool[enemy.type].push(enemy);
    }
  }

  update(dt, playerPos) {
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // RPG Open-World Field Respawn Loop
    if (this.isRPGMode) {
      this.rpgRespawnTimer -= dt;
      const targetEnemyCount = 12;
      if (this.rpgRespawnTimer <= 0) {
        this.rpgRespawnTimer = 1.6;
        if (this.enemies.length < targetEnemyCount) {
          this._spawnRPGFieldEnemy(playerPos);
        }
      }
    }

    // Classic Wave Spawning fallback
    if (this.waveState === 'spawning') {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && this.enemiesToSpawn.length > 0) {
        const type = this.enemiesToSpawn.pop();
        this._spawnOne(type, playerPos);
        this.spawnTimer = Math.max(0.4, 1.6 - this.wave * 0.1);
      }
      if (this.enemiesToSpawn.length === 0) {
        this.waveState = 'active';
      }
    }

    const distFromCenter = Math.hypot(playerPos.x, playerPos.z);
    const isPlayerInVillage = distFromCenter <= 180.0;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      // In village, enemies don't chase or attack
      if (!isPlayerInVillage) {
        enemy.update(dt, playerPos, this.camera, this.onAttackPlayer);
      }

      if (enemy.isDead) {
        this.kills++;
        this.score += enemy.config.score;

        // RPG Progression: EXP & Quest Progress
        let expAward = 25;
        if (enemy.type === ENEMY_TYPES.PYRO) expAward = 65;
        if (enemy.type === ENEMY_TYPES.BRUTE) expAward = 90;
        if (enemy.type === ENEMY_TYPES.BOSS) expAward = 450;

        if (this.playerData) {
          this.playerData.addExp(expAward);
          const goldAward = enemy.config.gold || 20;
          this.playerData.gold += goldAward;

          // Rare Gear Drop (15% chance, 100% on Boss)
          if (enemy.type === ENEMY_TYPES.BOSS || Math.random() < 0.18) {
            const rareItem = {
              id: `drop_gear_${Date.now()}`,
              name: enemy.type === ENEMY_TYPES.BOSS ? '🌟 공허 군주의 대검' : '🛡️ 정예 기사의 투구',
              icon: enemy.type === ENEMY_TYPES.BOSS ? '⚔️' : '🪖',
              type: enemy.type === ENEMY_TYPES.BOSS ? 'weapon' : 'armor',
              rarity: enemy.type === ENEMY_TYPES.BOSS ? 'legendary' : 'rare',
              desc: '사냥을 통해 획득한 강력한 장비입니다.',
              stats: { str: 10, int: 8, vit: 12 }
            };
            this.playerData.addItem(rareItem);
            this.floatingText.spawn('🎁 [고급 장비 드랍!]', enemy.position, { color: '#ffd700', size: 21, isCrit: true });
          }

          this.rpgHUD?.updatePlayerStats();
        }

        if (this.questManager) {
          this.questManager.onEnemyKilled(enemy.type);
          this.rpgHUD?.updateQuestTracker();
        }

        this.comboCount++;
        this.comboTimer = 3.5;
        if (this.comboCount === 3) {
          this.floatingText.spawn('⚡ 3 COMBO! (+50)', enemy.position, { color: '#00d2ff', size: 19, isCrit: true });
        } else if (this.comboCount === 5) {
          this.floatingText.spawn('🔥 5 MULTI-KILL!', enemy.position, { color: '#ff7700', size: 21, isCrit: true });
        } else if (this.comboCount >= 10 && this.comboCount % 5 === 0) {
          this.floatingText.spawn(`👑 ${this.comboCount} UNSTOPPABLE!`, enemy.position, { color: '#ffd700', size: 25, isCrit: true });
        }

        const gold = enemy.config.gold || 15;
        this.floatingText.spawn(`+${expAward} EXP`, { x: enemy.position.x, y: enemy.position.y + 1.2, z: enemy.position.z }, { color: '#38bdf8', size: 18 });
        this.floatingText.spawn(`+${gold} 🪙`, enemy.position, { color: '#ffd700', size: 16 });
        this.floatingText.spawn(enemy.type === ENEMY_TYPES.BOSS ? '👑 BOSS DEFEATED!' : '💥 DESTROYED', enemy.position, {
          color: '#ff3366',
          isCrit: true
        });

        // Visual FX on enemy death
        const isBoss = enemy.type === ENEMY_TYPES.BOSS;
        if (this.bursts) {
          const burstMode = enemy.type === ENEMY_TYPES.PYRO ? BurstMode.FIRE : (enemy.type === ENEMY_TYPES.BRUTE ? BurstMode.EARTH : BurstMode.STORM);
          this.bursts.spawn(burstMode, enemy.position, {
            radius: isBoss ? 2.5 : 0.8,
            endRadius: isBoss ? 8.0 : 3.2,
            life: isBoss ? 0.6 : 0.35,
            intensity: isBoss ? 3.5 : 2.0
          });
        }
        if (this.shake) {
          this.shake.add(isBoss ? 0.35 : 0.12, isBoss ? 2.5 : 1.2, 20);
        }

        enemy.group.visible = false;
        this.enemies.splice(i, 1);
        this.pool[enemy.type].push(enemy);
      }
    }

    if (this.waveState === 'active' && this.enemies.length === 0 && this.enemiesToSpawn.length === 0) {
      this.waveState = 'cleared';
      if (this.gameManager) {
        this.gameManager.openShop(this.wave, (nextWave) => {
          this.startWave(nextWave);
        });
      } else {
        this.onWaveClear?.(this.wave);
        setTimeout(() => this.startWave(this.wave + 1), 3000);
      }
    }
  }

  processAbilityHits(ability, dt) {
    if (!ability.isActive) return;

    const element = ability.element;
    const origin = ability.origin;
    const dir = ability.direction;
    const length = ability.length;
    const phase = ability.phase;
    const front = ability.front || (ability.u * length);

    const dmgMult = this.gameManager?.damageMultiplier ?? 1.0;
    const areaMult = this.gameManager?.areaMultiplier ?? 1.0;

    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (enemy.isDead) continue;

      const ePos = enemy.position;
      const radius = enemy.config.radius;

      if (element === 'ice') {
        _toEnemy.subVectors(ePos, origin);
        const proj = _toEnemy.dot(dir);
        if (proj >= -0.5 && proj <= Math.min(length, front + 1.5)) {
          _v1.copy(_toEnemy).addScaledVector(dir, -proj);
          if (_v1.length() <= 1.8 * areaMult + radius) {
            if (!enemy._hitByIce || enemy._hitByIce !== ability) {
              enemy._hitByIce = ability;
              let baseDmg = Math.floor((220 + Math.random() * 80) * dmgMult);
              _v2.copy(dir).multiplyScalar(6);

              // 💥 Shatter Burst Combo: If enemy is already frozen, trigger massive shatter burst!
              if (enemy.freezeTimer > 0) {
                const shatterDmg = Math.floor(baseDmg * 2.2);
                enemy.freezeTimer = 0; // Shatter consumes freeze
                this.sound?.playShatter();
                enemy.takeDamage(shatterDmg, true, {
                  knockback: _v2.multiplyScalar(1.5)
                });
                this.floatingText.spawn(`💥 ${shatterDmg} 쇄빙 폭발!`, ePos, { color: '#00ffff', size: 25, isCrit: true });

                // AoE Shatter Shockwave to nearby enemies
                for (let j = 0; j < this.enemies.length; j++) {
                  const other = this.enemies[j];
                  if (other !== enemy && !other.isDead && other.position.distanceTo(ePos) <= 4.5 * areaMult) {
                    other.takeDamage(Math.floor(baseDmg * 0.8), false, { slow: 0.5, slowDuration: 2.0 });
                    this.floatingText.spawn(`${Math.floor(baseDmg * 0.8)} ❄️ 파편`, other.position, { color: '#38bdf8', size: 14 });
                  }
                }
              } else {
                // Chill Stacking Mechanism (3 stacks = 100% Freeze)
                enemy.frostStacks = (enemy.frostStacks || 0) + 1;
                if (enemy.frostStacks >= 3) {
                  enemy.frostStacks = 0;
                  enemy.takeDamage(baseDmg, true, {
                    freeze: 2.8,
                    knockback: _v2
                  });
                  this.floatingText.spawn(`🧊 ${baseDmg} 완전 동결!`, ePos, { color: '#67e8f9', size: 20, isCrit: true });
                } else {
                  enemy.takeDamage(baseDmg, true, {
                    slow: 0.35 + enemy.frostStacks * 0.15,
                    slowDuration: 3.5,
                    knockback: _v2
                  });
                  this.floatingText.spawn(`${baseDmg} ❄️ [한기 ${enemy.frostStacks}중첩]`, ePos, { color: '#38bdf8', isCrit: false });
                }
              }
            }
          }
        }
      } else if (element === 'thunder') {
        _toEnemy.subVectors(ePos, origin);
        const proj = _toEnemy.dot(dir);
        if (proj >= 0 && proj <= length) {
          _v1.copy(_toEnemy).addScaledVector(dir, -proj);
          if (_v1.length() <= 1.5 * areaMult + radius) {
            if (!enemy._hitByThunder || enemy._hitByThunder !== ability) {
              enemy._hitByThunder = ability;
              const dmg = Math.floor((280 + Math.random() * 100) * dmgMult);
              _v2.copy(dir).multiplyScalar(8);
              enemy.takeDamage(dmg, true, {
                freeze: 0.5,
                knockback: _v2
              });
              this.floatingText.spawn(`${dmg} ⚡ CRIT!`, ePos, { color: '#ffe600', isCrit: true });
            }
          }
        }
      } else if (element === 'meteor') {
        _v1.copy(origin).addScaledVector(dir, length);
        const distToImpact = ePos.distanceTo(_v1);

        if (phase === 'impact' || phase === 'fade') {
          if (distToImpact <= 5.5 * areaMult + radius) {
            if (!enemy._hitByMeteor || enemy._hitByMeteor !== ability) {
              enemy._hitByMeteor = ability;
              const dmg = Math.floor((450 + Math.random() * 150) * dmgMult);
              _v2.subVectors(ePos, _v1).normalize().multiplyScalar(10);
              enemy.takeDamage(dmg, true, {
                burn: 60,
                burnDuration: 4.0,
                knockback: _v2
              });
              this.floatingText.spawn(`${dmg} 💥 BOOM!`, ePos, { color: '#ff4400', isCrit: true, size: 24 });
            }
          }
        }
      } else if (element === 'beam') {
        _toEnemy.subVectors(ePos, origin);
        const proj = _toEnemy.dot(dir);
        if (proj >= 0 && proj <= length) {
          _v1.copy(_toEnemy).addScaledVector(dir, -proj);
          if (_v1.length() <= 1.4 * areaMult + radius) {
            enemy.takeDamage(120 * dmgMult * dt, false);
            enemy._beamTick = (enemy._beamTick || 0) + dt;
            if (enemy._beamTick >= 0.2) {
              enemy._beamTick = 0;
              this.floatingText.spawn(`${Math.floor(25 * dmgMult)} ✨`, ePos, { color: '#38bdf8', size: 14 });
            }
          }
        }
      } else if (element === 'snare') {
        _v1.copy(origin).addScaledVector(dir, length);
        const distToCenter = ePos.distanceTo(_v1);
        if (distToCenter <= 4.5 * areaMult + radius) {
          _v2.subVectors(_v1, ePos).normalize().multiplyScalar(6 * dt);
          enemy.position.add(_v2);

          if (!enemy._hitBySnare || enemy._hitBySnare !== ability) {
            enemy._hitBySnare = ability;
            const dmg = Math.floor((220 + Math.random() * 80) * dmgMult);
            enemy.takeDamage(dmg, true, {
              freeze: 1.5,
              slow: 0.3,
              slowDuration: 3.0
            });
            this.floatingText.spawn(`${dmg} 🌀 STUN!`, ePos, { color: '#cc44ff', isCrit: true });
          }
        }
      } else if (element === 'glacier') {
        _v1.copy(origin).addScaledVector(dir, length);
        const distToCenter = ePos.distanceTo(_v1);
        if (distToCenter <= 5.0 * areaMult + radius) {
          if (!enemy._hitByGlacier || enemy._hitByGlacier !== ability) {
            enemy._hitByGlacier = ability;
            const dmg = Math.floor((350 + Math.random() * 120) * dmgMult);
            enemy.takeDamage(dmg, true, {
              freeze: 2.5
            });
            this.floatingText.spawn(`${dmg} 🧊 FROZEN!`, ePos, { color: '#66eeff', isCrit: true });
          }
        }
      } else if (element === 'blizzard') {
        _v1.copy(origin).addScaledVector(dir, length);
        const distToCenter = ePos.distanceTo(_v1);
        const blizzardRadius = (ability.zoneRadius || 5.5) * areaMult;

        if (distToCenter <= blizzardRadius + radius) {
          // Swirling vortex vacuum pull
          const pullSpeed = this.gameManager?.upgrades.blizzardMastery ? 6.5 : 4.5;
          _v2.subVectors(_v1, ePos).normalize().multiplyScalar(pullSpeed * dt);
          enemy.position.add(_v2);

          enemy._blizzardTick = (enemy._blizzardTick || 0) + dt;
          if (enemy._blizzardTick >= 0.18) {
            enemy._blizzardTick = 0;
            const dmg = Math.floor((48 + Math.random() * 25) * dmgMult);
            enemy.takeDamage(dmg, false, {
              slow: 0.35,
              slowDuration: 2.0
            });
            this.floatingText.spawn(`${dmg} ❄️`, ePos, { color: '#38bdf8' });
          }
        }
      } else if (element === 'fire_blast') {
        const center = ability.targetPos || _v1.copy(origin).addScaledVector(dir, length);
        const distToCenter = ePos.distanceTo(center);
        const lavaRadius = (ability.currentRadius || 6.5) * areaMult;

        if (distToCenter <= lavaRadius + radius) {
          // 1. Initial Gush Explosive Impact Damage
          if (ability.hasSpurted && (!enemy._hitByLavaErupt || enemy._hitByLavaErupt !== ability)) {
            enemy._hitByLavaErupt = ability;
            const eruptDmg = Math.floor((380 + Math.random() * 120) * dmgMult);
            _v2.subVectors(ePos, center).normalize().multiplyScalar(6);
            enemy.takeDamage(eruptDmg, true, {
              knockback: _v2,
              burn: 90,
              burnDuration: 4.0
            });
            this.floatingText.spawn(`${eruptDmg} 🌋 MAGMA ERUPT!`, ePos, { color: '#ff4400', isCrit: true, size: 24 });
          }

          // 2. Continuous Boiling Ground Lava Zone Tick Damage (Every 0.2s)
          enemy._magmaTick = (enemy._magmaTick || 0) + dt;
          if (enemy._magmaTick >= 0.2) {
            enemy._magmaTick = 0;
            const burnDmg = Math.floor((80 + Math.random() * 40) * dmgMult);
            enemy.takeDamage(burnDmg, false, {
              burn: 70,
              burnDuration: 3.0,
              slow: 0.35,
              slowDuration: 1.0
            });
            this.floatingText.spawn(`${burnDmg} 🔥`, ePos, { color: '#ff6600', size: 16 });
          }
        }
      } else if (element === 'fire_fist') {
        _v1.subVectors(ePos, origin);
        const proj = _v1.dot(dir);
        if (proj >= 0 && proj <= length * ability.u + radius) {
          _v2.crossVectors(_v1, dir);
          const perpDist = _v2.length();
          if (perpDist <= 2.2 + radius) {
            if (!enemy._hitByFireFist || enemy._hitByFireFist !== ability) {
              enemy._hitByFireFist = ability;
              const dmg = Math.floor((480 + Math.random() * 150) * dmgMult);
              _v2.copy(dir).multiplyScalar(10);
              enemy.takeDamage(dmg, true, {
                knockback: _v2,
                burn: 100,
                burnDuration: 4.0
              });
              this.floatingText.spawn(`${dmg} 👊 HIKEN!`, ePos, { color: '#ff4400', isCrit: true, size: 26 });
            }
          }
        }
      } else if (element === 'fire_gun') {
        _v1.subVectors(ePos, origin);
        const proj = _v1.dot(dir);
        if (proj >= 0 && proj <= length * ability.u + radius) {
          _v2.crossVectors(_v1, dir);
          const perpDist = _v2.length();
          if (perpDist <= 1.4 + radius) {
            if (!enemy._hitByFireGun || enemy._hitByFireGun !== ability) {
              enemy._hitByFireGun = ability;
              const dmg = Math.floor((160 + Math.random() * 60) * dmgMult);
              _v2.copy(dir).multiplyScalar(4);
              enemy.takeDamage(dmg, true, {
                knockback: _v2,
                burn: 50,
                burnDuration: 3.0
              });
              this.floatingText.spawn(`${dmg} 🔥 HAGUN!`, ePos, { color: '#ff7700', isCrit: true, size: 20 });
            }
          }
        }
      } else if (element === 'cross_fire') {
        _v1.subVectors(ePos, origin);
        const proj = _v1.dot(dir);
        if (proj >= 0 && proj <= length * ability.u + radius) {
          _v2.crossVectors(_v1, dir);
          const perpDist = _v2.length();
          if (perpDist <= 2.0 + radius) {
            if (!enemy._hitByCrossFire || enemy._hitByCrossFire !== ability) {
              enemy._hitByCrossFire = ability;
              const dmg = Math.floor((340 + Math.random() * 110) * dmgMult);
              _v2.copy(dir).multiplyScalar(7);
              enemy.takeDamage(dmg, true, {
                knockback: _v2,
                burn: 90,
                burnDuration: 4.0
              });
              this.floatingText.spawn(`${dmg} 💥 CROSS FIRE!`, ePos, { color: '#ff4400', isCrit: true, size: 24 });
            }
          }
        }
      } else if (element === 'dai_entei') {
        _v1.copy(origin).addScaledVector(dir, length);
        const distToCenter = ePos.distanceTo(_v1);
        const enteiRadius = (ability.config?.zoneRadius || 18.0) * areaMult;
        if (distToCenter <= enteiRadius + radius) {
          if (phase === 'impact' && (!enemy._hitByEntei || enemy._hitByEntei !== ability)) {
            enemy._hitByEntei = ability;
            const dmg = Math.floor((1800 + Math.random() * 600) * dmgMult);
            _v2.subVectors(ePos, _v1).normalize().multiplyScalar(20);
            enemy.takeDamage(dmg, true, {
              knockback: _v2,
              burn: 250,
              burnDuration: 8.0
            });
            this.floatingText.spawn(`${dmg} ☀️ 大炎戒 炎帝!`, ePos, { color: '#ffaa00', isCrit: true, size: 36 });
          } else if (phase === 'fade') {
            // Persistent Burning Ground Zone Damage (DoT)
            enemy._enteiGroundTick = (enemy._enteiGroundTick || 0) + dt;
            if (enemy._enteiGroundTick >= 0.25) {
              enemy._enteiGroundTick = 0;
              const dotDmg = Math.floor((160 + Math.random() * 80) * dmgMult);
              enemy.takeDamage(dotDmg, false, {
                burn: 120,
                burnDuration: 4.0
              });
              this.floatingText.spawn(`${dotDmg} 🔥 염제 잔류 화염!`, ePos, { color: '#ff4400', size: 18 });
            }
          }
        }
      } else if (element === 'fire_pillar') {
        _v1.copy(origin).addScaledVector(dir, length * 0.5);
        const distToCenter = ePos.distanceTo(_v1);
        const pillarRadius = (ability.config?.zoneRadius || 6.5) * areaMult;
        if (distToCenter <= pillarRadius + radius) {
          enemy._pillarTick = (enemy._pillarTick || 0) + dt;
          if (enemy._pillarTick >= 0.18) {
            enemy._pillarTick = 0;
            const dmg = Math.floor((140 + Math.random() * 60) * dmgMult);
            enemy.takeDamage(dmg, false, {
              knockback: new Vector3(0, 15 * dt, 0),
              burn: 100,
              burnDuration: 4.0
            });
            this.floatingText.spawn(`${dmg} 🔥 火柱!`, ePos, { color: '#ff5500', size: 20 });
          }
        }
      } else if (element === 'inferno') {
        const center = ability.targetPos || _v1.copy(origin).addScaledVector(dir, length);
        const distToCenter = ePos.distanceTo(center);
        const infernoRadius = (ability.zoneRadius || 16.0) * areaMult;

        if (distToCenter <= infernoRadius + radius) {
          // Inward magma vortex suction
          _v2.subVectors(center, ePos).normalize().multiplyScalar(4.5 * dt);
          enemy.position.add(_v2);

          // 10-Second Continuous Burning Ground Lava Zone Tick Damage (Every 0.2s)
          enemy._infernoTick = (enemy._infernoTick || 0) + dt;
          if (enemy._infernoTick >= 0.2) {
            enemy._infernoTick = 0;
            const dmg = Math.floor((110 + Math.random() * 55) * dmgMult);
            enemy.takeDamage(dmg, false, {
              burn: 90,
              burnDuration: 3.0,
              slow: 0.35,
              slowDuration: 1.0
            });
            this.floatingText.spawn(`${dmg} 🌋`, ePos, { color: '#ff4400', size: 16 });
          }

          // Individual Meteor Landing Direct Impact Burst Hits
          if (ability.meteors) {
            for (const m of ability.meteors) {
              if (m.hasLanded && (!enemy['_hitByVolcano_' + m.index] || enemy['_hitByVolcano_' + m.index] !== ability)) {
                if (ePos.distanceTo(m.landPos) <= m.craterRadius + radius) {
                  enemy['_hitByVolcano_' + m.index] = ability;
                  const hitDmg = Math.floor((480 + Math.random() * 150) * dmgMult);
                  _v2.subVectors(ePos, m.landPos).normalize().multiplyScalar(8);
                  enemy.takeDamage(hitDmg, true, {
                    knockback: _v2,
                    burn: 110,
                    burnDuration: 4.0
                  });
                  this.floatingText.spawn(`${hitDmg} 💥 METEOR CRASH!`, ePos, { color: '#ff2200', isCrit: true, size: 22 });
                }
              }
            }
          }
        }
      } else if (element === 'avalanche') {
        _v1.copy(origin).addScaledVector(dir, length);
        const distToCenter = ePos.distanceTo(_v1);
        const avalancheRadius = (ability.zoneRadius || 10.0) * areaMult;

        if (distToCenter <= avalancheRadius + radius) {
          // Check comet impacts
          if (ability.comets) {
            ability.comets.forEach((comet, cIdx) => {
              if (comet.hasImpacted) {
                const hitKey = `_hitByAvalanche_${cIdx}`;
                if (!enemy[hitKey] || enemy[hitKey] !== ability) {
                  enemy[hitKey] = ability;
                  const isFinalStage = cIdx === 2;
                  let dmg = Math.floor((isFinalStage ? 1200 : 350) * dmgMult);

                  if (isFinalStage) {
                    // 💥 Final Catastrophic Global Shatter Burst
                    enemy.freezeTimer = 0;
                    _v2.subVectors(ePos, _v1).normalize().multiplyScalar(15);
                    enemy.takeDamage(dmg, true, {
                      knockback: _v2
                    });
                    this.floatingText.spawn(`👑 ${dmg} 앱솔루트 제로 쇄빙!`, ePos, { color: '#00ffff', size: 30, isCrit: true });
                  } else {
                    // Intermediate Comet: 100% Freeze
                    enemy.takeDamage(dmg, true, {
                      freeze: 3.5
                    });
                    this.floatingText.spawn(`🧊 ${dmg} 대빙하 낙하!`, ePos, { color: '#7dd3fc', size: 22, isCrit: true });
                  }
                }
              }
            });
          }
        }
      }
    }
  }

  /**
   * Find the closest living enemy to a given position.
   * @param {THREE.Vector3} origin
   * @param {number} maxRange
   * @returns {Enemy|null}
   */
  findNearestEnemy(origin, maxRange = 32) {
    let nearest = null;
    let minDistSq = maxRange * maxRange;

    for (const enemy of this.enemies) {
      if (enemy.isDead || !enemy.group.visible) continue;
      const distSq = origin.distanceToSquared(enemy.position);
      if (distSq < minDistSq) {
        minDistSq = distSq;
        nearest = enemy;
      }
    }
    return nearest;
  }

  /**
   * Find the densest cluster of enemies within search range for AoE bombardment.
   * @param {THREE.Vector3} origin
   * @param {number} searchRange
   * @param {number} aoeRadius
   * @returns {THREE.Vector3|null}
   */
  findDenseCluster(origin, searchRange = 26, aoeRadius = 5.5) {
    const validEnemies = [];
    for (const enemy of this.enemies) {
      if (enemy.isDead || !enemy.group.visible) continue;
      if (origin.distanceTo(enemy.position) <= searchRange) {
        validEnemies.push(enemy);
      }
    }

    if (validEnemies.length === 0) return null;
    if (validEnemies.length === 1) return validEnemies[0].position.clone();

    let bestCenter = null;
    let maxHitCount = 0;

    for (let i = 0; i < validEnemies.length; i++) {
      const candidate = validEnemies[i].position;
      let hitCount = 0;
      let avgX = 0;
      let avgZ = 0;

      for (let j = 0; j < validEnemies.length; j++) {
        const other = validEnemies[j].position;
        if (candidate.distanceTo(other) <= aoeRadius) {
          hitCount++;
          avgX += other.x;
          avgZ += other.z;
        }
      }

      if (hitCount > maxHitCount) {
        maxHitCount = hitCount;
        bestCenter = new Vector3(avgX / hitCount, 0, avgZ / hitCount);
      }
    }

    return bestCenter || validEnemies[0].position.clone();
  }

  reset() {
    for (const enemy of this.enemies) {
      enemy.group.visible = false;
      this.pool[enemy.type].push(enemy);
    }
    this.enemies.length = 0;
    this.enemiesToSpawn.length = 0;
    this.wave = 1;
    this.kills = 0;
    this.score = 0;
  }

  dispose() {
    this.reset();
    for (const list of Object.values(this.pool)) {
      list.forEach((e) => e.dispose());
    }
  }
}

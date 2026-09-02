import { IceAbility } from './IceAbility.js';
import { ThunderAbility } from './ThunderAbility.js';
import { MeteorAbility } from './MeteorAbility.js';
import { LightSpeedKickAbility } from './LightSpeedKickAbility.js';
import { SnareAbility } from './SnareAbility.js';
import { GlacierAbility } from './GlacierAbility.js';
import { BlizzardAbility } from './BlizzardAbility.js';
import { MeteorVolcanoAbility } from './MeteorVolcanoAbility.js';
import { IceAgeAbility } from './IceAgeAbility.js';
import { FireBlastAbility } from './FireBlastAbility.js';
import { FireFistAbility } from './FireFistAbility.js';
import { FireGunAbility } from './FireGunAbility.js';
import { HotarubiAbility } from './HotarubiAbility.js';
import { FirePillarAbility } from './FirePillarAbility.js';
import { DaiEnteiAbility } from './DaiEnteiAbility.js';
import { LightningDragonAbility } from './LightningDragonAbility.js';
import { RaigoAbility } from './RaigoAbility.js';
import { InugamiGurenAbility } from './InugamiGurenAbility.js';
import { HolyCrossAbility } from './HolyCrossAbility.js';
import { SanctuaryDomeAbility } from './SanctuaryDomeAbility.js';
import { DivineJudgmentAbility } from './DivineJudgmentAbility.js';
import { WindBladeAbility } from './WindBladeAbility.js';
import { DragonBreathAbility } from './DragonBreathAbility.js';
import { StormPrisonAbility } from './StormPrisonAbility.js';
import { RevolutionTempestAbility } from './RevolutionTempestAbility.js';
import { AirQuakeAbility } from './AirQuakeAbility.js';
import { MurakumoAbility } from './MurakumoAbility.js';
import { IslandShakerAbility } from './IslandShakerAbility.js';
import { HeavenSplitterAbility } from './HeavenSplitterAbility.js';
import { KurouzuAbility } from './KurouzuAbility.js';
import { DarkMatterAbility } from './DarkMatterAbility.js';
import { BlackHoleAbility } from './BlackHoleAbility.js';
import { LiberationAbility } from './LiberationAbility.js';
import { DarkDomainAbility } from './DarkDomainAbility.js';
import { ELEMENTS } from '../config/settings.js';
import { ObjectPool } from '../utils/ObjectPool.js';
import { Vector3 } from 'three';

/** Registry: adding an ability means adding one line here. */
const ABILITY_TYPES = {
  ice: IceAbility,
  thunder: ThunderAbility,
  meteor: MeteorAbility,
  beam: LightSpeedKickAbility,
  snare: SnareAbility,
  glacier: GlacierAbility,
  blizzard: BlizzardAbility,
  inferno: MeteorVolcanoAbility,
  avalanche: IceAgeAbility,
  fire_blast: FireBlastAbility,
  fire_fist: FireFistAbility,
  fire_gun: FireGunAbility,
  cross_fire: HotarubiAbility,
  fire_pillar: FirePillarAbility,
  dai_entei: DaiEnteiAbility,
  chain_lightning: LightningDragonAbility,
  thunder_judgment: RaigoAbility,
  hellfire: InugamiGurenAbility,
  holy_cross: HolyCrossAbility,
  sanctuary_dome: SanctuaryDomeAbility,
  divine_judgment: DivineJudgmentAbility,
  wind_blade: WindBladeAbility,
  cyclone_burst: DragonBreathAbility,
  tornado_vortex: StormPrisonAbility,
  tempest_catastrophe: RevolutionTempestAbility,
  earth_spike: AirQuakeAbility,
  stone_rampart: MurakumoAbility,
  earthquake: IslandShakerAbility,
  gigantic_megalith: HeavenSplitterAbility,
  void_orb: KurouzuAbility,
  shadow_grasp: BlackHoleAbility,
  void_singularity: LiberationAbility,
  abyss_eruption: DarkDomainAbility
};

const MAX_CONCURRENT = 999;

/**
 * Spawns, updates and recycles abilities.
 *
 * Instances are pooled per type: casting fifty times constructs at most a
 * handful of objects per ability, and every one of them keeps its meshes and
 * materials for the lifetime of the app. Nothing is built during a cast.
 *
 * `MAX_CONCURRENT` is shared across types, so mixing abilities retires the
 * oldest cast whichever element it was.
 */
export class AbilityManager {
  /**
   * @param {object} context shared systems handed to every ability:
   *   { scene, camera, environment, particles, lights, decals, bursts, shake, flash }
   */
  constructor(context) {
    this.ctx = context;
    this.active = [];
    this.selected = ELEMENTS[0];

    this.pools = new Map();
    for (const [element, Type] of Object.entries(ABILITY_TYPES)) {
      this.pools.set(
        element,
        new ObjectPool(() => {
          const ability = new Type(this.ctx);
          this.ctx.scene.add(ability.group);
          ability.group.visible = false;
          return ability;
        })
      );
    }
  }

  select(element) {
    if (!ABILITY_TYPES[element]) return;
    this.selected = element;
  }

  /**
   * Cast the selected ability along a line.
   *
   * A far cast takes the same three arguments and simply works from the far end
   * of that line — which is why adding zone targeting needed nothing here.
   *
   * @param {THREE.Vector3} origin     on the floor
   * @param {THREE.Vector3} direction  unit, flat
   * @param {number} distance          metres
   * @returns {import('./Ability.js').Ability|null}
   */
  cast(origin, direction, distance, element = this.selected) {
    if (!ABILITY_TYPES[element]) return null;

    // Retire the oldest cast rather than letting the scene grow without bound.
    if (this.active.length >= MAX_CONCURRENT) {
      const oldest = this.active.shift();
      oldest.destroy();
      this.pools.get(oldest.element).release(oldest);
    }

    const ability = this.pools.get(element).acquire();
    ability.spawn(origin, direction, distance);
    this.active.push(ability);
    return ability;
  }

  update(dt) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const ability = this.active[i];
      ability.update(dt);
      if (ability.isFinished) {
        this.active.splice(i, 1);
        ability.destroy();
        this.pools.get(ability.element).release(ability);
      }
    }
  }

  /** Cancel everything currently in flight. */
  clear() {
    for (const ability of this.active) {
      ability.destroy();
      this.pools.get(ability.element).release(ability);
    }
    this.active.length = 0;
  }

  /** The most recent still-running cast — used to frame the camera. */
  get focus() {
    for (let i = this.active.length - 1; i >= 0; i--) {
      if (this.active[i].isActive) return this.active[i];
    }
    return null;
  }

  dispose() {
    this.clear();
    for (const pool of this.pools.values()) pool.dispose((ability) => ability.dispose());
    this.pools.clear();
  }
}

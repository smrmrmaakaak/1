/**
 * settings.js — the single source of truth for every tweakable value in the sandbox.
 *
 * Nothing in the renderer owns state that lives here: shaders, particle systems,
 * lights and post processing all *read* these objects every frame. That is what
 * makes the real-time editor work without rebuilding anything — mutating a field
 * is immediately visible on screen, including on an ice field that is already
 * standing, and including while the clock is paused (`P`), which is when the
 * shapes are actually worth tuning.
 *
 * The one rule that keeps that promise: a system may only ever *sample* these
 * values. It must never copy one into a record at spawn time and read it back
 * later — see `IceAbility`, whose spike records hold nothing but unitless dice
 * rolls, and resolve every metre, radian and second against this file each frame.
 *
 * Conventions
 *  - Colours are stored as `#rrggbb` strings so lil-gui can bind them directly.
 *    Use `utils/color.js#getColor()` to read them as a cached THREE.Color.
 *  - `global` holds multipliers that scale everything at once (1 = neutral).
 *  - The per-ability blocks (`ice`, `thunder`, `meteor`, `beam`) hold absolute values.
 *
 * Every ability block is keyed by its id in `ELEMENTS`, and the shared systems
 * that need to know about "the ability the player is currently holding" — the
 * aim controller, the cooldown, the HUD — look it up as `settings[element]`.
 * The four fields they rely on being present are `range`, `minRange`, `speed`
 * and `cooldown`; everything else in a block is that ability's own business.
 * A **far cast** (`CastShape.ZONE`, declared in `ELEMENT_META`) adds a fifth:
 * `zoneRadius`, the footprint the circle indicator measures out.
 */

/**
 * The cast animations shipped alongside the rig, in `public/models/<id>.fbx`.
 *
 * Every ability block carries a `castAnim` naming one of these, so each spell
 * can throw the body differently; `CharacterController` loads all of them once
 * at boot and keeps only their clips, and the editor turns this array straight
 * into the per-ability dropdown.
 */
export const CAST_ANIMATIONS = ['cast1', 'cast2', 'cast3'];

export const settings = {
  /* ------------------------------------------------------------------ */
  /* Global multipliers                                                  */
  /* ------------------------------------------------------------------ */
  global: {
    timeScale: 1.0, // slow-mo / fast forward for the whole simulation
    speed: 1.0, // eruption travel speed multiplier
    lifetime: 1.0, // ability lifetime multiplier
    glow: 1.0, // emissive multiplier fed into bloom
    shaderIntensity: 1.0, // master strength of every procedural shader effect
    noiseStrength: 1.0,
    noiseFrequency: 1.0,
    noiseSpeed: 1.0,
    turbulence: 1.0,
    randomness: 1.0, // per-instance / per-particle jitter multiplier
    particleCount: 1.0,
    particleLifetime: 1.0,
    particleSpeed: 1.0,
    particleSize: 1.0,
    emissionRate: 1.0,
    lightIntensity: 1.0,
    lightRadius: 1.0,
    distortion: 1.0,
    fresnel: 1.0,
    opacity: 1.0,
    animationSpeed: 1.0, // character animation playback rate
    cameraShake: 1.0,
    explosionIntensity: 1.0
  },

  /* ------------------------------------------------------------------ */
  /* The aim indicator — the ground arrow drawn while the cast is armed  */
  /* ------------------------------------------------------------------ */
  /**
   * A League-style skillshot indicator: one ground quad with a signed-distance
   * arrow in its fragment shader, so every dimension below is in *metres* and
   * nothing is a texture. The quad is rebuilt from these numbers each frame,
   * which is why dragging `range` while aiming stretches the arrow live.
   */
  aim: {
    /* --- silhouette (metres) --- */
    shaftWidth: 0.42, // half-width of the shaft
    headLength: 2.6, // length of the arrowhead
    headWidth: 1.35, // half-width at the base of the head
    round: 0.12, // corner rounding of the whole silhouette
    startOffset: 0.9, // gap between the caster and the tail of the arrow

    /* --- rendering --- */
    edge: 0.09, // outline thickness, metres
    edgeGlow: 2.6, // how hard the outline blooms
    softness: 0.06, // feather on the outer edge
    fill: 0.3, // opacity of the interior wash
    fillFalloff: 1.1, // how fast the wash fades from the axis to the edge
    opacity: 1.0,

    /* --- energy running up the shaft --- */
    stripes: 0.55, // chevrons per metre
    stripeSharp: 0.62, // 0 = soft gradient, 1 = hard bars
    stripeDepth: 0.55, // how much they modulate the fill
    scrollSpeed: 2.4, // metres/second they travel toward the tip
    pulse: 0.28, // brightness breathing
    pulseSpeed: 2.2,

    /* --- frost break-up --- */
    noise: 0.45, // how much noise eats into the fill
    noiseScale: 1.6, // features per metre
    noiseSpeed: 0.35,
    crystals: 0.55, // voronoi frost plates over the interior
    crystalScale: 2.4,

    /* --- furniture --- */
    baseRing: 0.62, // radius of the ring at the caster's feet, metres
    baseRingWidth: 0.06,
    tipGlyph: 0.9, // strength of the crystal rosette at the impact point
    tipGlyphSize: 1.15, // radius of that rosette, metres
    tipSpin: 0.45, // revolutions/second
    rangeArc: 0.55, // brightness of the max-range cap
    reveal: 0.055, // seconds for the arrow to sweep out when armed

    /* --- colour --- */
    colorCore: '#ecfbff',
    colorEdge: '#3fb4ff',
    colorInvalid: '#ff6a5c', // shown when the target is inside `minRange`

    height: 0.035 // hover distance above the floor, metres
  },

  /* ------------------------------------------------------------------ */
  /* The far-cast indicator — the circle drawn at the target point       */
  /* ------------------------------------------------------------------ */
  /**
   * The other half of the targeting vocabulary. Where `aim` draws an arrow
   * along a line, this draws the **footprint**: a disc dropped at the cursor
   * with a deliberately thick boundary, because the one thing a ground-targeted
   * AoE has to answer before you click is *how much space is this going to
   * take*. The band is the answer, and the ability's own field is built to land
   * exactly on it.
   *
   * Two meshes, both parametric:
   *  - the **footprint**, a quad whose fragment shader is a signed-distance
   *    ring evaluated in metres from the target;
   *  - the **reach ring**, a ribbon strip bent into a circle at the caster's
   *    feet at `range` — a far cast needs to show where its arm ends.
   *
   * Shared by every far cast, so a new one inherits the whole indicator and
   * only brings its own `zoneRadius`.
   */
  zone: {
    /* --- the boundary (metres) --- */
    boundary: 0.34, // thickness of the band that *is* the footprint edge
    // Held under 2: the band is already the widest mark on the circle, and
    // pushing the gain past this clips it to flat white and throws away the
    // hue that says which ability you are holding.
    boundaryGlow: 1.8, // how hard it blooms
    boundaryBias: 0.35, // <0.5 grows the band inward, >0.5 outward
    liner: 0.05, // thin bright liner riding the inside of the band
    softness: 0.05, // feather on both lips

    /* --- the interior --- */
    fill: 0.22, // opacity of the wash inside the circle
    fillFalloff: 1.5, // >1 keeps the middle clear and crowds it to the rim
    rings: 2.0, // concentric contour rings across the radius
    ringWidth: 0.05,
    ringSpeed: 0.35, // how fast they travel outward, radii/second
    crawl: 0.75, // filaments crawling over the interior
    crawlScale: 1.3, // filaments per metre
    crawlSpeed: 0.45,
    noise: 0.4, // break-up eating into the wash
    noiseScale: 1.2,

    /* --- furniture --- */
    ticks: 24, // marks stepping around the boundary
    tickLength: 0.42, // how far they reach in, metres
    tickWidth: 0.2, // duty cycle, 0..1
    tickSpin: 0.06, // revolutions/second
    sweep: 0.55, // radar sweep brightness
    sweepSpeed: 0.4, // revolutions/second
    core: 0.85, // the mark at the exact target point
    coreSize: 0.4, // its radius, metres
    crosshair: 0.5, // four arms pointing out of the core
    crosshairLength: 1.1,
    pulse: 0.22, // brightness breathing
    pulseSpeed: 2.0,

    /* --- the reach ring at the caster --- */
    reach: 0.7, // brightness of the max-range circle, 0 hides it
    reachWidth: 0.05, // its half-width, metres
    reachDashes: 64, // dashes around it (0 = solid)
    reachDashGap: 0.42, // fraction of each dash that is gap
    reachSpin: 0.03, // revolutions/second the dashes creep
    reachLead: 0.9, // how much brighter the arc nearest the cursor is
    reachSegments: 192, // tessellation of that circle

    /* --- rendering --- */
    opacity: 1.0,
    reveal: 0.07, // seconds the circle takes to snap out when armed
    snap: 1.18, // how far past its radius it overshoots on the way out
    height: 0.035, // hover distance above the floor, metres

    /* --- colour --- */
    colorCore: '#eaf7ff',
    colorEdge: '#7c6bff',
    colorInvalid: '#ff6a5c' // shown when the target is inside `minRange`
  },

  /* ------------------------------------------------------------------ */
  /* Character                                                           */
  /* ------------------------------------------------------------------ */
  character: {
    /* --- blending the cast clip over the idle --- */
    // The idle loops forever; a cast clip is a one-shot laid over the top of it,
    // so these are the two edges of that overlap. In fast, out soft: the throw
    // has to land on the frame you clicked, the recovery does not.
    castBlendIn: 0.12, // seconds to cross-fade from the idle into the cast
    castBlendOut: 0.3, // seconds to fall back to the idle once it finishes

    /* --- how the body sells the cast --- */
    turnToAim: true, // face the arrow while aiming
    turnRate: 0.0002, // fraction of the heading gap left after 1s (lower = snappier)
    castLean: 0.34, // radians the torso pitches forward on release
    castRecoil: 0.16, // metres the body is shoved back
    castSettle: 2.6 // seconds⁻¹ the lunge decays at
  },

  /* ================================================================== */
  /* ICE — ability one                                                   */
  /* ================================================================== */
  /**
   * A glacial eruption: a fracture front races out along the aimed line and a
   * field of crystal spikes tears up out of the floor behind it, small and dense
   * at the caster, tall and violent at the far end.
   *
   * Everything is generated — the crystals are procedural geometry
   * (`assets/ProceduralGeometry.js`), their shading is a patched standard
   * material (`materials/IceMaterial.js`), the frost is a shader on a quad and
   * the mist, shards and glitter are GPU particles. There are no textures and no
   * meshes on disk.
   */
  ice: {
    /* --- the cast itself --- */
    range: 15.0, // maximum cast distance, metres
    minRange: 2.5, // closer than this and the cast is refused
    speed: 26.0, // how fast the fracture front travels, metres/second
    lifetime: 3.6, // seconds the field stands before it withdraws
    cooldown: 2.8, // seconds before the ability can be armed again
    castAnim: 'cast3', // which clip in `CAST_ANIMATIONS` the body throws

    /* --- the footprint the spikes fill --- */
    widthNear: 0.55, // half-width of the band at the caster, metres
    width: 2.5, // half-width at the far end, metres
    widthCurve: 0.75, // <1 flares early, >1 stays narrow then opens out
    spikeCount: 190, // instances spent on one cast (capped at 288)
    density: 1.0, // multiplier on that count
    clumping: 1.35, // >1 pulls spikes toward the centre line
    scatter: 0.55, // extra lateral jitter, fraction of the local half-width
    frontBias: 0.85, // <1 crowds spikes toward the impact point

    /* --- silhouette of the field --- */
    heightNear: 0.5, // spike height at the caster, metres
    height: 3.1, // spike height at the far end, metres
    heightCurve: 1.7, // how late the ramp climbs
    heightJitter: 0.55,
    crown: 0.55, // how much shorter the flank blades are than the spine, 0..1
    peak: 1.45, // extra height multiplier at the impact point
    peakWidth: 0.28, // how much of the line that swell covers, 0..1
    rubble: 0.42, // fraction of the spikes demoted to ankle-height shards
    rubbleScale: 0.3,

    /* --- an individual crystal --- */
    radius: 0.41, // base radius, metres
    radiusJitter: 0.93,
    taper: 0.69, // tip radius as a fraction of the base
    facets: 7, // sides of the prism (5–8 read best)
    roughness: 0.09, // how far the facets are pushed off a clean prism
    bend: 0.66, // sideways curve from base to tip
    lean: 0.42, // radians the spikes lean away from the caster
    leanJitter: 1.5,
    twist: 1.0, // random yaw, 0..1 of a full turn

    /* --- the eruption --- */
    riseTime: 0.17, // seconds from buried to full height
    riseOvershoot: 0.26, // how far past full height the punch carries
    riseStagger: 0.09, // seconds of random delay between neighbours
    settle: 0.55, // seconds the overshoot takes to damp out
    shatterDelay: 0.6, // seconds after `lifetime` before they start to go
    sinkTime: 1.0, // seconds to withdraw into the floor

    /* --- the ice material --- */
    colorDeep: '#3e737a', // the colour thick ice accumulates toward
    colorIce: '#8adaff', // body
    colorRim: '#f2feff', // fresnel edge
    colorCore: '#638797', // the light trapped inside a fresh crystal
    opacity: 0.92,
    depthTint: 1.15, // how fast the deep tint builds with thickness
    fresnel: 2.3,
    fresnelPower: 2.4,
    translucency: 1.5, // light bleeding through from behind
    envIntensity: 0.9, // how much of the HDR probe the facets catch
    facetSharp: 0.68, // crispness of the internal facet shading
    fracture: 0.62, // internal crack planes
    fractureScale: 6.5, // cracks per metre
    veins: 0.45, // milky feather-frost inside the crystal
    veinScale: 3.2,
    // Named `glint*` rather than `sparkle*` on purpose: these are the pinpoint
    // highlights on the crystal *surface*, and the `sparkle*` family further
    // down drives the glitter *particles*. Two different effects.
    glint: 1.1,
    glintScale: 34.0,
    glintSpeed: 0.7,
    frostLine: 0.5, // rime banding climbing the crystal
    glow: 0.85, // overall emissive gain
    edgeGlow: 1.1, // brightness of the silhouette rim
    birthGlow: 1.6, // extra glow on a crystal that has just erupted
    birthFade: 0.45, // seconds that birth flash lasts

    /* --- what the ground does --- */
    frostSpread: 1.35, // frost patch radius, × the local half-width
    frostRate: 3.6, // patches laid per metre of front travel
    frostLife: 7.0, // seconds a patch lingers
    frostIntensity: 0.85,
    frostCrystals: 1.5, // grain of the packed snow
    colorFrost: '#f0f9ff', // the lit face of the snow
    colorFrostEdge: '#79b6dd', // what it goes in its own shadow
    shockRadius: 5.5, // impact shockwave ring, metres
    colorShockA: '#5fd0ff', // body of the shockwave ring
    colorShockB: '#f2feff', // its crest

    /* --- mist, shards and glitter --- */
    /**
     * Every particle system is coloured by a four-stop gradient sampled over the
     * particle's own lifetime: `A` the instant it is born, `D` as it dies. They
     * are spelled out rather than derived from the crystal palette so the fog can
     * be warmed, or the glitter recoloured, without touching the ice itself.
     */
    mistRate: 260, // rolling ground fog, particles/second
    mistSize: 1.15,
    mistSpeed: 1.3,
    mistLifetime: 2.8,
    mistOpacity: 0.05,
    mistRise: 0.35, // how fast the fog lifts, metres/second
    colorMistA: '#f2feff',
    colorMistB: '#cdefff',
    colorMistC: '#a9e4ff',
    colorMistD: '#09304c',
    shardRate: 150, // ice chips thrown off the eruption
    shardSize: 0.075,
    shardSpeed: 7.0,
    shardLifetime: 1.7,
    shardGravity: -14.0,
    colorShardA: '#f2feff',
    colorShardB: '#a9e4ff',
    colorShardC: '#a9e4ff',
    colorShardD: '#12496f',
    sparkleRate: 130, // the rising glitter plume
    sparkleSize: 0.055,
    sparkleSpeed: 3.4,
    sparkleLifetime: 2.6,
    sparkleRise: 1.6, // upward drift, metres/second
    sparkleTurbulence: 0.55,
    colorSparkleA: '#f2feff',
    colorSparkleB: '#57c9ff',
    colorSparkleC: '#a9e4ff',
    colorSparkleD: '#041e32',

    /* --- dynamic light --- */
    lightIntensity: 9,
    lightRadius: 13,
    lightColor: '#7fd4ff',

    /* --- the impact at the far end --- */
    burstSize: 3.6,
    burstIntensity: 0.75,
    burstShards: 90, // extra chips thrown at the impact
    impactShake: 0.7,
    impactFlash: 0.12,
    shakeDuration: 0.9,
    rumble: 0.06, // continuous shake while the front travels
    // The frost shell mixes A→B across its billowing noise and lays C over the
    // crystallised plates and the fresnel rim, so C is the one that reads hot.
    colorBurstA: '#a9e4ff',
    colorBurstB: '#cdefff',
    colorBurstC: '#f2feff',
    colorFlash: '#f2feff' // the full-screen flash on impact
  },

  /* ================================================================== */
  /* THUNDER — ability two                                               */
  /* ================================================================== */
  /**
   * A bolt thrown from the caster's hand along the aimed line: a bundle of
   * lightning filaments that snap into existence, hold while they gutter, and
   * blow out. Reference for the look: `thundercast.jpg`.
   *
   * The bolt is **one mesh**. Every filament is an instance of the same ribbon
   * strip, and its entire shape — the sag of the axis, the fan of the bundle,
   * the kinks in an individual strand, the camera-facing width — is evaluated in
   * the vertex shader from the numbers below. Nothing about the path exists on
   * the CPU, which is why `strands`, `jitter` and `spread` reshape a bolt that
   * is already in the air, and do it with the clock paused.
   *
   * The one thing a cast *does* capture is `uSeed`, a single random number
   * rolled at spawn so two casts do not draw the identical bolt. That is an
   * event, not a dimension — the same rule `IceAbility` follows.
   */
  thunder: {
    /* --- the cast --- */
    range: 24.0, // maximum cast distance, metres
    minRange: 2.0, // closer than this and the cast is refused
    speed: 105.0, // how fast the strike front travels, metres/second
    lifetime: 0.45, // seconds the bolt holds after it lands
    fadeTime: 0.5, // seconds it takes to blow out
    cooldown: 4.5,
    castAnim: 'cast2', // which clip in `CAST_ANIMATIONS` the body throws

    /* --- where the bolt leaves the caster --- */
    // The beam starts at the hand, not at the feet, so these are measured from
    // the caster's origin in the cast's own frame.
    handHeight: 1.28, // metres above the floor
    handForward: 0.55, // metres in front of the caster
    handSide: 0.16, // metres to the side (+ follows `Ability#side`)
    endHeight: 0.35, // height of the bolt where it lands, metres
    sag: 0.22, // metres the mid-span bows upward (negative droops)

    /* --- the bundle of filaments --- */
    strands: 9, // separate filaments (capped at 24)
    spread: 0.75, // metres the bundle fans out at the far end
    spreadNear: 0.05, // ... and at the hand
    spreadCurve: 1.6, // >1 keeps the bundle tight then opens it late
    twist: 0.45, // turns the bundle makes around the axis over its length
    twistSpeed: 0.8, // turns/second it rolls on top of that
    branchDim: 0.72, // how much dimmer an outer filament is than the spine

    /* --- the shape of one filament --- */
    jitter: 0.34, // metres of kink at the coarsest octave
    jitterScale: 0.85, // kinks per metre
    octaves: 4, // 1–5; each one halves the amplitude and doubles the rate
    jitterFalloff: 0.55, // amplitude kept per octave
    crawl: 3.2, // how fast the kinks slide along the bolt
    pinch: 0.14, // fraction of the span the ends are pulled straight over
    converge: 0.8, // how hard the far end is pulled onto the target, 0..1

    /* --- the ribbon --- */
    width: 0.025, // half-width of a filament at the hand, metres
    widthTip: 0.43, // that width at the impact point, as a fraction
    widthCurve: 1.09, // how early the taper happens
    coreWidth: 1.31, // multiplier on the central spine
    coreSharp: 4.95, // how hard the hot core falls off across the ribbon
    glowWidth: 5.7, // the halo, × the core width
    glowFalloff: 2.4, // how fast the halo fades across its ribbon
    glowOpacity: 0.49,
    softFade: 0.78, // metres of soft fade where the bolt meets geometry

    /* --- flicker & restrike --- */
    restrike: 24, // times/second the filaments re-roll their shape
    flicker: 0.3, // depth of the whole-bolt brightness stutter
    flickerSpeed: 34, // stutters/second
    strandFlash: 0.5, // how much individual filaments blink out
    tipGlow: 2.0, // extra heat on the leading edge while it travels
    tipLength: 0.08, // length of that leading edge, fraction of the span

    /* --- colour --- */
    colorCore: '#ffffff', // the centre of a filament
    colorInner: '#c9ecff',
    colorOuter: '#3aa0ff', // the outside of a filament
    colorHalo: '#0b3fc8', // the wide glow around the bundle
    glow: 2.3, // overall emissive gain
    opacity: 1.0,

    /* --- what the ground does --- */
    arcRate: 0.9, // electric burns laid per metre of front travel
    arcRadius: 1.5, // radius of one burn, metres
    arcLife: 0.6, // seconds a burn lingers
    arcIntensity: 1.0,
    arcBranches: 0.6, // how finely the burn splits into filaments
    scorchRadius: 0.5, // dark burn mark under the bolt, metres
    scorchLife: 6.5,
    scorchIntensity: 0.45,
    colorArc: '#9fdcff',
    colorScorch: '#080b11',
    colorEmber: '#4aa8ff',
    shockRadius: 6.5, // impact shockwave ring, metres
    colorShockA: '#c9ecff', // body of the shockwave ring
    colorShockB: '#ffffff', // its crest

    /* --- sparks, motes, smoke and debris --- */
    /**
     * As in `ice`: each system is coloured by a four-stop gradient sampled over
     * the particle's own lifetime, `A` at birth through `D` as it dies. Spelled
     * out rather than derived from the bolt palette, so the sparks can be made
     * to cool to orange while the filaments stay blue.
     */
    sparkRate: 240, // sparks thrown off the bolt, particles/second
    sparkSize: 0.16,
    sparkSpeed: 9.0,
    sparkLifetime: 0.5,
    sparkGravity: -12.0,
    sparkStretch: 0.18, // how far a spark smears along its velocity
    colorSparkA: '#ffffff',
    colorSparkB: '#ffffff',
    colorSparkC: '#c9ecff',
    colorSparkD: '#1e5b95',
    moteRate: 90, // the slow ionised motes drifting off the bolt
    moteSize: 0.05,
    moteSpeed: 1.5,
    moteLifetime: 1.6,
    moteRise: 1.0, // upward drift, metres/second
    moteTurbulence: 0.7,
    colorMoteA: '#ffffff',
    colorMoteB: '#c9ecff',
    colorMoteC: '#3aa0ff',
    colorMoteD: '#02195f',
    smokeRate: 50, // thin haze off the scorched floor
    smokeSize: 1.0,
    smokeSpeed: 1.1,
    smokeLifetime: 2.2,
    smokeOpacity: 0.06,
    smokeRise: 0.55,
    colorSmokeA: '#3d546e',
    colorSmokeB: '#33475e',
    colorSmokeC: '#33475e',
    colorSmokeD: '#1c2938',
    debrisRate: 24, // chips kicked off the floor under the bolt
    debrisSize: 0.055,
    debrisSpeed: 5.0,
    debrisLifetime: 1.3,
    debrisGravity: -17.0,
    colorDebrisA: '#252c36',
    colorDebrisB: '#1c222a',
    colorDebrisC: '#1c222a',
    colorDebrisD: '#1c222a',

    /* --- dynamic light --- */
    lightIntensity: 26,
    lightRadius: 17,
    lightColor: '#63b8ff',
    lightFlicker: 0.4, // depth of the light's gutter, 0 = steady
    lightFlickerSpeed: 26,

    /* --- the muzzle and the impact --- */
    // Both shells are the same shader: A→B is mixed across the billowing noise
    // and stays nearly empty, and C is what the racing filaments and the fresnel
    // rim are drawn in — so C is the one carrying the read.
    muzzleSize: 0.55, // the flash at the hand, metres
    muzzleIntensity: 1.9,
    castFlash: 0.1, // screen flash on release
    colorMuzzleA: '#3aa0ff',
    colorMuzzleB: '#c9ecff',
    colorMuzzleC: '#ffffff',
    colorCastFlash: '#c9ecff',
    burstSize: 3.0, // the shell at the impact point, metres
    burstIntensity: 1.4,
    burstSparks: 170, // extra sparks thrown at the impact
    burstDebris: 45,
    impactShake: 0.8,
    shakeDuration: 0.55,
    impactFlash: 0.28,
    rumble: 0.03, // continuous shake while the front travels
    colorBurstA: '#3aa0ff',
    colorBurstB: '#c9ecff',
    colorBurstC: '#ffffff',
    colorFlash: '#c9ecff' // the full-screen flash on impact
  },

  /* ================================================================== */
  /* METEOR — ability three                                              */
  /* ================================================================== */
  /**
   * A burning rock lobbed along the aimed line, which detonates on arrival.
   *
   * The rock is real geometry — a cratered, faceted asteroid generated by
   * `assets/ProceduralGeometry.js` — shaded by a patched standard material so it
   * casts and receives the stage's shadows. Its signature is the **lava seams**:
   * the zero crossing of an fbm field sampled in the rock's own local space, so
   * the cracks are welded to it and tumble with it. `chargeCurve` decides how
   * fast they prise open on the way in.
   *
   * Behind it hangs the **fire trail**: a black-body volume raymarched inside a
   * camera-facing proxy hull laid along the arc. See the `trail*` block.
   *
   * As in `ice` and `thunder`, a cast captures nothing but dice and timestamps:
   * one seed, one tumble axis and a few unitless rolls per debris chunk. The
   * trajectory, the size of the rock, the width of its seams and the whole
   * ballistic flight of every chunk are resolved against this block each frame —
   * which is why dragging `arc` re-lofts a meteor already in the air, and
   * dragging `chunkSpeed` re-throws debris that has already landed.
   */
  meteor: {
    /* --- the cast --- */
    range: 24.0, // maximum cast distance, metres
    minRange: 3.0, // closer than this and the cast is refused
    speed: 25.0, // how fast the rock travels downrange, metres/second
    lifetime: 2.5, // seconds the crater burns after the impact
    fadeTime: 1.6, // seconds everything takes to clear
    cooldown: 5.0,
    castAnim: 'cast2', // which clip in `CAST_ANIMATIONS` the body throws

    /* --- the flight path --- */
    // The rock is thrown from a hand, so these are measured from the caster's
    // origin in the cast's own frame.
    handHeight: 2.2, // metres above the floor
    handForward: 1.0, // metres in front of the caster
    handSide: 0.2, // metres to the side (+ follows `Ability#side`)
    endHeight: 0.75, // height of the rock where it lands, metres
    arc: 5.5, // metres the mid-span lobs upward
    arcCurve: 0.85, // <1 flattens the top of the arc, >1 peaks it

    /* --- the rock --- */
    radius: 2.8, // 3.5x giant apocalyptic magma meteor
    facets: 3, // icosphere subdivisions, 0–3 (3 = 1280 triangles)
    lumpiness: 0.32, // low-frequency deformation, × the radius
    lumpScale: 1.8, // lumps per unit radius
    surfaceRoughness: 0.22, // high-frequency chipping
    cuts: 12, // planar fracture faces sliced off it
    cutDepth: 0.35, // how far in those planes bite, × the radius
    craters: 8, // impact bowls punched into it
    craterDepth: 0.25, // how deep those bowls go, × the radius
    craterSize: 0.6, // their angular radius, radians
    spin: 4.5, // tumble rate, radians/second

    /* --- the lava seams --- */
    chargeCurve: 1.6, // how late the rock heats up on its way in
    crackScale: 0.95, // seams per unit radius
    crackWidth: 0.06, // how wide a seam opens (doubled at full charge)
    crackBranches: 0.6, // strength of the finer seams splitting off
    crackGlow: 4.5,
    crackFlow: 0.8, // how much the magma brightness crawls
    crackFlowSpeed: 1.2,
    rockScale: 3.4, // mottling of the rock between the seams
    facetTint: 0.5, // per-facet value break-up — what makes it read as stone
    cavity: 0.25, // darkening down in the craters and the cut faces
    soot: 0.6, // charring either side of a seam
    rimHeat: 0.8, // heat sheath around the silhouette
    leadGlow: 1.2, // compression heat on the leading facets
    leadSharp: 2.6, // how tightly that hugs the nose
    glow: 2.2, // overall emissive gain
    envIntensity: 1.4, // how much of the HDR probe the rock catches
    colorRock: '#3a201c',
    colorChar: '#140503',
    colorCrack: '#ff4d00',
    colorHot: '#fff7c2',

    /* --- the fire trail --- */
    trailSpan: 16.0, // metres of arc the fire covers behind the rock
    trailWidth: 1.8, // tube radius, metres
    trailHeadSize: 3.0, // fireball radius at the rock, × trailWidth
    trailPlume: 1.4, // upward stretch of the volume (buoyant elongation)
    trailWakeSpread: 0.3, // how far the spent gas behind the head has ballooned
    trailRise: 0.5, // how far the far end of the wake has floated upward, metres
    // Metre-scale lobes in the silhouette. Without these the outline stays a
    // capsule no matter how much fine turbulence is piled on top of it, and the
    // trail reads as a shaded tube.
    trailBulge: 0.18, // how far those lobes swell and pinch the local radius
    trailBulgeScale: 0.34, // lobes per metre — lower = bigger, slower shapes
    // Ring vortices shed off the head and travelling back down the wake. This is
    // what folds the field into curling, mushrooming billows; fbm alone can only
    // make clouds.
    trailVortex: 0.0, // roll-up strength
    trailRingFrequency: 0.0, // vortices per metre of stream
    trailRingSpeed: 4.0, // how fast they travel backwards
    // Kept low on purpose: rolling the noise frame hard around the axis wraps
    // the filaments circumferentially and the flame reads as concentric contour
    // lines rather than as tongues running along the flow.
    trailCurl: 0.0, // swirl of the density field around the axis
    trailTurbulence: 2.94, // noise amplitude eating into the volume
    trailWarp: 0.45, // domain warp — folds the noise into curling sheets
    trailTongue: 0.94, // < 1 stretches structures upward into licking tongues
    trailStreamStretch: 1.13, // < 1 draws them out along the flow
    // Radial shear: how far the fringe is dragged up and back relative to the
    // axis. This is what makes the edge structures read as licking tongues
    // rather than as blobs of the same shape at every radius.
    trailLick: 3.1,
    trailWisps: 0.81, // ridged filaments shredding the fringe into strands
    trailShred: 1.57, // how violently the fringe tears compared to the core
    trailOctaves: 5, // turbulence octaves (quality ↔ cost)
    trailSpeed: 4.62, // how fast the field streams backwards along the path
    trailBuoyancy: 3.5, // how fast it climbs inside the volume
    trailDetachment: 0.9, // how hard the tail tears into separate puffs
    trailNoiseStrength: 0.78,
    trailNoiseFrequency: 3.23,
    trailSoftness: 0.42, // 0 = hard tongues, 1 = a soft glow
    trailFlicker: 0.74,
    trailDensity: 2.09,
    trailSoot: 1.42, // absorption — how much the cool gas occludes
    trailCoreClarity: 0.54, // extinction left in the hottest gas (low = white blob)
    trailSteps: 35, // raymarch samples per pixel (quality ↔ cost)
    trailGlow: 3.06,
    trailOpacity: 0.96,
    trailTailFade: 0.71, // fraction of the trail that has already burnt out
    trailBurnout: 1.2, // seconds the trail takes to die after the impact
    // Temperature & radiance. The flame is shaded as a Planckian radiator: these
    // are the two ends of its temperature range in kelvin, and the exponent the
    // emitted power follows. 4 would be Stefan-Boltzmann; a little gentler keeps
    // the mid-tones off the floor at this exposure.
    trailTempCore: 1920,
    trailTempEdge: 1590,
    trailEmissionCurve: 4.79,
    trailHeatFocus: 1.54, // how fast the gas reaches full heat inside the surface
    trailHeatFalloff: 2.46, // how sharply it cools toward that surface
    // How far the turbulence is allowed to drag the temperature profile around.
    // Radiated power goes as a high power of T, so this number is amplified
    // several-fold on screen — past ~0.5 the noise's own contour lines start
    // showing through as agate banding.
    trailHeatFollow: 0.26,
    trailTailHeat: 0.36, // temperature of the spent gas at the far end of the wake
    trailPalette: 0.62, // 0 = pure black-body physics, 1 = the colour stops below
    trailScatter: 1.99, // firelight bouncing inside the sooty fringe
    trailScatterFalloff: 4.4, // how fast that bath dies away from the core
    colorFlameMid: '#ffb02e',
    colorFlameEdge: '#ff3d10',
    colorFlameSmoke: '#181616',

    /* --- the debris the rock breaks into --- */
    chunkCount: 18, // chunks thrown at the impact (capped at 28)
    chunkScale: 0.28, // their radius, × the meteor's
    chunkSpeed: 7.5, // metres/second they leave the crater at
    chunkForward: 0.55, // how far the spray is biased downrange
    chunkLoft: 1.0, // how steeply they are thrown
    chunkGravity: -17.0,
    chunkSpin: 6.0, // tumble rate, radians/second
    chunkCool: 2.6, // seconds a chunk's seams take to go out
    chunkLinger: 0.5, // seconds they lie there before sinking
    chunkSink: 1.0, // seconds to withdraw into the floor

    /* --- embers, sparks, smoke and grit --- */
    emberRate: 350, // embers streaming off the rock, particles/second
    emberSize: 0.18,
    emberSpeed: 4.5,
    emberLifetime: 1.8,
    emberRise: 2.5, // buoyancy, metres/second
    emberGlow: 2.2,
    emberTurbulence: 0.8,
    colorEmberA: '#fff3d0',
    colorEmberB: '#ff9a2e',
    colorEmberC: '#ff3b0d',
    colorEmberD: '#2b0d05',
    sparkRate: 250, // sparks flung off it
    sparkSize: 0.22,
    sparkSpeed: 10.5,
    sparkLifetime: 1.0,
    sparkGravity: -14.0,
    sparkStretch: 0.25, // how far a spark smears along its velocity
    colorSparkA: '#fffdf2',
    colorSparkB: '#ffd27a',
    colorSparkC: '#ff6a12',
    colorSparkD: '#3d1103',
    smokeRate: 160, // the trail and the column off the crater
    smokeSize: 2.2,
    smokeSpeed: 2.5,
    smokeLifetime: 3.5,
    smokeOpacity: 0.22,
    smokeRise: 1.8,
    colorSmokeA: '#6b503f',
    colorSmokeB: '#3b2c25',
    colorSmokeC: '#241b17',
    colorSmokeD: '#141010',
    debrisSize: 0.12, // grit kicked off the floor
    debrisSpeed: 12.0,
    debrisLifetime: 2.0,
    debrisGravity: -22.0,
    colorDebrisA: '#3a322c',
    colorDebrisB: '#2a231e',
    colorDebrisC: '#1c1714',
    colorDebrisD: '#151110',

    /* --- the molten cracks torn through the floor --- */
    fissureRadius: 10.5, // how far the cracks reach, metres
    fissureLife: 7.5, // seconds before they close up
    fissureArms: 8, // main cracks radiating from the impact
    fissureWander: 1.6, // how hard an arm veers, radians per unit walked
    fissureBranches: 0.85, // fraction of the generated branches kept, 0..1
    fissureBranchLength: 0.95, // how far along a branch runs before its point, 0..1
    fissureWidth: 0.25, // width of the open seam, metres
    fissureHeat: 2.2, // core temperature
    fissurePulse: 1.2, // speed of the heat waves travelling along them
    fissureGrowth: 14.0, // how fast the cracks race outward, metres/second
    fissureRockSize: 0.6, // basalt heaved up along the lips, metres

    /* --- what else the ground does --- */
    scorchRadius: 7.5, // burnt patch under it, metres
    scorchLife: 8.5,
    scorchIntensity: 1.2,
    shockRadius: 14.0, // impact shockwave ring, metres
    colorScorch: '#0d0907',
    colorShockA: '#ff9a2e', // body of the shockwave ring
    colorShockB: '#fff3d0', // its crest

    /* --- dynamic light --- */
    lightIntensity: 35,
    lightRadius: 28,
    lightColor: '#ff8a3c',
    lightFlicker: 0.25, // depth of the light's gutter, 0 = steady
    lightFlickerSpeed: 13,

    /* --- the launch and the detonation --- */
    muzzleSize: 1.2, // the flare at the hand as the rock leaves it — 0 = none
    muzzleIntensity: 2.5,
    castFlash: 0.25, // screen flash on release
    colorCastFlash: '#ff9a2e',
    burstSize: 3.6, // the fireball at the impact point, metres
    burstIntensity: 1.0,
    burstTurbulence: 2.0, // how hard the noise eats into the fireball's shell
    burstEmbers: 260, // extra embers thrown at the impact
    burstSparks: 180,
    burstDebris: 90,
    burstSmoke: 70,
    impactShake: 1.0,
    shakeDuration: 1.1,
    impactFlash: 0.3,
    rumble: 0.04, // continuous shake while the rock is in the air
    colorFlash: '#ff9a2e' // the full-screen flash on impact
  },

  /* ================================================================== */
  /* BEAM — ability four                                                 */
  /* ================================================================== */
  /**
   * A sustained super beam: the caster winds up a ball of light in both hands,
   * then lets a column of it out along the aimed line, where it *stays* —
   * burning into the floor for `lifetime` before it collapses back to a thread
   * and blinks out. Reference for the look: `superbeam.jpg`.
   *
   * This is the ability with a **fourth beat**. Ice, thunder and meteor all run
   * travel → impact → fade; the beam puts a `charge` in front of that, so the
   * shot is something you watch arrive *and* something that lands and holds.
   * Nothing in the base class needed changing for it — `BeamAbility` simply
   * refuses to let the front leave the hand until the orb is up to power.
   *
   * The column is **one tube** — see `assets/ProceduralGeometry.js` — drawn
   * three times at three radii by `materials/BeamMaterial.js`: a wide halo, a
   * hollow rim-weighted sheath and, inside it, a core weighted the *opposite*
   * way, brightest where the view ray runs down the barrel. That inversion is
   * what makes the middle read as a solid rod of light instead of as a lit
   * pipe. The coils spiralling around it and the shock discs racing down it are
   * two more instanced passes placed against the same radius profile, so all
   * five stay welded together when the shape is dragged.
   *
   * Deliberately *not* electric: no kinks anywhere. The bolt's noise is
   * piecewise-linear so it keeps its corners; every noise term here is smooth
   * and stretched hard along the flow, because a beam that kinks is a bolt.
   *
   * As in every other block, a cast captures nothing but one seed and a few
   * timestamps. The barrel, the flare, the coil pitch and the disc train are all
   * resolved against these numbers each frame — which is why dragging `radius`
   * re-bores a beam that is already burning, with the clock stopped.
   */
  beam: {
    /* --- the cast --- */
    range: 35.0, // maximum cast distance, metres
    minRange: 2.0, // closer than this and the cast is refused
    charge: 0.42, // seconds the orb winds up before the beam is let out
    speed: 150.0, // how fast the leading edge races downrange, metres/second
    lifetime: 1.15, // seconds it burns once it lands
    fadeTime: 0.4, // seconds it takes to collapse
    cooldown: 4.0,
    castAnim: 'kick',
    damage: 2000,

    /* --- where it leaves the caster --- */
    // Both hands, so this one sits on the centre line rather than off a
    // shoulder like the bolt and the rock.
    handHeight: 1.3, // metres above the floor
    handForward: 0.72, // metres in front of the caster
    handSide: 0.0, // metres to the side (+ follows `Ability#side`)
    endHeight: 1.0, // height of the beam where it lands, metres

    /* --- the column --- */
    // A narrow throat that stays tight (`radiusCurve` above 1) and then opens
    // hard over the last tenth of the span: the beam reads as a jet with a bell
    // on the end rather than as a cone, which is what puts the weight at the
    // impact instead of spreading it down the whole line.
    radiusNear: 0.16, // half-width at the muzzle, metres
    radius: 0.77, // half-width at the target
    radiusCurve: 1.27, // <1 opens out early, >1 stays tight then flares late
    flare: 1.74, // extra swell where it lands
    flareWidth: 0.09, // how much of the span that swell covers, 0..1
    // Both wobbles ship at zero. The column reads cleaner with a hard, still
    // silhouette — the coils already give the eye something moving to follow —
    // but the rates below are tuned, so raising either one is a single drag.
    throb: 0.0, // pressure waves travelling out along it
    throbScale: 4.8, // waves over the length
    throbSpeed: 2.6, // waves/second
    wander: 0.0, // metres the axis drifts, pinned at both ends
    wanderScale: 0.9, // drift features per unit length
    wanderSpeed: 0.7,

    /* --- the three tube passes --- */
    // The core is deliberately narrow and not fully opaque. Widen it or push
    // `coreFill` up and the three layers stack into one white rod: the cyan
    // sheath and the gold coils are only readable because the middle leaves
    // them room.
    coreWidth: 0.2, // the hot rod, × the column radius
    coreSharp: 1.55, // how tightly the core hugs the axis
    coreFill: 0.6, // how solid it reads
    shellWidth: 1.0, // the sheath
    shellRim: 1.15, // brightness of its silhouette edges
    shellFill: 0.18, // how much body it has between them
    shellOpacity: 0.95,
    // Wide and faint: the halo is atmosphere, not a second beam. Pushing its
    // opacity up fogs the sheath's silhouette edges, which are the read.
    haloWidth: 2.75, // the outer bloom
    haloRim: 4.3, // how tightly that hugs the silhouette
    haloOpacity: 0.14,
    edgePower: 2.2, // rim exponent shared by the sheath

    /* --- the surface --- */
    ripple: 0.2, // how far the noise pushes the barrel off round
    rippleBands: 2.2, // ripple features around the barrel
    rippleScale: 4.25, // ... and along it
    rippleSpeed: 2.0, // how fast they crawl downrange
    streak: 1.1, // filaments streaming along the flow
    streakSharp: 0.45, // 0 = a wash, 1 = hard threads
    streakScale: 4.2, // threads per unit length
    streakBands: 1.8, // ... and around the barrel
    // Kept low: the threads carry heat into the *sheath*, and pushing this up
    // whitens it out until the beam is one colour from axis to rim.
    streakGlow: 0.55, // how hot a thread burns in the sheath
    flowSpeed: 7.0, // how fast the whole field streams downrange
    mouthGlow: 1.6, // heat where the column leaves the orb
    mouthLength: 0.1, // how far that reaches, fraction of the span
    // Kept below the muzzle's: the flare and the impact shell already carry the
    // far end, and stacking a hot cap on top of them blows it out to a disc.
    tipGlow: 0.6, // heat on the leading edge / the burning end
    tipLength: 0.09, // length of that edge, fraction of the span
    softFade: 0.62, // metres of soft fade where it meets geometry

    /* --- colour --- */
    colorCore: '#ffffff', // the axis
    colorInner: '#d3f4ff',
    colorOuter: '#3ec6ff', // the outside of the sheath
    colorHalo: '#0d3ce0', // the wide bloom around it
    // The column is deliberately held *back*. Three additive tube passes at full
    // strength clip to white and the beam becomes a flat plank; dropping the
    // gain and the opacity keeps it glassy and hands the read to the coils.
    glow: 0.74, // overall emissive gain
    opacity: 0.29,

    /* --- the coils --- */
    /**
     * Ribbons spiralling around the column, on the same strip the bolt is drawn
     * on. Warm on purpose: the reference frames a white-hot beam with gold
     * coils, and the colour split is what stops them dissolving into the sheath.
     */
    coils: 4, // ribbons (capped at 8)
    coilTurns: 1.45, // turns each one makes over the length
    // Negative, so the ribbons roll *against* the direction the charge pulse
    // runs. The two motions reading differently is what keeps a held beam from
    // looking like a single rotating screw.
    coilSpeed: -0.69, // turns/second they roll on top of that
    coilRadius: 1.88, // how far out they ride, × the column radius
    coilFlare: 0.57, // extra opening at the far end
    coilWidth: 0.1, // half-width at the muzzle, metres
    coilWidthTip: 1.9, // that width at the target, as a multiple
    coilSharp: 2.2, // how hard the ribbon falls off across its width
    coilPulse: 0.65, // depth of the charge running along it
    coilPulseFreq: 3.0, // pulses over the length
    coilPulseSpeed: 1.6, // pulses/second
    // Driven hard on purpose. With the column dialled back above, the ribbons
    // are what the eye actually follows down the beam.
    coilGlow: 8.0,
    coilOpacity: 2.0,
    colorCoil: '#ffdc8c',
    colorCoilEdge: '#ff6a12',

    /* --- the shock discs --- */
    rings: 10, // discs in flight (capped at 12)
    ringSpeed: 1.31, // trips down the beam per second
    // Both lips well clear of the sheath, and close together: the discs read as
    // thin hoops orbiting the column rather than as plates growing out of it.
    ringInner: 2.42, // inner lip, × the local column radius
    ringOuter: 2.73, // outer lip
    ringSwell: 0.55, // how much they open out as they travel
    ringFade: 0.18, // how much is left of one by the time it lands
    ringSharp: 1.6, // how thin the band reads
    ringGlow: 2.4,
    ringOpacity: 0.7,
    colorRing: '#9ceeff',

    /* --- the charge orb --- */
    orbSize: 0.39, // radius once it is up to power, metres
    orbThrob: 0.11, // how hard it pulses
    orbThrobSpeed: 6.9,
    orbTurbulence: 0.24, // how far the noise eats into its surface
    orbScale: 2.2, // features over the surface
    orbFlow: 0.9, // how fast they crawl
    orbBands: 5.0, // filament frequency
    orbRim: 1.8, // rim exponent
    orbGlow: 2.8,
    orbOpacity: 1.0,

    /* --- what the ground does --- */
    scorchRate: 1.1, // burns laid per metre of front travel
    scorchRadius: 0.7, // radius of one, metres
    scorchLife: 7.0, // seconds it lingers
    scorchIntensity: 0.55,
    colorScorch: '#0a0d14',
    colorEmber: '#4ad6ff',
    dustRate: 7.0, // dust rings thrown off the burning end, per second
    dustRadius: 2.4, // radius of one, metres
    dustLife: 0.9,
    colorDustA: '#3d5c74',
    colorDustB: '#9ceeff',
    shockRate: 3.5, // pressure rings snapped across the floor, per second
    shockRadius: 7.0, // radius of the one at the impact, metres
    colorShockA: '#3ec6ff', // body of the shockwave ring
    colorShockB: '#ffffff', // its crest

    /* --- sparks, motes, smoke and debris --- */
    /**
     * As in `ice`, `thunder` and `meteor`: each system is coloured by a four-stop
     * gradient sampled over the particle's own lifetime, `A` at birth through
     * `D` as it dies. The motes do double duty — they are the intake spiralling
     * *into* the orb while it charges, and the drift shed off the column once it
     * is firing.
     */
    sparkRate: 300, // sparks shed off the column, particles/second
    sparkSize: 0.15,
    sparkSpeed: 8.0,
    sparkLifetime: 0.55,
    sparkGravity: -9.0,
    sparkStretch: 0.22, // how far a spark smears along its velocity
    sparkForward: 0.9, // how hard the spray is dragged downrange
    colorSparkA: '#ffffff',
    colorSparkB: '#d3f4ff',
    colorSparkC: '#3ec6ff',
    colorSparkD: '#0b2f7a',
    moteRate: 120, // the drift hanging around the column
    moteSize: 0.06,
    moteSpeed: 1.6,
    moteLifetime: 1.5,
    moteRise: 0.9, // upward drift, metres/second
    moteTurbulence: 0.8,
    colorMoteA: '#ffffff',
    colorMoteB: '#9ceeff',
    colorMoteC: '#3ec6ff',
    colorMoteD: '#06205e',
    intakeRate: 260, // motes pulled into the orb while it charges
    intakeRadius: 2.6, // how far out they are drawn from, metres
    intakeSpeed: 7.5, // how fast they fall in
    smokeRate: 90, // steam scoured off the floor under the beam
    smokeSize: 1.1,
    smokeSpeed: 1.4,
    smokeLifetime: 2.4,
    smokeOpacity: 0.07,
    smokeRise: 0.7,
    colorSmokeA: '#41566d',
    colorSmokeB: '#35485e',
    colorSmokeC: '#2a3949',
    colorSmokeD: '#1a2430',
    debrisRate: 34, // chips torn off the floor along the burn line
    debrisSize: 0.06,
    debrisSpeed: 6.0,
    debrisLifetime: 1.4,
    debrisGravity: -18.0,
    colorDebrisA: '#2b323c',
    colorDebrisB: '#1f252d',
    colorDebrisC: '#1a1f26',
    colorDebrisD: '#1a1f26',

    /* --- dynamic light --- */
    // Two lights: one rides the beam, one sits in the caster's hands so the
    // charge actually lights the body that is holding it.
    lightIntensity: 30,
    lightRadius: 20,
    lightColor: '#7fdcff',
    lightPulse: 0.18, // depth of the hum, 0 = steady
    lightPulseSpeed: 5.0, // pulses/second
    muzzleLightIntensity: 16,
    muzzleLightRadius: 9,

    /* --- the wind-up, the release and the burn --- */
    chargeShake: 0.045, // rumble while the orb spools up
    castFlash: 0.22, // screen flash as it is released
    muzzleSize: 1.1, // the pressure shell thrown off the hands, metres
    muzzleIntensity: 2.0,
    colorCastFlash: '#d3f4ff',
    burstSize: 4.2, // the shell at the impact point, metres
    burstIntensity: 1.6,
    burstSparks: 220, // extra sparks thrown when it lands
    burstDebris: 70,
    pulseRate: 2.6, // pressure shells off the burning end, per second
    pulseSize: 2.2, // radius of one, metres
    pulseIntensity: 1.1,
    splashRate: 260, // sparks kicked back up the beam while it burns
    impactShake: 0.9,
    shakeDuration: 0.7,
    burnShake: 0.09, // continuous rumble while the beam is standing
    impactFlash: 0.3,
    rumble: 0.05, // rumble while the leading edge travels
    colorBurstA: '#3ec6ff',
    colorBurstB: '#d3f4ff',
    colorBurstC: '#ffffff',
    colorFlash: '#d3f4ff' // the full-screen flash on impact
  },

  /* ================================================================== */
  /* SNARE — ability five, and the first **far cast**                    */
  /* ================================================================== */
  /**
   * A trap planted at a point rather than a shot fired along a line: the caster
   * whips a leash of current out across the floor, and where it lands the ring
   * snaps open — a column of lightning tears up out of the middle, tendrils
   * crawl outward to the boundary and arcs run around the rim, all of it
   * holding, re-striking and dragging the air upward for `lifetime` before it
   * collapses. Reference for the look: `electricalboost.jpg`.
   *
   * This is the block that defines what a far cast *is* in this project. The
   * targeting is a circle (see the `zone` block) and `zoneRadius` is the promise
   * that circle makes: the boundary the indicator draws is the boundary the
   * field burns, the tendrils reach and the rim arcs run along, so dragging that
   * one number re-scales the indicator and a snare that is already standing
   * together.
   *
   * The whole cage is **one instanced strip** — see `materials/SnareMaterial.js`.
   * Every filament is the same ribbon, and a *role* decided from its instance
   * index (leash → column → tendril → rim) picks which parametric path the
   * vertex shader threads it along. Two draw calls for all four, however many
   * filaments are in the air.
   *
   * As in every other block, a cast captures nothing but a seed and a few
   * timestamps. Every metre, radian and second is resolved against these numbers
   * each frame — including a zero-length one, which is why the trap reshapes
   * under the sliders with the clock stopped.
   */
  snare: {
    /* --- the cast --- */
    range: 20.0, // maximum cast distance, metres
    minRange: 0.0, // a trap can legitimately be dropped on your own feet
    zoneRadius: 4.4, // the footprint — what the circle indicator measures out
    speed: 62.0, // how fast the leash races to the point, metres/second
    snapTime: 0.16, // seconds the ring takes to slam open once it lands
    lifetime: 2.6, // seconds the snare stands
    fadeTime: 0.75, // seconds it takes to collapse
    cooldown: 6.5,
    castAnim: 'cast2', // which clip in `CAST_ANIMATIONS` the body throws

    /* --- the leash that plants it --- */
    // Thrown from a hand, so these are measured from the caster's origin in the
    // cast's own frame, exactly as the bolt and the rock are.
    handHeight: 1.24, // metres above the floor
    handForward: 0.58, // metres in front of the caster
    handSide: 0.18, // metres to the side (+ follows `Ability#side`)
    leashStrands: 3, // filaments in the whip
    leashSag: -0.35, // metres the mid-span bows (negative drops it to the floor)
    leashSpread: 0.22, // how far the filaments separate, metres
    leashKink: 0.3, // kink amplitude on the whip, metres
    leashWidth: 1.0, // × the shared filament width
    leashCling: 0.12, // how far above the floor the tip runs, metres

    /* --- the column --- */
    strands: 15, // filaments in the pillar
    height: 9.2, // how high it reaches, metres
    heightCurve: 1.45, // <1 gets it up fast, >1 makes it climb late
    throat: 0.16, // radius where it leaves the floor, × zoneRadius
    columnSpread: 0.25, // radius at the top, × zoneRadius
    columnCurve: 2.88, // >1 keeps the throat tight then opens it late
    columnFlare: 0.585, // extra opening over the last quarter, × zoneRadius
    columnTwist: 0.22, // turns a filament makes over the climb
    columnSpin: 1.26, // turns/second the whole pillar rolls
    columnKink: 0.27, // kink amplitude, metres
    columnWidth: 1.86, // × the shared filament width
    columnTaper: 1.09, // how much thinner the top is than the base

    /* --- the tendrils crawling out to the boundary --- */
    tendrils: 20, // separate ground filaments (capped with the rest at 56)
    tendrilInner: 0.0, // where they leave the column, × zoneRadius
    tendrilReach: 1.07, // where they end, × zoneRadius (1 = exactly on the band)
    tendrilCurve: 1.18, // <1 throws them outward early
    tendrilWander: 1.41, // radians a tendril veers over its run
    tendrilArch: 1.16, // metres it hops off the floor mid-span
    tendrilHug: 0.005, // how far above the floor it runs, metres
    tendrilSpin: -0.225, // turns/second the whole fan rotates
    tendrilKink: 0.72, // kink amplitude, metres
    tendrilWidth: 0.75, // × the shared filament width
    tendrilDim: 0.8, // how much dimmer than the column

    /* --- the arcs running around the rim --- */
    rimArcs: 14, // arcs on the boundary at once
    rimSpan: 0.335, // fraction of the circle one arc covers
    rimSpeed: -1.84, // revolutions/second they travel
    // High enough to clear the burnt band underneath them: an arc that hops
    // 0.3 m over a band this bright is simply invisible.
    rimHeight: 0.98, // metres they hop at mid-span
    rimJitter: 0.23, // radial wobble, × zoneRadius
    rimKink: 0.15, // kink amplitude, metres
    rimWidth: 0.85, // × the shared filament width
    rimDim: 1.0,

    /* --- the shape every filament shares --- */
    // The same piecewise-linear value noise the bolt uses — linear on purpose,
    // because smoothstep rounds the corners off and the corners are the entire
    // reason it reads as lightning.
    jitter: 1.0, // master multiplier on the four per-role kink amplitudes
    jitterScale: 1.4, // kinks per metre
    octaves: 4, // 1–5; each halves the amplitude and doubles the rate
    jitterFalloff: 0.55, // amplitude kept per octave
    crawl: 2.4, // how fast the kinks slide along a filament
    pinch: 0.16, // fraction of the span the ends are pulled straight over
    restrike: 21, // times/second every filament re-rolls its shape
    flicker: 0.26, // depth of the whole-cage brightness stutter
    flickerSpeed: 30,
    strandFlash: 0.45, // how much individual filaments blink out

    /* --- the ribbon --- */
    width: 0.032, // half-width of a filament, metres
    coreSharp: 4.4, // how hard the hot core falls off across the ribbon
    glowWidth: 6.2, // the halo, × the core width
    glowFalloff: 2.3, // how fast the halo fades across its ribbon
    glowOpacity: 0.44,
    softFade: 0.7, // metres of soft fade where a filament meets geometry

    /* --- colour --- */
    // Violet rather than the Storm Lance's blue: two electric abilities on the
    // bar need to be told apart at a glance, and the hue split does it before
    // the silhouette does.
    colorCore: '#ffffff', // the centre of a filament
    colorInner: '#dcd0ff',
    colorOuter: '#8f6bff', // the outside of a filament
    colorHalo: '#2a0e8c', // the wide glow around the cage
    glow: 2.2, // overall emissive gain
    opacity: 1.0,

    /* --- the field burnt into the floor --- */
    /**
     * The indicator's promise, made real: the same circle, the same thick
     * boundary, now a live shader instead of a targeting aid. It is an
     * ability-owned mesh rather than a decal precisely because a decal captures
     * its radius when it spawns — this one has to re-scale under `zoneRadius`
     * while it is standing.
     */
    fieldBoundary: 0.02, // thickness of the burnt band, metres
    fieldBoundaryGlow: 2.9,
    fieldFill: 0.65, // the wash inside it
    fieldFalloff: 3.6, // how hard that wash crowds to the rim
    fieldVeins: 2.98, // filaments burnt across the disc
    fieldVeinScale: 2.0, // veins per metre
    fieldVeinSharp: 0.72, // 0 = a wash, 1 = hard threads
    fieldWarp: 0.55, // domain warp — what stops the veins reading as spokes
    fieldCrawl: 0.5, // how fast they writhe
    fieldRings: 2.4, // pressure rings travelling out from the middle
    fieldRingSpeed: 0.8, // rings/second
    fieldSpokes: 20, // ticks stepping around the boundary
    fieldSpokeLength: 0.5, // how far they reach in, metres
    fieldSpin: 0.05, // revolutions/second the ticks step around
    fieldCore: 1.3, // brightness of the pool the column stands in
    fieldCoreSize: 0.22, // its radius, × zoneRadius
    fieldPulse: 0.0, // brightness breathing
    fieldPulseSpeed: 3.95,
    fieldOpacity: 1.0,
    fieldHeight: 0.03, // hover distance above the floor, metres
    colorField: '#8f6bff', // the wash and the veins
    colorFieldEdge: '#ffffff', // the boundary band and the core pool

    /* --- what else the ground does --- */
    arcRate: 5.0, // branching burns laid around the rim, per second
    arcRadius: 1.2, // radius of one, metres
    arcLife: 0.75,
    arcIntensity: 0.9,
    arcBranches: 0.7, // how finely a burn splits into filaments
    trailRate: 1.1, // burns laid per metre while the leash races out
    scorchRadius: 1.6, // dark burn under the column, metres
    scorchLife: 7.5,
    scorchIntensity: 0.5,
    colorArc: '#c3b0ff',
    colorEmber: '#8f6bff',
    colorScorch: '#0b0813',
    shockRadius: 7.0, // the ring that snaps out when the trap opens, metres
    colorShockA: '#8f6bff', // body of the shockwave ring
    colorShockB: '#ffffff', // its crest

    /* --- sparks, updraft, smoke and debris --- */
    /**
     * As in every other block: a four-stop gradient sampled over the particle's
     * own lifetime, `A` at birth through `D` as it dies. The **updraft** is this
     * ability's signature system — motes drawn off the whole disc and hauled
     * inward and up into the column, which is the read that says the trap is
     * pulling on the air rather than just sitting in it.
     */
    sparkRate: 320, // sparks thrown off the cage, particles/second
    sparkSize: 0.15,
    sparkSpeed: 8.5,
    sparkLifetime: 0.55,
    sparkGravity: -13.0,
    sparkStretch: 0.2, // how far a spark smears along its velocity
    colorSparkA: '#ffffff',
    colorSparkB: '#dcd0ff',
    colorSparkC: '#8f6bff',
    colorSparkD: '#2a0e8c',
    updraftRate: 210, // motes hauled up the column, particles/second
    updraftSize: 0.07,
    updraftSpeed: 6.0, // how fast they are pulled in
    updraftLifetime: 1.4,
    updraftRise: 5.5, // upward acceleration once they are inside, m/s²
    updraftInset: 0.15, // how far inside the boundary they are picked up
    updraftTurbulence: 0.9,
    colorUpdraftA: '#8f6bff',
    colorUpdraftB: '#dcd0ff',
    colorUpdraftC: '#ffffff',
    colorUpdraftD: '#1b0a5e',
    smokeRate: 70, // haze scoured off the burnt floor
    smokeSize: 1.05,
    smokeSpeed: 1.2,
    smokeLifetime: 2.4,
    smokeOpacity: 0.06,
    smokeRise: 0.6,
    colorSmokeA: '#4a4368',
    colorSmokeB: '#3a3554',
    colorSmokeC: '#2b2740',
    colorSmokeD: '#191728',
    debrisRate: 30, // chips torn off the floor inside the ring
    debrisSize: 0.055,
    debrisSpeed: 5.5,
    debrisLifetime: 1.3,
    debrisGravity: -17.0,
    colorDebrisA: '#2a2733',
    colorDebrisB: '#201e28',
    colorDebrisC: '#1a1822',
    colorDebrisD: '#1a1822',

    /* --- dynamic light --- */
    lightIntensity: 24,
    lightRadius: 18,
    lightHeight: 0.38, // how far up the column the light sits, 0..1
    lightColor: '#a98bff',
    lightFlicker: 0.38, // depth of the light's gutter, 0 = steady
    lightFlickerSpeed: 24,

    /* --- the throw, the snap and the hold --- */
    muzzleSize: 0.5, // the flash at the hand as the leash leaves it
    muzzleIntensity: 1.7,
    castFlash: 0.09, // screen flash on release
    colorCastFlash: '#c3b0ff',
    burstSize: 2.8, // the shell thrown off when the ring opens, metres
    burstIntensity: 1.5,
    burstSparks: 200, // extra sparks at the snap
    burstDebris: 60,
    pulseRate: 1.5, // pressure shells shed off the column while it holds, /s
    pulseSize: 1.2, // radius of one, metres
    pulseIntensity: 0.5,
    ringRate: 1.4, // dust rings pushed across the floor while it holds, /s
    impactShake: 0.85,
    shakeDuration: 0.6,
    holdShake: 0.07, // continuous rumble while the snare stands
    impactFlash: 0.26,
    rumble: 0.025, // rumble while the leash races out
    colorBurstA: '#8f6bff',
    colorBurstB: '#dcd0ff',
    colorBurstC: '#ffffff',
    colorFlash: '#c3b0ff' // the full-screen flash when it snaps open
  },

  /* ================================================================== */
  /* GLACIER — ability six, and the far cast that comes out of the floor */
  /* ================================================================== */
  /**
   * A cold front races along the floor to the aimed point, the disc freezes out
   * to the boundary the circle drew, and a wall of crystal tears up out of the
   * ground around it: a ring of blades leaning outward with a skirt of wreckage
   * banked against their feet. It stands, glints, breathes cold off its rim —
   * and then breaks into plates and sinks back into the floor. Reference for the
   * look: `Hud7Xfg3LH.jpg`.
   *
   * The **middle stays open**: every shard is seated in a band about
   * `zoneRadius` and nothing is planted in the centre, because the read is a
   * wall you are looking into and filling the disc stops it being a ring. What
   * lives inside it is air and frozen ground.
   *
   * The second **far cast**, and the counterpart to the Voltaic Snare: same
   * circle, same promise, opposite answer. The snare fills the footprint with
   * current standing in the air; this one fills it with geometry standing on the
   * ground, so `zoneRadius` is again the one number that matters — it is where
   * the ring of blades is seated, where the sheet's boundary band burns, where
   * the curtain of cold air stands and where the rime creeps.
   *
   * Three things carry it, and each has its own group below:
   *
   *  - **the sweep.** The ring does not appear; it *closes*. The blade nearest
   *    the caster goes up first and the wave runs around both sides to meet
   *    behind the crown (`sweepTime`), with the skirt banking up behind the wave
   *    (`skirtDelay`, `skirtWave`).
   *  - **the freeze front.** Every shard crystallises upward along its own axis
   *    while it rises (`frontRough`, `frontWidth`, `frontGlow` — see
   *    `materials/GlacierMaterial.js`), so the ice *forms* rather than sliding
   *    out of a hole.
   *  - **the shatter.** It leaves the same way it arrived, in pieces: a
   *    per-shard ramp against a chunk id made of voronoi cells and flat facets,
   *    so plates and wedges come away one at a time (`shatterScale`,
   *    `shatterEdge`, `shatterGlow`).
   *
   * As in every other block, a cast captures nothing but a seed and a handful of
   * timestamps. Every metre, radian and second is resolved against these numbers
   * each frame — including a zero-length one, which is why the crown reshapes
   * under the sliders with the clock stopped.
   */
  glacier: {
    /* --- the cast --- */
    range: 18.0, // maximum cast distance, metres
    minRange: 0.0, // a wall of ice around your own feet is a legitimate play
    zoneRadius: 4.6, // the footprint — what the circle indicator measures out
    speed: 44.0, // how fast the front races to the point, metres/second
    snapTime: 0.22, // seconds the sheet takes to freeze out to the boundary
    lifetime: 4.2, // seconds the crown stands
    shatterDelay: 0.5, // seconds after `lifetime` before the ice starts to break
    shatterStagger: 0.45, // seconds of random delay between neighbours
    sinkTime: 1.15, // seconds one shard takes to crumble and withdraw
    cooldown: 8.0,
    castAnim: 'cast3', // which clip in `CAST_ANIMATIONS` the body throws

    /* --- where the front leaves the caster --- */
    // Thrown from a hand, so these are measured from the caster's origin in the
    // cast's own frame, exactly as the bolt, the rock and the leash are.
    handHeight: 1.22, // metres above the floor
    handForward: 0.6, // metres in front of the caster
    handSide: 0.18, // metres to the side (+ follows `Ability#side`)

    /* --- how the footprint is filled --- */
    /**
     * Everything is seated in a band about `zoneRadius`; the middle of the
     * circle is left empty on purpose, because the read of the ability is a wall
     * you are looking *into* and filling the disc stops it being a ring. The
     * spire in the middle is kept as a control and ships at zero.
     */
    spikeCount: 220, // instances spent on one cast (capped at 320)
    density: 1.0, // multiplier on that count
    ringShare: 0.6, // fraction of them spent on the wall at the boundary
    coreShare: 0.0, // ... on the spire in the middle (0 = the middle stays open)
    lateShare: 0.12, // ... held back to push up during the hold
    ringSeat: 0.94, // where the wall stands, × zoneRadius
    ringScatter: 0.16, // radial jitter of the wall, × zoneRadius
    skirtSeat: 0.74, // inner lip of the wreckage banked against it, × zoneRadius
    skirtBand: 0.42, // how wide that band is, × zoneRadius
    skirtBias: 0.9, // <1 pushes the skirt outward, >1 crowds it inward
    coreSpread: 0.16, // radius of the cluster in the middle, × zoneRadius

    /* --- the silhouette --- */
    /**
     * The reference is a *starburst*, not a fence: long needles thrown outward
     * from the rim at a steep angle, fanned off the radius so they cross, with
     * wildly uneven lengths. `ringLean` is the single control that decides
     * whether this reads as a crown or a picket line — at 0 it is a fence, and
     * the higher it goes the further the blades are thrown out over the floor.
     */
    ringHeight: 1.4, // length of a blade on the wall, metres
    ringWave: 0.61, // how uneven the crest of that wall is, 0..1
    skirtHeight: 1.7, // length of a shard in the skirt, metres
    coreHeight: 5.2, // length of the spire, metres
    heightJitter: 0.65,
    ringLean: 0.33, // radians the wall is thrown outward (≈19°)
    skirtLean: 0.3, // ... and the skirt
    coreLean: 0.2, // the spire stands nearly upright
    leanJitter: 1.3,
    fan: 1.16, // radians a blade is splayed off its own radius, ± — the crossing
    twist: 1.0, // random yaw, 0..1 of a full turn
    rubble: 0.53, // fraction of the skirt demoted to ankle-height wreckage
    rubbleScale: 0.34,

    /* --- an individual crystal --- */
    // Blunt wedges rather than needles: a thick base that only narrows to about
    // a third at the tip, so each facet stays wide enough to catch a flash.
    radius: 0.375, // base radius, metres
    radiusJitter: 0.94,
    taper: 0.36, // tip radius as a fraction of the base
    facets: 7, // sides of the prism — fewer, so each facet is a broad flash
    roughness: 0.0, // how far the facets are pushed off a clean prism
    bend: 0.0, // sideways curve from base to tip — nearly straight

    /* --- the bloom: when each shard goes up --- */
    riseTime: 0.2, // seconds from buried to full height
    riseOvershoot: 0.3, // how far past full height the punch carries
    settle: 0.5, // seconds the overshoot takes to damp out
    sweepTime: 0.42, // seconds the wave takes to run around the ring
    skirtDelay: 0.1, // seconds before the skirt starts
    skirtWave: 0.26, // ... and how long it takes to cross the band
    coreDelay: 0.2, // seconds before the spire comes up
    stagger: 0.07, // seconds of random delay on top of all of it
    bloomSpread: 0.7, // fraction of the hold the late shards are scattered over

    /* --- the ice: prismatic glass, not the Lance's quarried crystal --- */
    /**
     * Deliberately the *opposite* treatment to `ice`. Two frost abilities on one
     * bar have to be told apart before the silhouette does it, and a recolour is
     * not enough — so where the Frost Lance is milky, diffuse and tinted deeper
     * the thicker it gets, these blades are near-empty glass carried entirely by
     * their edges: a chromatically split fresnel (`dispersion`), light piped up
     * the body to an incandescent point (`pipe`, `tipBias`, `tipGlow`), flow
     * lines instead of feather frost (`stria`) and one real reflection of the
     * stage off every facet (`envIntensity`, `specular`).
     * See `materials/GlacierMaterial.js`.
     */
    colorGlass: '#0e4a66', // the little body it has
    colorEdge: '#ffffff', // the silhouette, the flow lines and the glint
    colorPrismA: '#57f0ff', // one end of the dispersion split
    colorPrismB: '#8f9bff', // ... and the other
    colorCore: '#a8f4ff', // the light piped up the blade
    colorTip: '#ffffff', // the incandescent point
    body: 1.37, // how much of a body it has at all, 0 = pure edges
    edgePower: 1.14, // how tightly the silhouette hugs the rim
    edgeGain: 0.81, // how hard it burns
    dispersion: 0.73, // how far the red, green and blue fresnels come apart
    pipe: 1.09, // light piped along the blade
    tipBias: 1.6, // how hard that light crowds toward the point
    bands: 1.4, // slow waves travelling up it
    pulseSpeed: 0.6,
    tipStart: 0.6, // where the incandescent tip begins, 0..1 up the blade
    tipGlow: 1.5,
    stria: 0.75, // flow lines running the blade's length
    striaScale: 6.0,
    envIntensity: 0.6, // how much of the HDR probe the facets catch
    specular: 2.0, // the tight sun lobe off them
    glow: 1.0, // overall emissive gain
    opacity: 1.0,
    birthGlow: 2.2, // extra glow on a shard that has just erupted
    birthFade: 0.5, // seconds that birth flash lasts

    /* --- the freeze front and the shatter --- */
    /**
     * The two things that make this ability's ice *arrive* and *leave* rather
     * than fade in and out. Both are per-instance ramps the ability drives; what
     * lives here is only their look.
     */
    frontRough: 0.35, // how ragged the crystallising edge is
    frontWidth: 0.12, // how much of the shard is lit behind that edge
    frontGlow: 2.4, // how hard it burns
    shatterScale: 7.0, // break-up cells per unit of the crystal
    shatterEdge: 0.08, // width of the lit rim on a fresh break
    shatterGlow: 3.0,

    /* --- the sheet of ice on the floor --- */
    /**
     * The indicator's promise, made real: the same circle and the same thick
     * boundary, now a frozen sheet instead of a targeting aid. An ability-owned
     * mesh rather than a decal precisely because a decal captures its radius
     * when it spawns — this one has to re-scale under `zoneRadius` while the
     * crown is standing, and to run its own front outward and back.
     */
    fieldBoundary: 0.4, // thickness of the band at the edge, metres
    fieldBoundaryGlow: 2.4,
    fieldFill: 0.26, // the wash inside it
    fieldFalloff: 1.4, // how hard that wash crowds to the rim
    fieldPlates: 1.0, // tonal break-up between plates
    fieldPlateScale: 2.2, // plates per metre
    fieldSeam: 0.8, // rime piled in the seams between them
    fieldFingers: 0.9, // frost fingers crawling over the sheet
    fieldFingerScale: 1.6, // fingers per metre
    fieldWarp: 0.5, // domain warp — what stops them reading as spokes
    fieldCrawl: 0.12, // how fast they writhe
    fieldRings: 2.6, // pressure rings travelling in toward the spire
    fieldRingSpeed: -0.5, // rings/second (negative travels inward)
    fieldSweep: 0.4, // slow cold sweep around the disc
    fieldSweepSpeed: 0.12, // revolutions/second
    fieldCore: 1.0, // brightness of the pool the spire stands in
    fieldCoreSize: 0.2, // its radius, × zoneRadius
    fieldPulse: 0.18, // brightness breathing
    fieldPulseSpeed: 1.6,
    fieldOpacity: 1.0,
    fieldHeight: 0.03, // hover distance above the floor, metres
    colorField: '#a7e6ff', // the wash, the plates and the fingers
    colorFieldEdge: '#ffffff', // the boundary band, the seams and the pool

    /* --- the curtain of cold air standing on the ring --- */
    /**
     * An open cylinder seated on the boundary, eroded by ridged noise stretched
     * hard vertically and scrolled downward. This is the piece that frames the
     * crown from the outside: without it the wall of blades ends at its own
     * silhouette, and a wall of ice that is not shedding cold reads as glass.
     * Set `veil` to 0 to take it off.
     */
    veil: 0.5, // master opacity of the curtain, 0 hides it
    veilHeight: 1.9, // how high it stands, metres
    veilRadius: 1.02, // where it stands, × zoneRadius
    veilFlare: 0.32, // how far it leans outward at the top
    veilBillow: 0.22, // metre-scale lobes pushing its silhouette off round
    veilScale: 1.4, // noise features per metre
    veilStretch: 0.5, // <1 draws the structures out into vertical falls
    veilFlow: 0.4, // how fast they pour downward
    veilErode: 0.55, // how much harder the top is eaten away than the base
    veilFalloff: 1.8, // how fast it thins with height
    veilSpin: 0.02, // revolutions/second the whole curtain turns
    veilSoftFade: 0.8, // metres of soft fade where it meets geometry
    colorVeil: '#8cd2ff',
    colorVeilCrest: '#ffffff',

    /* --- what the ground does --- */
    trailFrostRate: 2.2, // rime patches laid per metre of front travel
    trailFrostRadius: 1.0, // radius of one, metres
    frostSpread: 1.5, // the rime sheet under the crown, × zoneRadius
    frostLife: 7.5, // seconds a rime patch lingers
    frostIntensity: 0.85,
    frostCrystals: 1.5, // grain of the packed snow
    frostCollar: 2.6, // rime around the foot of a blade, × its own radius
    rimeRate: 3.0, // rime patches creeping around the boundary, per second
    rimeRadius: 1.0, // radius of one, metres
    colorFrost: '#f0f9ff', // the lit face of the snow
    colorFrostEdge: '#79b6dd', // what it goes in its own shadow
    shockRadius: 7.5, // the ring that snaps out when the crown blooms, metres
    ringRate: 0.9, // pressure rings pushed out while it stands, per second
    colorShockA: '#8ee8ff', // body of the shockwave ring
    colorShockB: '#ffffff', // its crest

    /* --- mist, chips, glitter and snow --- */
    /**
     * As in every other block: a four-stop gradient sampled over the particle's
     * own lifetime, `A` at birth through `D` as it dies. The **snow** is this
     * ability's signature system — ice dust spawned *above* the crown and left
     * to fall back down through it. Everything else in the project is thrown
     * upward, and a slow fall inside the ring is what says the air over it is
     * freezing rather than burning.
     */
    mistRate: 240, // cold air pouring off the rim, particles/second
    mistSize: 1.1,
    mistSpeed: 1.6,
    mistLifetime: 3.0,
    mistOpacity: 0.055,
    mistRise: -0.12, // negative: cold air is heavy, it falls and spreads
    mistTurbulence: 0.4,
    colorMistA: '#f2feff',
    colorMistB: '#cdefff',
    colorMistC: '#8ec9e8',
    colorMistD: '#0a2c42',
    shardSize: 0.07, // ice chips
    shardSpeed: 6.5,
    shardLifetime: 1.6,
    shardGravity: -15.0,
    breachShards: 3, // chips thrown as one shard breaks the surface
    shatterShards: 5, // ... and as it comes apart
    colorShardA: '#ffffff',
    colorShardB: '#cdefff',
    colorShardC: '#8ee8ff',
    colorShardD: '#0a3c55',
    glitterRate: 150, // the sparkle lifting off the sheet
    glitterSize: 0.05,
    glitterSpeed: 2.6,
    glitterLifetime: 2.4,
    glitterRise: 1.3, // upward drift, metres/second
    glitterTurbulence: 0.6,
    glitterGlow: 1.0,
    colorGlitterA: '#ffffff',
    colorGlitterB: '#6fe0ff',
    colorGlitterC: '#bdeeff',
    colorGlitterD: '#062434',
    snowRate: 110, // ice dust falling back through the crown
    snowSize: 0.045,
    snowSpeed: 0.9, // how hard it is pushed downward to start with
    snowLifetime: 3.2,
    snowFall: -1.1, // gravity on it, metres/second²
    snowTurbulence: 0.85, // what turns the fall into a drift
    snowGlow: 0.9,
    snowInset: 0.85, // how far inside the boundary it falls, × zoneRadius
    snowHeight: 1.35, // where it starts, × the height of the wall
    colorSnowA: '#ffffff',
    colorSnowB: '#e4f9ff',
    colorSnowC: '#a7e6ff',
    colorSnowD: '#0c3348',

    /* --- dynamic light --- */
    lightIntensity: 14,
    lightRadius: 16,
    lightHeight: 0.45, // how far up the crown the light sits, 0..1
    lightColor: '#8ee8ff',

    /* --- the throw, the bloom and the hold --- */
    muzzleSize: 0.55, // the puff at the hand as the front leaves it
    muzzleIntensity: 1.5,
    castFlash: 0.08, // screen flash on release
    colorCastFlash: '#cdefff',
    burstSize: 4.0, // the vapour shell thrown off at the bloom, metres
    burstIntensity: 1.1,
    burstShards: 120, // extra chips at the bloom
    burstMist: 70,
    burstGlitter: 140,
    vapourRate: 1.6, // vapour shells shed off the wall while it stands, /s
    vapourSize: 1.4, // radius of one, metres
    vapourIntensity: 0.7,
    impactShake: 0.85,
    shakeDuration: 0.85,
    holdShake: 0.05, // continuous rumble while the crown stands
    impactFlash: 0.2,
    rumble: 0.045, // rumble while the front races out
    colorBurstA: '#a7e6ff',
    colorBurstB: '#cdefff',
    colorBurstC: '#ffffff',
    colorFlash: '#cdefff' // the full-screen flash when it blooms
  },

  /* ------------------------------------------------------------------ */
  /* Camera rig                                                          */
  /* ------------------------------------------------------------------ */
  camera: {
    distance: 14.5,
    minDistance: 0.1, // True 1st-person POV when zoomed in
    maxDistance: 75.0, // Ultra-wide tactical 3rd-person view
    zoomSpeed: 1.2,
    zoomDamping: 0.002,
    minPolar: 0.02,
    maxPolar: 1.54,
    fov: 46,
    targetHeight: 1.35,
    damping: 0.0008,
    autoFrame: 0.35 // how strongly the rig drifts toward an active cast
  },

  /* ------------------------------------------------------------------ */
  /* Environment & lighting (AAA Calibrated Cinematic Lighting)          */
  /* ------------------------------------------------------------------ */
  environment: {
    sunIntensity: 1.4,
    sunColor: '#fff8f0',
    sunAzimuth: 2.85,
    sunElevation: 0.75,
    ambientIntensity: 0.35,
    ambientColor: '#94a3b8',
    hemiIntensity: 0.45,
    hemiSkyColor: '#7dd3fc',
    hemiGroundColor: '#4ade80',
    rimIntensity: 0.6,
    rimColor: '#38bdf8',
    rimAzimuth: 5.45,
    rimElevation: 0.45,
    envIntensity: 0.55,
    backgroundColor: '#070f1e',
    fogEnabled: true,
    fogColor: '#070f1e',
    fogNear: 3500,
    fogFar: 50000,
    shadowBias: -0.0003,
    shadowRadius: 2.4,
    floorColor: '#ffffff',
    floorTint: '#f8fafc',
    floorRoughness: 0.65,
    floorSheen: 0.45,
    floorPool: 0.85,
    floorTexture: false,
    floorTextureScale: 12.0,
    floorNormalScale: 0.85,
    floorTexTint: 0.4,
    dustAmount: 0.85,
    contactShadow: 0.65
  },

  /* ------------------------------------------------------------------ */
  /* Post processing (AAA Calibrated Cinematic Bloom & Tonemapping)      */
  /* ------------------------------------------------------------------ */
  post: {
    enabled: true,
    exposure: 1.0,
    bloomStrength: 0.28,
    bloomRadius: 0.35,
    bloomThreshold: 0.92,
    vignette: 0.42,
    chromaticAberration: 0.10,
    contrast: 1.10,
    saturation: 1.12,
    temperature: 0.02,
    lift: -0.005,
    gain: 1.05,
    grain: 0.02,
    distortion: 0.045,
    flashStrength: 1.0
  },

  /* ------------------------------------------------------------------ */
  /* Blizzard Storm (Slot 7)                                            */
  /* ------------------------------------------------------------------ */
  blizzard: {
    cooldown: 12.0,
    range: 30.0,
    minRange: 0.2,
    speed: 85.0,
    zoneRadius: 5.5,
    castAnim: 'cast3',
    duration: 5.0,
    lightColor: '#7dd3fc',
    lightIntensity: 3.5,
    lightRadius: 9.0,
    colorCore: '#ffffff',
    colorOuter: '#38bdf8',
    colorGlass: '#0e4a66',
    colorEdge: '#ffffff',
    colorPrismA: '#57f0ff',
    colorPrismB: '#8f9bff',
    colorTip: '#ffffff',
    body: 1.37,
    edgePower: 1.14,
    edgeGain: 0.81,
    dispersion: 0.73,
    pipe: 1.09,
    tipBias: 1.6,
    bands: 1.4,
    pulseSpeed: 0.6,
    tipStart: 0.6,
    tipGlow: 1.5,
    stria: 0.75,
    striaScale: 6.0,
    envIntensity: 0.6,
    specular: 2.0,
    glow: 1.0,
    opacity: 1.0,
    birthGlow: 2.2,
    birthFade: 0.5,
    frontRough: 0.35,
    frontWidth: 0.12,
    frontGlow: 2.4,
    shatterScale: 7.0,
    shatterEdge: 0.08,
    shatterGlow: 3.0,
    fieldBoundary: 0.4,
    fieldBoundaryGlow: 2.4,
    fieldFill: 0.26,
    fieldFalloff: 1.4,
    fieldPlates: 1.0,
    fieldPlateScale: 2.2,
    fieldSeam: 0.8,
    fieldFingers: 0.9,
    fieldFingerScale: 1.6,
    fieldWarp: 0.5,
    fieldCrawl: 0.12,
    fieldRings: 2.6,
    fieldRingSpeed: -0.5,
    fieldSweep: 0.4,
    fieldSweepSpeed: 0.12,
    fieldCore: 1.0,
    fieldCoreSize: 0.2,
    fieldPulse: 0.18,
    fieldPulseSpeed: 1.6,
    fieldOpacity: 1.0,
    fieldHeight: 0.03,
    colorField: '#a7e6ff',
    colorFieldEdge: '#ffffff',
    veil: 0.5,
    veilHeight: 1.9,
    veilRadius: 1.02,
    veilFlare: 0.32,
    veilBillow: 0.22,
    veilScale: 1.4,
    veilStretch: 0.5,
    veilFlow: 0.4,
    veilErode: 0.55,
    veilFalloff: 1.8,
    veilSpin: 0.02,
    veilSoftFade: 0.8,
    colorVeil: '#8cd2ff',
    colorVeilCrest: '#ffffff',
    trailFrostRate: 2.2,
    trailFrostRadius: 1.0,
    frostSpread: 1.5,
    frostLife: 7.5,
    frostIntensity: 0.85,
    frostCrystals: 1.5,
    frostCollar: 2.6,
    rimeRate: 3.0,
    rimeRadius: 1.0
  },

  /* ------------------------------------------------------------------ */
  /* Hellfire Cataclysm (Inferno)                                       */
  /* ------------------------------------------------------------------ */
  inferno: {
    range: 30.0,
    minRange: 4.0,
    speed: 35.0,
    cooldown: 16.0,
    zoneRadius: 7.5,
    castAnim: 'cast3',
    damage: 650,
    impactDuration: 0.6,
    fadeDuration: 3.5,
    lightColor: '#ff4400',
    lightIntensity: 6.5,
    lightRadius: 16.0,
    colorCastFlash: '#ffaa00',
    castFlash: 0.3,
    colorFlash: '#ff3300',
    impactFlash: 0.55,
    colorCore: '#ffffff',
    colorFlame: '#ff2200',
    colorDark: '#330500'
  },

  /* ------------------------------------------------------------------ */
  /* Absolute Zero Avalanche (Arthur Ultimate - Slot 9)                 */
  /* ------------------------------------------------------------------ */
  avalanche: {
    range: 35.0,
    minRange: 2.0,
    speed: 50.0,
    cooldown: 15.0,
    zoneRadius: 21.0,
    castAnim: 'cast2',
    damage: 2500,
    lightColor: '#7dd3fc',
    lightIntensity: 12.0,
    lightRadius: 42.0,
    colorCastFlash: '#cffafe',
    colorFlash: '#38bdf8'
  },

  /* ------------------------------------------------------------------ */
  /* Magma Eruption / Fire Blast (Ignis Skill - Slot 0 / Q)              */
  /* ------------------------------------------------------------------ */
  fire_blast: {
    range: 30.0,
    minRange: 2.0,
    speed: 45.0,
    cooldown: 5.5,
    zoneRadius: 6.5,
    castAnim: 'cast1',
    damage: 380,
    lightColor: '#ff5500',
    lightIntensity: 7.0,
    lightRadius: 20.0,
    colorCastFlash: '#ffaa00',
    colorFlash: '#ff4400'
  },

  /* ------------------------------------------------------------------ */
  /* Ace Flame Skills (Fire Fist, Fire Gun, Cross Fire, Dai Entei)      */
  /* ------------------------------------------------------------------ */
  fire_fist: {
    range: 30.0,
    minRange: 2.0,
    speed: 28.0,
    cooldown: 3.5,
    castAnim: 'cast1',
    damage: 480,
    lightColor: '#ff4400',
    lightIntensity: 8.5,
    lightRadius: 24.0,
    colorCastFlash: '#ffee77',
    colorFlash: '#ff3300'
  },
  fire_gun: {
    range: 28.0,
    minRange: 1.5,
    speed: 60.0,
    cooldown: 2.5,
    castAnim: 'cast1',
    damage: 160,
    lightColor: '#ff7700',
    lightIntensity: 5.5,
    lightRadius: 14.0,
    colorCastFlash: '#ffee66',
    colorCastFlash: '#ffee66',
    colorFlash: '#ff5500'
  },
  cross_fire: {
    range: 25.0,
    minRange: 2.0,
    speed: 50.0,
    cooldown: 4.5,
    castAnim: 'cast1',
    damage: 340,
    lightColor: '#ff4400',
    lightIntensity: 6.5,
    lightRadius: 18.0,
    colorCastFlash: '#ffffff',
    colorFlash: '#ff3300'
  },
  fire_pillar: {
    range: 22.0,
    minRange: 2.0,
    speed: 35.0,
    cooldown: 6.0,
    zoneRadius: 5.5,
    castAnim: 'cast2',
    damage: 480,
    lightColor: '#ff5500',
    lightIntensity: 8.0,
    lightRadius: 22.0,
    colorCastFlash: '#ffee66',
    colorFlash: '#ff3700'
  },
  chain_lightning: {
    range: 22.0,
    minRange: 2.0,
    speed: 35.0,
    cooldown: 5.0,
    castAnim: 'cast1',
    damage: 320,
    lightColor: '#fcd34d',
    lightIntensity: 6.0,
    lightRadius: 16.0,
    colorCastFlash: '#ffffff',
    colorFlash: '#fbbf24'
  },
  thunder_judgment: {
    range: 28.0,
    minRange: 3.0,
    speed: 30.0,
    cooldown: 18.0,
    zoneRadius: 7.5,
    castAnim: 'cast2',
    damage: 900,
    lightColor: '#fef08a',
    lightIntensity: 12.0,
    lightRadius: 32.0,
    colorCastFlash: '#ffffff',
    colorFlash: '#f59e0b'
  },
  hellfire: {
    range: 26.0,
    minRange: 3.0,
    speed: 25.0,
    cooldown: 16.0,
    zoneRadius: 8.0,
    castAnim: 'punch',
    damage: 820,
    lightColor: '#ef4444',
    lightIntensity: 10.0,
    lightRadius: 30.0,
    colorCastFlash: '#ffaa00',
    colorFlash: '#ff2200'
  },
  holy_cross: {
    range: 20.0,
    minRange: 2.0,
    speed: 35.0,
    cooldown: 4.5,
    zoneRadius: 6.0,
    castAnim: 'slash',
    damage: 350,
    lightColor: '#fef08a',
    lightIntensity: 7.0,
    lightRadius: 18.0,
    colorCastFlash: '#ffffff',
    colorFlash: '#fde047'
  },
  sanctuary_dome: {
    range: 18.0,
    minRange: 1.0,
    speed: 30.0,
    cooldown: 8.0,
    zoneRadius: 6.5,
    castAnim: 'cast2',
    damage: 200,
    lightColor: '#faf5ff',
    lightIntensity: 8.0,
    lightRadius: 20.0,
    colorCastFlash: '#ffffff',
    colorFlash: '#fef08a'
  },
  divine_judgment: {
    range: 28.0,
    minRange: 3.0,
    speed: 35.0,
    cooldown: 18.0,
    zoneRadius: 9.0,
    castAnim: 'cast3',
    damage: 880,
    lightColor: '#ffffff',
    lightIntensity: 12.0,
    lightRadius: 32.0,
    colorCastFlash: '#ffffff',
    colorFlash: '#fef08a'
  },
  wind_blade: {
    range: 22.0,
    minRange: 2.0,
    speed: 40.0,
    cooldown: 2.5,
    castAnim: 'slash',
    damage: 220,
    lightColor: '#34d399',
    lightIntensity: 5.0,
    lightRadius: 14.0,
    colorCastFlash: '#a7f3d0',
    colorFlash: '#10b981'
  },
  cyclone_burst: {
    range: 20.0,
    minRange: 2.0,
    speed: 30.0,
    cooldown: 4.5,
    castAnim: 'cast1',
    damage: 320,
    lightColor: '#10b981',
    lightIntensity: 6.0,
    lightRadius: 16.0,
    colorCastFlash: '#d1fae5',
    colorFlash: '#059669'
  },
  tornado_vortex: {
    range: 24.0,
    minRange: 3.0,
    speed: 25.0,
    cooldown: 9.0,
    zoneRadius: 7.0,
    castAnim: 'spin',
    damage: 420,
    lightColor: '#059669',
    lightIntensity: 7.0,
    lightRadius: 20.0,
    colorCastFlash: '#a7f3d0',
    colorFlash: '#34d399'
  },
  tempest_catastrophe: {
    range: 28.0,
    minRange: 3.0,
    speed: 28.0,
    cooldown: 18.0,
    zoneRadius: 9.5,
    castAnim: 'cast2',
    damage: 860,
    lightColor: '#6ee7b7',
    lightIntensity: 11.0,
    lightRadius: 32.0,
    colorCastFlash: '#ffffff',
    colorFlash: '#10b981'
  },
  earth_spike: {
    range: 35.0,
    minRange: 2.0,
    speed: 90.0,
    cooldown: 3.0,
    castAnim: 'punch',
    damage: 1500,
    lightColor: '#00f0ff',
    lightIntensity: 8.5,
    lightRadius: 24.0,
    colorCastFlash: '#ffffff',
    colorFlash: '#00f0ff'
  },
  stone_rampart: {
    range: 18.0,
    minRange: 2.0,
    speed: 25.0,
    cooldown: 5.5,
    castAnim: 'slash',
    damage: 280,
    lightColor: '#84cc16',
    lightIntensity: 6.0,
    lightRadius: 16.0,
    colorCastFlash: '#d9f99d',
    colorFlash: '#65a30d'
  },
  earthquake: {
    range: 24.0,
    minRange: 2.5,
    speed: 26.0,
    cooldown: 9.0,
    zoneRadius: 7.5,
    castAnim: 'spin',
    damage: 460,
    lightColor: '#65a30d',
    lightIntensity: 7.5,
    lightRadius: 22.0,
    colorCastFlash: '#bef264',
    colorFlash: '#a3e635'
  },
  gigantic_megalith: {
    range: 28.0,
    minRange: 3.0,
    speed: 25.0,
    cooldown: 20.0,
    zoneRadius: 10.0,
    castAnim: 'cast2',
    damage: 950,
    lightColor: '#bef264',
    lightIntensity: 13.0,
    lightRadius: 35.0,
    colorCastFlash: '#ffffff',
    colorFlash: '#84cc16'
  },
  void_orb: {
    range: 35.0,
    minRange: 2.0,
    speed: 90.0,
    cooldown: 4.0,
    castAnim: 'cast1',
    damage: 1500,
    lightColor: '#c084fc',
    lightIntensity: 8.0,
    lightRadius: 30.0,
    colorCastFlash: '#e9d5ff',
    colorFlash: '#9333ea'
  },
  shadow_grasp: {
    range: 28.0,
    minRange: 2.0,
    speed: 30.0,
    cooldown: 5.0,
    zoneRadius: 20.0,
    castAnim: 'cast2',
    damage: 2200,
    lightColor: '#9333ea',
    lightIntensity: 12.0,
    lightRadius: 40.0,
    colorCastFlash: '#c084fc',
    colorFlash: '#581c87'
  },
  void_singularity: {
    range: 28.0,
    minRange: 3.0,
    speed: 30.0,
    cooldown: 8.0,
    zoneRadius: 16.0,
    castAnim: 'cast2',
    damage: 2800,
    lightColor: '#c084fc',
    lightIntensity: 14.0,
    lightRadius: 36.0,
    colorCastFlash: '#e9d5ff',
    colorFlash: '#9333ea'
  },
  abyss_eruption: {
    range: 35.0,
    minRange: 1.0,
    speed: 35.0,
    cooldown: 25.0,
    zoneRadius: 22.5,
    castAnim: 'cast3',
    damage: 1850,
    lightColor: '#e9d5ff',
    lightIntensity: 14.0,
    lightRadius: 45.0,
    colorCastFlash: '#ffffff',
    colorFlash: '#a855f7'
  }
};

/**
 * How an ability is aimed.
 */
export const CastShape = Object.freeze({
  LINE: 'line',
  ZONE: 'zone'
});

/**
 * Ability ids, in slot order.
 */
export const ELEMENTS = [
  'ice', 'glacier', 'blizzard', 'avalanche',
  'thunder', 'snare', 'chain_lightning', 'thunder_judgment',
  'fire_blast', 'meteor', 'hellfire', 'inferno',
  'fire_fist', 'fire_gun', 'cross_fire', 'fire_pillar', 'dai_entei',
  'beam', 'holy_cross', 'sanctuary_dome', 'divine_judgment',
  'wind_blade', 'cyclone_burst', 'tornado_vortex', 'tempest_catastrophe',
  'earth_spike', 'stone_rampart', 'earthquake', 'gigantic_megalith',
  'void_orb', 'shadow_grasp', 'void_singularity', 'abyss_eruption'
];

/**
 * Registry metadata: how each of the 28 elemental abilities is presented, and how it is aimed.
 */
export const ELEMENT_META = {
  // [1] Arthur / Aokiji - Frost (얼음 속성)
  ice: { label: 'Frost Lance', nameKo: '프로스트 랜스', accent: '#38bdf8', key: 'Q', hint: '직선 관통 냉기 송곳창', cast: CastShape.LINE },
  glacier: { label: 'Glacial Crown', nameKo: '글레이셜 크라운', accent: '#8ee8ff', key: 'E', hint: '원형 빙하 감옥 결계', cast: CastShape.ZONE },
  blizzard: { label: 'Blizzard Storm', nameKo: '블리자드 스톰', accent: '#0ea5e9', key: 'R', hint: '광역 회전 눈보라 폭풍', cast: CastShape.ZONE },
  avalanche: { label: 'Ice Age', nameKo: '아이스 에이지 (氷河時代)', accent: '#67e8f9', key: 'T', hint: '지면을 뚫고 솟구치는 8대 거대 빙하 산맥 초광역 동결', cast: CastShape.ZONE },

  // [2] Raiden / Enel - Lightning (번개 속성)
  thunder: { label: 'Storm Lance', nameKo: '스톰 랜스', accent: '#fbbf24', key: 'Q', hint: '직선 고전압 번개 광선', cast: CastShape.LINE },
  snare: { label: 'Voltaic Snare', nameKo: '볼타익 스네어', accent: '#f59e0b', key: 'E', hint: '전기 파일런 결속 트랩', cast: CastShape.ZONE },
  chain_lightning: { label: 'Lightning Dragon', nameKo: '6천만 볼트 뇌룡 (雷龍)', accent: '#fcd34d', key: 'R', hint: '3D 뇌룡이 포효하며 쇄도하여 집어삼키는 방전 돌격기', cast: CastShape.LINE },
  thunder_judgment: { label: 'Raigo', nameKo: '뇌영 (雷迎 / 2억 볼트)', accent: '#fef08a', key: 'T', hint: '하늘에 형성된 14m 거대 암흑 뇌운 구체 투하 대파멸', cast: CastShape.ZONE },

  // [3] Akainu - Magma (마그마 속성)
  fire_blast: { label: 'Magma Eruption', nameKo: '마그마 이럽션', accent: '#ef4444', key: 'Q', hint: '지면 균열 마그마 분출 및 용암 호수', cast: CastShape.ZONE },
  meteor: { label: 'Cinder Fall', nameKo: '신더 폴 (명구)', accent: '#ea580c', key: 'E', hint: '낙하 거대 화염 마그마 운석', cast: CastShape.LINE },
  hellfire: { label: 'Inugami Guren', nameKo: '견신홍련 (犬噛紅蓮)', accent: '#ef4444', key: 'R', hint: '끓어오르는 3D 마그마 맹견 돌진 물어뜯기', cast: CastShape.LINE },
  inferno: { label: 'Meteor Volcano', nameKo: '유성 화산 (流星火山)', accent: '#b91c1c', key: 'T', hint: '하늘 높이 쏘아올린 20발의 거대 마그마 주먹 폭우', cast: CastShape.ZONE },

  // [4] Ace - Fire (불/화염 속성)
  fire_fist: { label: 'Fire Fist', nameKo: '불주먹 (火拳)', accent: '#ff4500', key: 'Q', hint: '전방으로 돌진하는 거대한 화염 거인 주먹 강타', cast: CastShape.LINE },
  fire_gun: { label: 'Fire Gun', nameKo: '화건 (火銃)', accent: '#ff7700', key: 'Q', hint: '손끝에서 3연속 고속 발사되는 작열 화염 탄환', cast: CastShape.LINE },
  cross_fire: { label: 'Hotarubi', nameKo: '형화 화달마 (螢火)', accent: '#f97316', key: 'E', hint: '24개의 반딧불 도깨비불을 소환하여 일제히 쇄도 폭발', cast: CastShape.LINE },
  fire_pillar: { label: 'Fire Pillar', nameKo: '불기둥 (火柱)', accent: '#ff4500', key: 'R', hint: '하늘 높이 나선 회전하며 솟구치는 거대 화염 기둥', cast: CastShape.ZONE },
  dai_entei: { label: 'Dai Entei', nameKo: '대염계 염제 (大炎戒 炎帝)', accent: '#ffaa00', key: 'T', hint: '3배 거대화된 태양 화염구 투하 & 7초 지속 화염 장판 DoT', cast: CastShape.ZONE },

  // [5] Lumina / Kizaru - Light (빛 속성)
  beam: { label: 'Light Speed Kick', nameKo: '빛의 속도로 차여본 적 있나?', accent: '#fde047', key: 'Q', hint: '광속 순간이동 후 발끝 십자 섬광 킥 & 레이저 대폭발', cast: CastShape.LINE },
  holy_cross: { label: 'Ama no Murakumo', nameKo: '천총운검 (天叢雲剣)', accent: '#fef08a', key: 'E', hint: '3D 황금 광검 소환 참격 및 거대 십자 성흔 폭발', cast: CastShape.ZONE },
  sanctuary_dome: { label: 'Yata no Kagami', nameKo: '야타의 거울 (八咫鏡)', accent: '#faf5ff', key: 'R', hint: '12면체 황금 거울 프리즘 돔 및 광속 굴절 결계', cast: CastShape.ZONE },
  divine_judgment: { label: 'Yasakani no Magatama', nameKo: '팔척경곡옥 (八尺瓊曲玉)', accent: '#ffffff', key: 'T', hint: '24발의 3D 황금빛 곡옥 광탄 융단폭격', cast: CastShape.ZONE },

  // [6] Tesla / Dragon - Wind (바람 속성)
  wind_blade: { label: 'Wind Blade', nameKo: '윈드 블레이드', accent: '#34d399', key: 'Q', hint: '날카로운 초승달 진공 칼바람 검기', cast: CastShape.LINE },
  cyclone_burst: { label: 'Dragon Breath', nameKo: '용의 숨결 (龍の息吹)', accent: '#10b981', key: 'E', hint: '포효하는 3D 에메랄드 용 머리 형상의 돌풍 파동포', cast: CastShape.LINE },
  tornado_vortex: { label: 'Storm Prison', nameKo: '돌풍 감옥 (突風監獄)', accent: '#059669', key: 'R', hint: '8개의 고속 회전 돌풍 기둥 결계로 적들을 공중에 띄움', cast: CastShape.ZONE },
  tempest_catastrophe: { label: 'Revolution Tempest', nameKo: '혁명의 천벌 (革命の天罰)', accent: '#6ee7b7', key: 'T', hint: '초대형 용오름과 천둥번개가 결합된 천재지변 폭풍우', cast: CastShape.ZONE },

  // [7] Boreas / Whitebeard - Earth/Vibration (대지/진동 속성)
  earth_spike: { label: 'Air Quake', nameKo: '대기 파쇄 (空氣破壞)', accent: '#a3e635', key: 'Q', hint: '주먹으로 대기를 때려 공간 균열을 가르는 전방 진동 충격파', cast: CastShape.LINE },
  stone_rampart: { label: 'Murakumo Slash', nameKo: '무라쿠모 참격 (薙刀 斬擊)', accent: '#84cc16', key: 'E', hint: '최상명검 나기나타를 휘둘러 대지를 가르는 패왕색 검기', cast: CastShape.LINE },
  earthquake: { label: 'Island Shaker', nameKo: '지진 해진 (島搖 震天動地)', accent: '#65a30d', key: 'R', hint: '지면을 양손으로 잡고 뒤흔들어 6방향 지각 융기 & 천지진동', cast: CastShape.ZONE },
  gigantic_megalith: { label: 'Heaven Splitter', nameKo: '일기당천 (一騎當千)', accent: '#bef264', key: 'T', hint: '하늘과 대기를 동시에 파쇄하는 거대 패왕색 공간 대붕괴', cast: CastShape.ZONE },

  // [8] Sera / Blackbeard - Dark/Void (어둠/심연 속성)
  void_orb: { label: 'Kurouzu', nameKo: '암수 (闇水 / 쿠로우즈)', accent: '#c084fc', key: 'Q', hint: '소용돌이치는 어둠의 인력으로 적들을 강제로 끌어당기며 타격', cast: CastShape.LINE },
  shadow_grasp: { label: 'Black Hole', nameKo: '블랙홀 (暗穴道 / 흑암 늪지)', accent: '#9333ea', key: 'E', hint: '바닥을 칠흑의 어둠 늪으로 뒤덮어 적을 가두고 어둠 속으로 완전히 침강 소멸', cast: CastShape.ZONE },
  void_singularity: { label: 'Liberation', nameKo: '해방 (解放 / 리버레이션)', accent: '#e9d5ff', key: 'R', hint: '[블랙홀]로 삼킨 마을의 파편과 적들을 하늘 높이 토해내 전방에 폭포수 융단폭격 대폭발 & 기절', cast: CastShape.ZONE },
  abyss_eruption: { label: 'Dark Domain (ROOM)', nameKo: '흑암 성역 (ROOM / 7초 결계)', accent: '#a855f7', key: 'T', hint: '직경 45m 암흑 돔 룸 생성! 7초간 내부 적 시야차단 & 스킬 완전봉인 & 탈출불가! 종료 시 초신성 대폭발 피날레', cast: CastShape.ZONE }
};

/** How the given ability is aimed. Line unless its metadata says otherwise. */
export function castShapeOf(element) {
  return ELEMENT_META[element]?.cast ?? CastShape.LINE;
}

/** The footprint a far cast will cover, metres. 0 for a line cast. */
export function zoneRadiusOf(element) {
  return castShapeOf(element) === CastShape.ZONE ? (settings[element]?.zoneRadius ?? 0) : 0;
}

/** Immutable snapshot used by "Reset to defaults" and the preset system. */
export const DEFAULT_SETTINGS = structuredClone(settings);

/**
 * Deep-merge a plain object into `settings` in place.
 * Existing object identity is preserved so every live binding keeps working.
 */
export function applySettings(patch, target = settings) {
  for (const key of Object.keys(patch)) {
    const value = patch[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (target[key] && typeof target[key] === 'object') applySettings(value, target[key]);
    } else if (key in target) {
      target[key] = value;
    }
  }
  return target;
}

/** Restore every value to the shipped defaults (in place). */
export function resetSettings() {
  applySettings(structuredClone(DEFAULT_SETTINGS));
}

/** Serialisable clone of the current state. */
export function snapshotSettings() {
  return structuredClone(settings);
}

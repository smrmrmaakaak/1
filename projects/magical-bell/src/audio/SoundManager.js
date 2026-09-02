/**
 * High-Fidelity Zero-Dependency Procedural Web Audio API Sound Engine.
 * Synthesizes dynamic combat SFX, spell casting, critical impacts, shatter bursts, and monster roars in real-time.
 */
export class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.enabled = true;

    // User gesture unlock listener
    const unlockAudio = () => {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.value = 0.45;
          this.masterGain.connect(this.ctx.destination);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { once: false });
    window.addEventListener('keydown', unlockAudio, { once: false });
  }

  /**
   * 1. Cast Sound (Frost Lance, Thunder Bolt, Meteor, Ultimate)
   */
  playCast(type = 'ice') {
    if (!this.ctx || !this.enabled) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);

    if (type === 'ice' || type === 'glacier' || type === 'blizzard' || type === 'avalanche') {
      // High-pass shimmer whistle swoosh
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(1760, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.35);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.35);
    } else if (type === 'thunder' || type === 'snare') {
      // Electric crackle saw
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.linearRampToValueAtTime(80, t + 0.25);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    } else {
      // Fire / Meteor whoosh low rumble
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.1);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.45);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.45);
      osc.start(t);
      osc.stop(t + 0.45);
    }
  }

  /**
   * 2. Hit Impact & Punchy Bass
   */
  playHit(isCrit = false) {
    if (!this.ctx || !this.enabled) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = isCrit ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isCrit ? 380 : 160, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + (isCrit ? 0.25 : 0.15));

    gain.gain.setValueAtTime(isCrit ? 0.55 : 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + (isCrit ? 0.25 : 0.15));

    osc.start(t);
    osc.stop(t + (isCrit ? 0.25 : 0.15));
  }

  /**
   * 3. Glass / Ice Crystal Shatter Sound (Shatter Burst)
   */
  playShatter() {
    if (!this.ctx || !this.enabled) return;

    const t = this.ctx.currentTime;
    const notes = [1320, 1760, 2200, 3100];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.02);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, t + 0.35 + idx * 0.02);

      gain.gain.setValueAtTime(0.25, t + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35 + idx * 0.02);

      osc.start(t + idx * 0.02);
      osc.stop(t + 0.4);
    });
  }

  /**
   * 4. Level Up Fanfare
   */
  playLevelUp() {
    if (!this.ctx || !this.enabled) return;

    const t = this.ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio

    chords.forEach((note, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, t + i * 0.1);

      gain.gain.setValueAtTime(0.3, t + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.4);

      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.45);
    });
  }
}

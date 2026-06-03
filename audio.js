/* ==========================================
   JADE ASCENT: PROCEDURAL AUDIO ENGINE
   ========================================== */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = true;
    this.bgmInterval = null;
    this.currentZone = 1;
    this.bgmTempo = 240; // milliseconds per beat
    this.pentatonicScales = {
      // Traditional Chinese pentatonic scales (Hz)
      1: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25], // Gong scale (C Major Pentatonic: C4, D4, E4, G4, A4, C5)
      2: [329.63, 392.00, 440.00, 523.25, 587.33, 659.25], // Zhi scale (E4, G4, A4, C5, D5, E5 - airy clouds)
      3: [196.00, 220.00, 261.63, 293.66, 392.00, 440.00]  // Yu scale (Low G3, A3, C4, D4, G4, A4 - deep space)
    };
    this.bgmSequenceStep = 0;
  }

  init() {
    if (this.ctx) return;
    
    // Create AudioContext (vendor prefixed for older Safari)
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Create master volume node
    this.masterVolume = this.ctx.createGain();
    this.masterVolume.gain.setValueAtTime(this.muted ? 0 : 0.4, this.ctx.currentTime);
    this.masterVolume.connect(this.ctx.destination);
    
    // Start BGM loop
    this.startBGM();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const targetGain = this.muted ? 0 : 0.4;
      this.masterVolume.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }
    return this.muted;
  }

  setZone(zone) {
    if (zone >= 1 && zone <= 3) {
      this.currentZone = zone;
    }
  }

  // --- INSTRUMENT SYNTHESISERS ---

  /**
   * Synthesizes a traditional Guzheng (Chinese Zither) pluck.
   * A pluck is made by combining a sharp attack, quick decay, 
   * and physical-modeling-like pluck feedback using sine waves 
   * with high-frequency harmonics that decay faster.
   */
  pluckGuzheng(freq, time = 0, volume = 0.5) {
    if (!this.ctx || this.muted) return;
    
    const now = this.ctx.currentTime + time;
    
    // Primary oscillator (fundamental frequency)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);
    
    // Harmonic oscillator (creates the bright metallic "tang" of Guzheng)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 2, now); // Octave harmonic
    
    // Subtle vibrato (simulates the finger bending the string)
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(6, now); // 6Hz vibrato
    lfoGain.gain.setValueAtTime(freq * 0.008, now); // depth
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);
    
    // Filter to soften the harsh sawtooth and create string response
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 1.2);
    filter.Q.setValueAtTime(2, now);
    
    // Envelopes
    // Fundamental: short attack, long ring-out
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(volume * 0.6, now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    
    // Harmonic: very sharp attack, extremely quick decay
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(volume * 0.4, now + 0.005);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    
    // Connect nodes
    osc1.connect(gain1);
    osc2.connect(gain2);
    
    gain1.connect(filter);
    gain2.connect(filter);
    
    filter.connect(this.masterVolume);
    
    // Play & cleanup
    lfo.start(now);
    osc1.start(now);
    osc2.start(now);
    
    lfo.stop(now + 1.6);
    osc1.stop(now + 1.6);
    osc2.stop(now + 1.6);
  }

  /**
   * Resonant ancient Gong sound for Checkpoints.
   * Uses low sine & triangle waves with pitch bending and metallic ringing.
   */
  playGong() {
    if (!this.ctx || this.muted) return;
    
    const now = this.ctx.currentTime;
    const baseFreq = 100; // Low resonant note
    
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);
    // Subtle detune over time
    osc1.frequency.linearRampToValueAtTime(baseFreq * 0.98, now + 3);
    
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 1.5, now); // Fifth harmonic
    
    const osc3 = this.ctx.createOscillator();
    const gain3 = this.ctx.createGain();
    osc3.type = 'sawtooth';
    osc3.frequency.setValueAtTime(baseFreq * 2.2, now); // Metallic disharmony
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 3);
    filter.Q.setValueAtTime(4, now);

    // Envelopes: Gong starts with explosive bang, decays slowly
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.7, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
    
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.4, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    gain3.gain.setValueAtTime(0, now);
    gain3.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);
    
    gain1.connect(filter);
    gain2.connect(filter);
    gain3.connect(filter);
    
    filter.connect(this.masterVolume);
    
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    
    osc1.stop(now + 3.2);
    osc2.stop(now + 2.2);
    osc3.stop(now + 0.5);
  }

  // --- SOUND EFFECTS ---

  playJump() {
    // Jump sound is a quick upward double-pluck of Guzheng notes
    const scale = this.pentatonicScales[this.currentZone];
    // Select a note depending on current zone
    const note = scale[2]; // Mid note
    this.pluckGuzheng(note, 0, 0.4);
    this.pluckGuzheng(note * 1.5, 0.06, 0.25); // quick fifth harmonic pluck
  }

  playCollect() {
    if (!this.ctx || this.muted) return;
    
    // Crisp jade shard chime sound (two high overlapping sine waves)
    const now = this.ctx.currentTime;
    const notes = [1200, 1500]; // Very high chimes
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      
      gain.gain.setValueAtTime(0, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.04 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.4);
      
      osc.connect(gain);
      gain.connect(this.masterVolume);
      
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.5);
    });
  }

  playFall() {
    if (!this.ctx || this.muted) return;
    
    // Sliding downward pitch sweep (despair of falling)
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.8);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    
    osc.connect(gain);
    gain.connect(this.masterVolume);
    
    osc.start(now);
    osc.stop(now + 0.9);
  }

  playDamage() {
    if (!this.ctx || this.muted) return;

    // A low detuned buzzer sound for damage
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(120, now);
    
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(122, now); // slightly detuned
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterVolume);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  playDefeat() {
    if (!this.ctx || this.muted) return;
    
    // Play a sad descending pentatonic melody
    const scale = this.pentatonicScales[1]; // C major pentatonic
    const notes = [scale[4], scale[3], scale[2], scale[1], scale[0]];
    
    notes.forEach((freq, idx) => {
      this.pluckGuzheng(freq / 2, idx * 0.15, 0.4); // Descending and lower octave
    });
  }

  playWin() {
    if (!this.ctx || this.muted) return;
    
    // Play a glorious pentatonic ascending flourish
    const scale = this.pentatonicScales[1]; // C major pentatonic
    const notes = [scale[0], scale[1], scale[2], scale[3], scale[4], scale[5], scale[0]*2, scale[2]*2];
    
    notes.forEach((freq, idx) => {
      // Stagger plucks
      this.pluckGuzheng(freq, idx * 0.12, 0.5);
    });
  }

  // --- BACKGROUND MUSIC ENGINE ---

  startBGM() {
    if (this.bgmInterval) clearInterval(this.bgmInterval);
    
    // A simple step sequencer to play soothing backgrounds
    this.bgmInterval = setInterval(() => {
      if (this.muted || !this.ctx) return;
      
      const scale = this.pentatonicScales[this.currentZone];
      
      // Basic 8-step melody generation
      const step = this.bgmSequenceStep % 16;
      
      // Determine what to play on this step
      if (step === 0) {
        // Root chord/note
        this.pluckGuzheng(scale[0] / 2, 0, 0.4); // Bass support
        this.pluckGuzheng(scale[2], 0.02, 0.3);
      } else if (step === 4) {
        this.pluckGuzheng(scale[3], 0, 0.3);
      } else if (step === 8) {
        this.pluckGuzheng(scale[1] / 2, 0, 0.4); // Alternate Bass
        this.pluckGuzheng(scale[4], 0.02, 0.3);
      } else if (step === 12) {
        this.pluckGuzheng(scale[2], 0, 0.3);
      } else if (step % 2 === 0) {
        // Random melody notes on semi-beats to sound organic
        if (Math.random() > 0.45) {
          const randomNoteIndex = Math.floor(Math.random() * scale.length);
          const volume = 0.15 + Math.random() * 0.15;
          this.pluckGuzheng(scale[randomNoteIndex], 0, volume);
        }
      }
      
      this.bgmSequenceStep++;
    }, this.bgmTempo);
  }
}

// Instantiate globally so it can be referenced in game.js
window.audio = new AudioEngine();

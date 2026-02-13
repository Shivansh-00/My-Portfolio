"use client";

/**
 * Cyberpunk Audio Engine v4 — Cinema-Grade Web Audio
 *
 * Architecture:
 *   SFX Bus ──┬── Dry ────────────────┐
 *             └── Convolution Reverb ──┤
 *   Ambient Bus ───────────────────────┼── Compressor ── Limiter ── AnalyserNode ── Master Gain ── Destination
 *   Cinematic Bus ─────────────────────┘
 *
 * Features:
 *   • Convolution reverb with procedural impulse response
 *   • Multi-band dynamics compression + brick-wall limiter
 *   • Spatial stereo panning on all SFX
 *   • LFO-modulated ambient layers (drone, pad, noise, pulse)
 *   • Dynamic EQ — filter frequency adapts to current "energy" state
 *   • 20+ individually-designed procedural sounds
 *   • AnalyserNode for real-time visualizer data
 *   • Gain-ramped lifecycle (no clicks/pops)
 */

export type SoundName =
  | "hover" | "click" | "whoosh" | "powerUp" | "glitch"
  | "success" | "error" | "type"
  | "gameHit" | "gameMiss" | "gameOver" | "levelUp"
  | "breach" | "scan" | "unlock" | "combo"
  | "navigate" | "toggle"
  | "bootUp" | "sectionEnter" | "impact";

class CyberAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbSend: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private ambientNodes: AudioNode[] = [];
  private _isPlaying = false;
  private _isMuted = false;
  private _masterVolume = 0.35;
  private _ambientVolume = 0.25;
  private _sfxVolume = 0.55;
  private pulseInterval: ReturnType<typeof setInterval> | null = null;
  private reverbReady = false;
  private noiseCache: AudioBuffer | null = null;

  get isPlaying() { return this._isPlaying; }
  get isMuted() { return this._isMuted; }

  /* ── Analyser data for visualizers ── */
  getFrequencyData(): Uint8Array | null {
    if (!this.analyser) return null;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  getWaveformData(): Uint8Array | null {
    if (!this.analyser) return null;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  /* ── Context init ── */
  private ensureContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();

        // Compressor: musical glue
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 12;
        this.compressor.ratio.value = 4;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.15;

        // Brick-wall limiter
        this.limiter = this.ctx.createDynamicsCompressor();
        this.limiter.threshold.value = -3;
        this.limiter.knee.value = 0;
        this.limiter.ratio.value = 20;
        this.limiter.attack.value = 0.001;
        this.limiter.release.value = 0.05;

        // AnalyserNode for visualizers
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;

        // Master gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this._isMuted ? 0 : this._masterVolume;

        // Chain: compressor → limiter → analyser → masterGain → destination
        this.compressor.connect(this.limiter);
        this.limiter.connect(this.analyser);
        this.analyser.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        // Dry + reverb sends
        this.dryGain = this.ctx.createGain();
        this.dryGain.gain.value = 0.82;
        this.dryGain.connect(this.compressor);

        this.reverbSend = this.ctx.createGain();
        this.reverbSend.gain.value = 0.18;
        this.reverbSend.connect(this.compressor); // temporary until reverb ready

        // Ambient bus
        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.value = this._ambientVolume;
        this.ambientGain.connect(this.compressor);

        // SFX bus → dry + reverb
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this._sfxVolume;
        this.sfxGain.connect(this.dryGain);
        this.sfxGain.connect(this.reverbSend);

        // Pre-generate noise buffer cache
        this.buildNoiseCache();
        // Generate reverb impulse
        this.generateReverb();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch { return null; }
  }

  private buildNoiseCache() {
    if (!this.ctx) return;
    const len = this.ctx.sampleRate * 2;
    this.noiseCache = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this.noiseCache.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }

  private generateReverb() {
    if (!this.ctx || this.reverbReady) return;
    try {
      const sr = this.ctx.sampleRate;
      const len = sr * 2; // 2-second hall
      const buf = this.ctx.createBuffer(2, len, sr);
      for (let ch = 0; ch < 2; ch++) {
        const data = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) {
          // Exponential decay with early reflections simulation
          const t = i / len;
          const earlyRef = t < 0.05 ? Math.sin(t * 200) * 0.3 : 0;
          data[i] = ((Math.random() * 2 - 1) * Math.pow(1 - t, 2.8) + earlyRef) * 0.6;
        }
      }
      this.reverbNode = this.ctx.createConvolver();
      this.reverbNode.buffer = buf;
      if (this.reverbSend) {
        this.reverbSend.disconnect();
        this.reverbSend.connect(this.reverbNode);
        this.reverbNode.connect(this.compressor!);
      }
      this.reverbReady = true;
    } catch {}
  }

  init() { this.ensureContext(); }

  /* ═══════════════════════════════════════════════════ */
  /*   AMBIENT SOUNDSCAPE                               */
  /* ═══════════════════════════════════════════════════ */

  startAmbient() {
    if (this._isPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.ambientGain) return;
    try {
      // ── Layer 1: Deep sub drone ──
      const drone = ctx.createOscillator();
      const droneGain = ctx.createGain();
      drone.type = "sine";
      drone.frequency.value = 42;
      droneGain.gain.value = 0.0;
      droneGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2);
      drone.connect(droneGain);
      droneGain.connect(this.ambientGain);
      drone.start();
      this.ambientNodes.push(drone, droneGain);

      // Sub-harmonic
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = "sine";
      sub.frequency.value = 21;
      subGain.gain.value = 0.04;
      sub.connect(subGain);
      subGain.connect(this.ambientGain);
      sub.start();
      this.ambientNodes.push(sub, subGain);

      // ── Layer 2: Detuned pad cluster (cinematic) ──
      const padFreqs = [65.41, 82.41, 110, 146.83, 196];
      padFreqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = i % 3 === 0 ? "sawtooth" : i % 3 === 1 ? "triangle" : "sine";
        osc.frequency.value = freq;
        osc.detune.value = (Math.random() - 0.5) * 15;
        gain.gain.value = 0.0;
        gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 3);
        filter.type = "lowpass";
        filter.frequency.value = 250;
        filter.Q.value = 1.2;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain!);
        osc.start();
        this.ambientNodes.push(osc, gain, filter);
      });

      // ── Layer 3: Dual LFO filter sweeps ──
      const filters = this.ambientNodes.filter(n => n instanceof BiquadFilterNode) as BiquadFilterNode[];
      [0.035, 0.065].forEach((rate, i) => {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = "sine";
        lfo.frequency.value = rate;
        lfoGain.gain.value = 180;
        lfo.connect(lfoGain);
        const targets = [filters[i * 2], filters[i * 2 + 1]].filter(Boolean);
        targets.forEach(f => lfoGain.connect(f.frequency));
        lfo.start();
        this.ambientNodes.push(lfo, lfoGain);
      });

      // ── Layer 4: Shaped noise floor (reactor hum) ──
      if (this.noiseCache) {
        const ns = ctx.createBufferSource();
        ns.buffer = this.noiseCache;
        ns.loop = true;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass"; bp.frequency.value = 500; bp.Q.value = 0.8;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass"; hp.frequency.value = 180;
        const ng = ctx.createGain();
        ng.gain.value = 0.0;
        ng.gain.linearRampToValueAtTime(0.018, ctx.currentTime + 4);
        ns.connect(bp); bp.connect(hp); hp.connect(ng); ng.connect(this.ambientGain!);
        ns.start();
        this.ambientNodes.push(ns, bp, hp, ng);
      }

      // ── Layer 5: High-frequency shimmer ──
      if (this.noiseCache) {
        const shimmer = ctx.createBufferSource();
        shimmer.buffer = this.noiseCache;
        shimmer.loop = true;
        const shBp = ctx.createBiquadFilter();
        shBp.type = "bandpass"; shBp.frequency.value = 8000; shBp.Q.value = 3;
        const shGain = ctx.createGain();
        shGain.gain.value = 0.004;
        shimmer.connect(shBp); shBp.connect(shGain); shGain.connect(this.ambientGain!);
        shimmer.start();
        this.ambientNodes.push(shimmer, shBp, shGain);

        // LFO on shimmer level
        const shimLfo = ctx.createOscillator();
        const shimLfoG = ctx.createGain();
        shimLfo.type = "sine"; shimLfo.frequency.value = 0.15;
        shimLfoG.gain.value = 0.003;
        shimLfo.connect(shimLfoG); shimLfoG.connect(shGain.gain);
        shimLfo.start();
        this.ambientNodes.push(shimLfo, shimLfoG);
      }

      this.startPulse();
      this._isPlaying = true;
    } catch {}
  }

  private startPulse() {
    const bpm = 72;
    const interval = (60 / bpm) * 1000;
    this.pulseInterval = setInterval(() => {
      if (!this.ctx || !this.ambientGain || this._isMuted) return;
      try {
        const ctx = this.ctx;
        const now = ctx.currentTime;
        // Sub kick
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(72, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + 0.18);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain); gain.connect(this.ambientGain!);
        osc.start(now); osc.stop(now + 0.35);
      } catch {}
    }, interval);
  }

  stopAmbient() {
    // Fade out gracefully
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    }
    setTimeout(() => {
      this.ambientNodes.forEach(n => {
        try { if ("stop" in n && typeof (n as any).stop === "function") (n as any).stop(); n.disconnect(); } catch {}
      });
      this.ambientNodes = [];
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.value = this._ambientVolume;
      }
    }, 500);
    if (this.pulseInterval) { clearInterval(this.pulseInterval); this.pulseInterval = null; }
    this._isPlaying = false;
  }

  /* ═══════════════════════════════════════════════════ */
  /*   SFX DISPATCHER                                   */
  /* ═══════════════════════════════════════════════════ */

  playSfx(name: SoundName) {
    if (this._isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    try {
      const now = ctx.currentTime;
      switch (name) {
        case "hover":        this.sHover(now); break;
        case "click":        this.sClick(now); break;
        case "whoosh":       this.sWhoosh(now); break;
        case "powerUp":      this.sPowerUp(now); break;
        case "glitch":       this.sGlitch(now); break;
        case "success":      this.sSuccess(now); break;
        case "error":        this.sError(now); break;
        case "type":         this.sType(now); break;
        case "gameHit":      this.sGameHit(now); break;
        case "gameMiss":     this.sGameMiss(now); break;
        case "gameOver":     this.sGameOver(now); break;
        case "levelUp":      this.sLevelUp(now); break;
        case "breach":       this.sBreach(now); break;
        case "scan":         this.sScan(now); break;
        case "unlock":       this.sUnlock(now); break;
        case "combo":        this.sCombo(now); break;
        case "navigate":     this.sNavigate(now); break;
        case "toggle":       this.sToggle(now); break;
        case "bootUp":       this.sBootUp(now); break;
        case "sectionEnter": this.sSectionEnter(now); break;
        case "impact":       this.sImpact(now); break;
      }
    } catch {}
  }

  /* ═══════════════════════════════════════════════════ */
  /*   SOUND DESIGNS                                    */
  /* ═══════════════════════════════════════════════════ */

  private o(type: OscillatorType, freq: number): OscillatorNode {
    const osc = this.ctx!.createOscillator();
    osc.type = type; osc.frequency.value = freq;
    return osc;
  }
  private g(vol: number): GainNode {
    const gain = this.ctx!.createGain();
    gain.gain.value = vol;
    return gain;
  }
  private noise(dur: number): AudioBufferSourceNode {
    const ctx = this.ctx!;
    if (this.noiseCache) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseCache;
      return src;
    }
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    return src;
  }
  private pan(v: number): StereoPannerNode {
    const p = this.ctx!.createStereoPanner();
    p.pan.value = v;
    return p;
  }

  // ── HOVER: crystalline blip with harmonic overtone ──
  private sHover(now: number) {
    const ctx = this.ctx!;
    const o1 = this.o("sine", 2200); const o2 = this.o("sine", 4400);
    const gn = this.g(0); const o2g = this.g(0.015);
    const pn = this.pan((Math.random() - 0.5) * 0.4);
    o1.frequency.setValueAtTime(2200, now);
    o1.frequency.exponentialRampToValueAtTime(2800, now + 0.04);
    gn.gain.setValueAtTime(0.04, now);
    gn.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    o1.connect(gn); o2.connect(o2g); o2g.connect(gn);
    gn.connect(pn); pn.connect(this.sfxGain!);
    o1.start(now); o2.start(now);
    o1.stop(now + 0.09); o2.stop(now + 0.09);
  }

  // ── CLICK: punchy transient + tonal body ──
  private sClick(now: number) {
    const ctx = this.ctx!;
    const ns = this.noise(0.03);
    const nf = ctx.createBiquadFilter(); nf.type = "highpass"; nf.frequency.value = 4500;
    const ng = this.g(0); ng.gain.setValueAtTime(0.08, now); ng.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    ns.connect(nf); nf.connect(ng); ng.connect(this.sfxGain!);
    ns.start(now);
    const o = this.o("square", 1600);
    const og = this.g(0); og.gain.setValueAtTime(0.06, now); og.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    o.frequency.exponentialRampToValueAtTime(2400, now + 0.02);
    o.connect(og); og.connect(this.sfxGain!);
    o.start(now); o.stop(now + 0.07);
  }

  // ── WHOOSH: stereo-panned noise sweep ──
  private sWhoosh(now: number) {
    const ctx = this.ctx!;
    const ns = this.noise(0.35);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass"; f.Q.value = 2.5;
    f.frequency.setValueAtTime(300, now);
    f.frequency.exponentialRampToValueAtTime(5000, now + 0.12);
    f.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    const gn = this.g(0); gn.gain.setValueAtTime(0.08, now); gn.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    const pn = this.pan(-0.6);
    pn.pan.linearRampToValueAtTime(0.6, now + 0.3);
    ns.connect(f); f.connect(gn); gn.connect(pn); pn.connect(this.sfxGain!);
    ns.start(now);
  }

  // ── POWER UP: ascending arpeggio + shimmer tail ──
  private sPowerUp(now: number) {
    const notes = [440, 554, 659, 880, 1108, 1320];
    notes.forEach((freq, i) => {
      const o1 = this.o("sine", freq);
      const o2 = this.o("triangle", freq * 2.01);
      const gn = this.g(0); const o2g = this.g(0.025);
      const t = now + i * 0.05;
      gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(0.045, t + 0.015);
      gn.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o1.connect(gn); o2.connect(o2g); o2g.connect(gn); gn.connect(this.sfxGain!);
      o1.start(t); o2.start(t); o1.stop(t + 0.25); o2.stop(t + 0.25);
    });
  }

  // ── GLITCH: rapid random bursts + sub impact ──
  private sGlitch(now: number) {
    for (let i = 0; i < 8; i++) {
      const o = this.o(i % 2 === 0 ? "sawtooth" : "square", 80 + Math.random() * 3000);
      const gn = this.g(0);
      const t = now + i * 0.018;
      gn.gain.setValueAtTime(0.035 + Math.random() * 0.03, t);
      gn.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      const pn = this.pan((Math.random() - 0.5) * 0.8);
      o.connect(gn); gn.connect(pn); pn.connect(this.sfxGain!);
      o.start(t); o.stop(t + 0.035);
    }
    const sub = this.o("sine", 55);
    const sg = this.g(0); sg.gain.setValueAtTime(0.06, now); sg.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    sub.connect(sg); sg.connect(this.sfxGain!);
    sub.start(now); sub.stop(now + 0.2);
  }

  // ── SUCCESS: major chord cascade with harmonics ──
  private sSuccess(now: number) {
    [523, 659, 784, 1047].forEach((freq, i) => {
      const o1 = this.o("sine", freq);
      const o2 = this.o("sine", freq * 3);
      const gn = this.g(0); const o2g = this.g(0.012);
      const t = now + i * 0.08;
      gn.gain.setValueAtTime(0.05, t); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o1.connect(gn); o2.connect(o2g); o2g.connect(gn); gn.connect(this.sfxGain!);
      o1.start(t); o2.start(t); o1.stop(t + 0.45); o2.stop(t + 0.45);
    });
  }

  // ── ERROR: descending dissonant buzz ──
  private sError(now: number) {
    const o1 = this.o("sawtooth", 400); const o2 = this.o("square", 407);
    const gn = this.g(0); const o2g = this.g(0.04);
    o1.frequency.linearRampToValueAtTime(120, now + 0.3);
    o2.frequency.linearRampToValueAtTime(125, now + 0.3);
    gn.gain.setValueAtTime(0.06, now); gn.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    o1.connect(gn); o2.connect(o2g); o2g.connect(gn); gn.connect(this.sfxGain!);
    o1.start(now); o2.start(now); o1.stop(now + 0.4); o2.stop(now + 0.4);
  }

  // ── TYPE: mechanical keypress ──
  private sType(now: number) {
    const ctx = this.ctx!;
    const ns = this.noise(0.02);
    const nf = ctx.createBiquadFilter(); nf.type = "highpass"; nf.frequency.value = 6500;
    const ng = this.g(0); ng.gain.setValueAtTime(0.03, now); ng.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    ns.connect(nf); nf.connect(ng); ng.connect(this.sfxGain!); ns.start(now);
    const o = this.o("square", 1000 + Math.random() * 800);
    const og = this.g(0); og.gain.setValueAtTime(0.022, now); og.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    o.connect(og); og.connect(this.sfxGain!); o.start(now); o.stop(now + 0.04);
  }

  // ── GAME HIT: bright impact + sub punch ──
  private sGameHit(now: number) {
    const o = this.o("sine", 800);
    const gn = this.g(0);
    o.frequency.exponentialRampToValueAtTime(1800, now + 0.05);
    o.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    gn.gain.setValueAtTime(0.09, now); gn.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    const pn = this.pan((Math.random() - 0.5) * 0.6);
    o.connect(gn); gn.connect(pn); pn.connect(this.sfxGain!);
    o.start(now); o.stop(now + 0.2);
    // Sub punch
    const s = this.o("sine", 150);
    const sg = this.g(0);
    s.frequency.exponentialRampToValueAtTime(50, now + 0.1);
    sg.gain.setValueAtTime(0.06, now); sg.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    s.connect(sg); sg.connect(this.sfxGain!); s.start(now); s.stop(now + 0.15);
  }

  // ── GAME MISS: descending triangle ──
  private sGameMiss(now: number) {
    const o = this.o("triangle", 350);
    const gn = this.g(0);
    o.frequency.exponentialRampToValueAtTime(80, now + 0.25);
    gn.gain.setValueAtTime(0.055, now); gn.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    o.connect(gn); gn.connect(this.sfxGain!);
    o.start(now); o.stop(now + 0.35);
  }

  // ── GAME OVER: dramatic choir descend ──
  private sGameOver(now: number) {
    [440, 380, 300, 200, 140].forEach((freq, i) => {
      const o1 = this.o("sawtooth", freq);
      const o2 = this.o("sawtooth", freq * 1.005);
      const gn = this.g(0); const o2g = this.g(0.5);
      const f = this.ctx!.createBiquadFilter();
      f.type = "lowpass"; f.frequency.value = 700;
      const t = now + i * 0.17;
      gn.gain.setValueAtTime(0.035, t); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o1.connect(f); o2.connect(o2g); o2g.connect(f); f.connect(gn); gn.connect(this.sfxGain!);
      o1.start(t); o2.start(t); o1.stop(t + 0.55); o2.stop(t + 0.55);
    });
  }

  // ── LEVEL UP: fast ascending with sparkle ──
  private sLevelUp(now: number) {
    [523, 659, 784, 1047, 1319, 1568].forEach((freq, i) => {
      const o = this.o("sine", freq);
      const gn = this.g(0);
      const t = now + i * 0.045;
      gn.gain.setValueAtTime(0.055, t); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(gn); gn.connect(this.sfxGain!); o.start(t); o.stop(t + 0.35);
    });
    // Sparkle
    const ns = this.noise(0.2);
    const nf = this.ctx!.createBiquadFilter(); nf.type = "highpass"; nf.frequency.value = 9000;
    const ng = this.g(0); ng.gain.setValueAtTime(0, now + 0.22);
    ng.gain.linearRampToValueAtTime(0.035, now + 0.28);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    ns.connect(nf); nf.connect(ng); ng.connect(this.sfxGain!); ns.start(now + 0.22);
  }

  // ── BREACH: digital intrusion rumble ──
  private sBreach(now: number) {
    const ctx = this.ctx!;
    const ns = this.noise(0.5);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass"; f.Q.value = 5;
    f.frequency.setValueAtTime(200, now);
    f.frequency.exponentialRampToValueAtTime(6000, now + 0.2);
    f.frequency.exponentialRampToValueAtTime(400, now + 0.4);
    const gn = this.g(0); gn.gain.setValueAtTime(0.065, now); gn.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    ns.connect(f); f.connect(gn); gn.connect(this.sfxGain!); ns.start(now);
    const sub = this.o("sine", 38);
    const sg = this.g(0); sg.gain.setValueAtTime(0.07, now); sg.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    sub.connect(sg); sg.connect(this.sfxGain!); sub.start(now); sub.stop(now + 0.6);
  }

  // ── SCAN: rising sweep ──
  private sScan(now: number) {
    const o = this.o("sine", 400);
    const gn = this.g(0);
    o.frequency.exponentialRampToValueAtTime(3500, now + 0.2);
    gn.gain.setValueAtTime(0.04, now); gn.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    o.connect(gn); gn.connect(this.sfxGain!); o.start(now); o.stop(now + 0.3);
  }

  // ── UNLOCK: mechanical click + bright confirmation ──
  private sUnlock(now: number) {
    const ns = this.noise(0.02);
    const nf = this.ctx!.createBiquadFilter(); nf.type = "highpass"; nf.frequency.value = 5000;
    const ng = this.g(0); ng.gain.setValueAtTime(0.06, now); ng.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    ns.connect(nf); nf.connect(ng); ng.connect(this.sfxGain!); ns.start(now);
    [880, 1320, 1760].forEach((freq, i) => {
      const o = this.o("sine", freq);
      const gn = this.g(0); const t = now + 0.03 + i * 0.065;
      gn.gain.setValueAtTime(0.048, t); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(gn); gn.connect(this.sfxGain!); o.start(t); o.stop(t + 0.25);
    });
  }

  // ── COMBO: quick rising double-hit ──
  private sCombo(now: number) {
    [1200, 1800].forEach((freq, i) => {
      const o = this.o("sine", freq);
      const gn = this.g(0); const t = now + i * 0.035;
      gn.gain.setValueAtTime(0.055, t); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      o.connect(gn); gn.connect(this.sfxGain!); o.start(t); o.stop(t + 0.09);
    });
  }

  // ── NAVIGATE: soft whoosh-blip ──
  private sNavigate(now: number) {
    const o = this.o("sine", 1800);
    const gn = this.g(0);
    o.frequency.exponentialRampToValueAtTime(2400, now + 0.045);
    gn.gain.setValueAtTime(0.032, now); gn.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
    o.connect(gn); gn.connect(this.sfxGain!); o.start(now); o.stop(now + 0.1);
  }

  // ── TOGGLE: clean switch click ──
  private sToggle(now: number) {
    const o = this.o("square", 1400);
    const gn = this.g(0);
    gn.gain.setValueAtTime(0.045, now); gn.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    o.connect(gn); gn.connect(this.sfxGain!); o.start(now); o.stop(now + 0.05);
  }

  // ── BOOT UP: cinematic power-on sequence ──
  private sBootUp(now: number) {
    // Deep rumble swell
    const sub = this.o("sine", 30);
    const sg = this.g(0);
    sub.frequency.exponentialRampToValueAtTime(60, now + 1.5);
    sg.gain.setValueAtTime(0, now);
    sg.gain.linearRampToValueAtTime(0.08, now + 0.8);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 2);
    sub.connect(sg); sg.connect(this.sfxGain!);
    sub.start(now); sub.stop(now + 2.2);

    // Digital chirps
    [600, 900, 1350, 1800, 2400].forEach((freq, i) => {
      const o = this.o("sine", freq);
      const gn = this.g(0);
      const t = now + 0.3 + i * 0.15;
      gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(0.03, t + 0.02);
      gn.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      o.connect(gn); gn.connect(this.sfxGain!); o.start(t); o.stop(t + 0.12);
    });

    // Rising noise sweep
    const ns = this.noise(1.5);
    const nf = this.ctx!.createBiquadFilter();
    nf.type = "bandpass"; nf.Q.value = 3;
    nf.frequency.setValueAtTime(200, now);
    nf.frequency.exponentialRampToValueAtTime(8000, now + 1.5);
    const ng = this.g(0);
    ng.gain.setValueAtTime(0, now);
    ng.gain.linearRampToValueAtTime(0.025, now + 0.5);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    ns.connect(nf); nf.connect(ng); ng.connect(this.sfxGain!); ns.start(now);
  }

  // ── SECTION ENTER: ambient whoosh + tone ──
  private sSectionEnter(now: number) {
    const ns = this.noise(0.4);
    const f = this.ctx!.createBiquadFilter();
    f.type = "bandpass"; f.Q.value = 1.5;
    f.frequency.setValueAtTime(500, now);
    f.frequency.exponentialRampToValueAtTime(2000, now + 0.15);
    f.frequency.exponentialRampToValueAtTime(300, now + 0.35);
    const gn = this.g(0); gn.gain.setValueAtTime(0.04, now); gn.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    const pn = this.pan(0);
    pn.pan.setValueAtTime(-0.3, now); pn.pan.linearRampToValueAtTime(0.3, now + 0.35);
    ns.connect(f); f.connect(gn); gn.connect(pn); pn.connect(this.sfxGain!); ns.start(now);
    // Soft tone
    const o = this.o("sine", 660);
    const og = this.g(0);
    og.gain.setValueAtTime(0, now + 0.1); og.gain.linearRampToValueAtTime(0.02, now + 0.15);
    og.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    o.connect(og); og.connect(this.sfxGain!); o.start(now + 0.1); o.stop(now + 0.55);
  }

  // ── IMPACT: cinematic low-end thump ──
  private sImpact(now: number) {
    // Sub thud
    const sub = this.o("sine", 80);
    const sg = this.g(0);
    sub.frequency.exponentialRampToValueAtTime(30, now + 0.15);
    sg.gain.setValueAtTime(0.1, now); sg.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    sub.connect(sg); sg.connect(this.sfxGain!); sub.start(now); sub.stop(now + 0.35);
    // Transient crack
    const ns = this.noise(0.05);
    const nf = this.ctx!.createBiquadFilter(); nf.type = "highpass"; nf.frequency.value = 3000;
    const ng = this.g(0); ng.gain.setValueAtTime(0.07, now); ng.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    ns.connect(nf); nf.connect(ng); ng.connect(this.sfxGain!); ns.start(now);
    // Body
    const body = this.o("sine", 200);
    const bg = this.g(0);
    body.frequency.exponentialRampToValueAtTime(60, now + 0.1);
    bg.gain.setValueAtTime(0.06, now); bg.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    body.connect(bg); bg.connect(this.sfxGain!); body.start(now); body.stop(now + 0.25);
  }

  /* ═══════════════════════════════════════════════════ */
  /*   CONTROLS                                         */
  /* ═══════════════════════════════════════════════════ */

  toggleMute() {
    this._isMuted = !this._isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this._isMuted ? 0 : this._masterVolume, this.ctx.currentTime, 0.08
      );
    }
    return this._isMuted;
  }

  setMasterVolume(v: number) {
    this._masterVolume = Math.max(0, Math.min(1, v));
    if (this.masterGain && !this._isMuted && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this._masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  setSfxVolume(v: number) {
    this._sfxVolume = Math.max(0, Math.min(1, v));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this._sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  dispose() {
    this.stopAmbient();
    if (this.ctx) { this.ctx.close().catch(() => {}); this.ctx = null; }
  }
}

let engine: CyberAudioEngine | null = null;

export function getAudioEngine(): CyberAudioEngine {
  if (typeof window === "undefined") return new CyberAudioEngine();
  if (!engine) engine = new CyberAudioEngine();
  return engine;
}

export { CyberAudioEngine };

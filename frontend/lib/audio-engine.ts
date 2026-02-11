"use client";

/**
 * Procedural Cyberpunk Audio Engine
 * Generates atmospheric gaming sounds using Web Audio API — no external files needed.
 * Includes: ambient drone, rhythmic pulse, UI interaction SFX.
 */

type SoundName = "hover" | "click" | "whoosh" | "powerUp" | "glitch" | "success" | "error" | "type";

class CyberAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientNodes: AudioNode[] = [];
  private _isPlaying = false;
  private _isMuted = false;
  private _masterVolume = 0.35;
  private _ambientVolume = 0.25;
  private _sfxVolume = 0.5;
  private pulseInterval: ReturnType<typeof setInterval> | null = null;

  get isPlaying() {
    return this._isPlaying;
  }
  get isMuted() {
    return this._isMuted;
  }

  private ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._masterVolume;
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = this._ambientVolume;
      this.ambientGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this._sfxVolume;
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /* ───── Ambient Soundscape ───── */

  startAmbient() {
    if (this._isPlaying) return;
    const ctx = this.ensureContext();

    // 1. Deep sub-bass drone
    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone.type = "sine";
    drone.frequency.value = 55; // A1
    droneGain.gain.value = 0.12;
    drone.connect(droneGain);
    droneGain.connect(this.ambientGain!);
    drone.start();
    this.ambientNodes.push(drone, droneGain);

    // 2. Low pad (minor chord feel)
    const padFreqs = [82.41, 110, 146.83]; // E2, A2, D3 power chord
    padFreqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      gain.gain.value = 0.015;
      filter.type = "lowpass";
      filter.frequency.value = 400;
      filter.Q.value = 2;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain!);
      osc.start();
      this.ambientNodes.push(osc, gain, filter);
    });

    // 3. Slow LFO on filter for movement
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.08; // very slow sweep
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    // Connect LFO to the last filter created
    const lastFilter = this.ambientNodes.find(
      (n) => n instanceof BiquadFilterNode
    ) as BiquadFilterNode | undefined;
    if (lastFilter) {
      lfoGain.connect(lastFilter.frequency);
    }
    lfo.start();
    this.ambientNodes.push(lfo, lfoGain);

    // 4. Noise layer — filtered white noise for atmosphere
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 800;
    noiseFilter.Q.value = 0.5;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.02;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ambientGain!);
    noiseSource.start();
    this.ambientNodes.push(noiseSource, noiseFilter, noiseGain);

    // 5. Rhythmic pulse — subtle kick-like throb
    this.startPulse();

    this._isPlaying = true;
  }

  private startPulse() {
    const bpm = 70;
    const interval = (60 / bpm) * 1000;

    this.pulseInterval = setInterval(() => {
      if (!this.ctx || !this.ambientGain || this._isMuted) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // Sub-kick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ambientGain);
      osc.start(now);
      osc.stop(now + 0.35);
    }, interval);
  }

  stopAmbient() {
    this.ambientNodes.forEach((node) => {
      try {
        if ("stop" in node && typeof (node as OscillatorNode).stop === "function") {
          (node as OscillatorNode).stop();
        }
        node.disconnect();
      } catch {
        // already stopped
      }
    });
    this.ambientNodes = [];
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
    }
    this._isPlaying = false;
  }

  /* ───── UI Sound Effects ───── */

  playSfx(name: SoundName) {
    if (this._isMuted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    switch (name) {
      case "hover":
        this.playTone(2400, 0.04, 0.06, "sine");
        break;
      case "click":
        this.playClick(now);
        break;
      case "whoosh":
        this.playWhoosh(now);
        break;
      case "powerUp":
        this.playPowerUp(now);
        break;
      case "glitch":
        this.playGlitch(now);
        break;
      case "success":
        this.playSuccess(now);
        break;
      case "error":
        this.playError(now);
        break;
      case "type":
        this.playTone(1200 + Math.random() * 600, 0.02, 0.03, "square");
        break;
    }
  }

  private playTone(
    freq: number,
    vol: number,
    dur: number,
    type: OscillatorType
  ) {
    if (!this.ctx || !this.sfxGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  }

  private playClick(now: number) {
    if (!this.ctx || !this.sfxGain) return;
    const ctx = this.ctx;
    // Two-tone blip
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = "square";
    osc1.frequency.value = 1800;
    osc2.type = "sine";
    osc2.frequency.value = 2800;
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);
    osc1.start(now);
    osc2.start(now + 0.02);
    osc1.stop(now + 0.08);
    osc2.stop(now + 0.1);
  }

  private playWhoosh(now: number) {
    if (!this.ctx || !this.sfxGain) return;
    const ctx = this.ctx;
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(3000, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    filter.Q.value = 1;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    source.start(now);
  }

  private playPowerUp(now: number) {
    if (!this.ctx || !this.sfxGain) return;
    const ctx = this.ctx;
    // Rising arpeggio
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = now + i * 0.08;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.05, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  private playGlitch(now: number) {
    if (!this.ctx || !this.sfxGain) return;
    const ctx = this.ctx;
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = 100 + Math.random() * 2000;
      const t = now + i * 0.03;
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  private playSuccess(now: number) {
    if (!this.ctx || !this.sfxGain) return;
    const ctx = this.ctx;
    const notes = [523, 659, 784]; // C5 E5 G5 major chord
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = now + i * 0.1;
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  private playError(now: number) {
    if (!this.ctx || !this.sfxGain) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.2);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  /* ───── Controls ───── */

  toggleMute() {
    this._isMuted = !this._isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this._isMuted ? 0 : this._masterVolume,
        this.ctx!.currentTime,
        0.1
      );
    }
    return this._isMuted;
  }

  setMasterVolume(v: number) {
    this._masterVolume = Math.max(0, Math.min(1, v));
    if (this.masterGain && !this._isMuted) {
      this.masterGain.gain.setTargetAtTime(
        this._masterVolume,
        this.ctx!.currentTime,
        0.05
      );
    }
  }

  dispose() {
    this.stopAmbient();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Singleton
let engine: CyberAudioEngine | null = null;

export function getAudioEngine(): CyberAudioEngine {
  if (!engine) {
    engine = new CyberAudioEngine();
  }
  return engine;
}

export type { SoundName };
export { CyberAudioEngine };

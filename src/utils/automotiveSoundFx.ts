/**
 * Automotive Studio Web Audio Synthesizer
 * Generates synthetic automotive sounds without external audio assets:
 * - High-revving engine acceleration
 * - Pneumatic tire shop impact wrench (pistola neumática de taller)
 * - Tire burnout friction screech
 */

class AutomotiveSoundEngine {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Synthesize a throaty, high-performance engine rev
   */
  public playEngineRev() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Pitch sweep mimicking throttle blip
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(80, now);
      osc1.frequency.exponentialRampToValueAtTime(320, now + 0.35);
      osc1.frequency.exponentialRampToValueAtTime(110, now + 0.9);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(40, now);
      osc2.frequency.exponentialRampToValueAtTime(160, now + 0.35);
      osc2.frequency.exponentialRampToValueAtTime(55, now + 0.9);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.linearRampToValueAtTime(1600, now + 0.35);
      filter.frequency.linearRampToValueAtTime(500, now + 0.9);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.0);
      osc2.stop(now + 1.0);
    } catch {
      // Ignore audio failure
    }
  }

  /**
   * Synthesize tyre shop pneumatic air wrench (pistola neumática de colocación)
   */
  public playImpactWrench() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const pulses = 5;
      const pulseInterval = 0.045;

      for (let i = 0; i < pulses; i++) {
        const pulseTime = now + i * pulseInterval;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(180 + Math.random() * 40, pulseTime);
        osc.frequency.exponentialRampToValueAtTime(60, pulseTime + 0.035);

        gain.gain.setValueAtTime(0.2, pulseTime);
        gain.gain.exponentialRampToValueAtTime(0.005, pulseTime + 0.035);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(pulseTime);
        osc.stop(pulseTime + 0.04);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Synthesize tire asphalt friction screech / burnout
   */
  public playTireBurnout() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.6;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1200, now);
      bandpass.frequency.linearRampToValueAtTime(2400, now + 0.3);
      bandpass.frequency.linearRampToValueAtTime(900, now + 0.6);
      bandpass.Q.setValueAtTime(6, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.6);
    } catch {
      // Ignore
    }
  }
}

export const automotiveAudio = new AutomotiveSoundEngine();

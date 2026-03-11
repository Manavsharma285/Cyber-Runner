class AudioService {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  async playMenuMusic() {
    this.init();
    if (this.isPlaying || !this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.isPlaying = true;
    
    // Create a smoother, atmospheric ambient pad
    const baseFreqs = [110.00, 110.00, 146.83, 164.81]; // A2, D3, E3
    let noteIdx = 0;

    this.intervalId = setInterval(() => {
      if (!this.ctx) return;
      this.playGlassyNote(baseFreqs[noteIdx]);
      noteIdx = (noteIdx + 1) % baseFreqs.length;
    }, 1200); // Slower, more ambient
  }

  private playGlassyNote(freq: number) {
    if (!this.ctx) return;

    const duration = 2.5;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 1.5, this.ctx.currentTime); // Perfect fifth harmony

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + duration);
    osc2.stop(this.ctx.currentTime + duration);
  }

  stopAll() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPlaying = false;
  }
}

export const audioService = new AudioService();

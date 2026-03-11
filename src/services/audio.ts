class AudioService {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playJump() {
    this.playTone(400, 'square', 0.1);
    setTimeout(() => this.playTone(600, 'square', 0.1), 50);
  }

  playCollect() {
    this.playTone(800, 'triangle', 0.1, 0.2);
    setTimeout(() => this.playTone(1200, 'triangle', 0.1, 0.2), 50);
  }

  playPowerup() {
    this.playTone(400, 'sawtooth', 0.5, 0.1);
  }

  playKill() {
    this.playTone(200, 'square', 0.2);
    this.playTone(100, 'square', 0.3);
  }

  playDamage() {
    this.playTone(150, 'sawtooth', 0.4, 0.3);
  }
  
  playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'square', 0.4, 0.1), i * 150);
    });
  }

  playNeuralLink() {
    this.init();
    if (!this.ctx) return;
    
    // A digital "login" sweep
    const duration = 1.5;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + duration);
    
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    
    osc.connect(g);
    g.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
    
    // Softer high-pitched chirps
    setTimeout(() => this.playTone(1000, 'sine', 0.1, 0.03), 800);
    setTimeout(() => this.playTone(1400, 'sine', 0.1, 0.03), 950);
  }
}

export const audio = new AudioService();

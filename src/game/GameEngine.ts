import { Physics } from "./Physics";
import type { Bounds, Vector2 } from "./Physics";
import { audio } from "../services/audio";
import { InfiniteGenerator } from "./InfiniteGenerator";

export interface GameState {
  player: {
    bounds: Bounds;
    velocity: Vector2;
    isGrounded: boolean;
    doubleJumpAvailable: boolean;
    hp: number;
    score: number;
    invulnTimer: number;
    powerupTimer: number;
    powerupType: 'speed' | 'highjump' | 'shield' | null;
    color: string;
    trail: { x: number, y: number, opacity: number }[];
  };
  platforms: Bounds[];
  collectibles: (Bounds & { active: boolean, type: 'crystal' | 'powerup', value: number })[];
  enemies: (Bounds & { active: boolean, type: 'drone' | 'laser', velocity?: Vector2 })[];
  particles: { x: number, y: number, vx: number, vy: number, life: number, color: string }[];
  camera: Vector2;
  portal: Bounds & { active: boolean };
  levelWidth: number;
  levelHeight: number;
  backgroundType: 'neon-city' | 'cyber-forest' | 'lab';
  isGameOver: boolean;
  isVictory: boolean;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  public state: GameState;
  
  private nextSpawnX: number = 1200; // Match InfiniteGenerator.CHUNK_WIDTH
  private difficulty: number = 1;
  private distance: number = 0;
  
  // Visual juice
  private shakeTimer: number = 0;
  private shakeIntensity: number = 0;
  private trailTimer: number = 0;

  // Key state
  public keys: { [key: string]: boolean } = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    Space: false,
    a: false,
    d: false,
    w: false,
  };

  constructor(canvas: HTMLCanvasElement, initialState: GameState) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get 2D context");
    this.ctx = ctx;
    this.state = initialState;

    // Start loop
    this.lastTime = performance.now();
  }

  public start() {
    if (this.animationFrameId === null) {
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // To be overridden or hooked via callback for React UI updates
  public onStateChange?: (state: GameState) => void;

  private loop = (time: number) => {
    let deltaTime = (time - this.lastTime) / 1000; // seconds
    if (deltaTime > 0.05) deltaTime = 0.05; // Cap to 20fps equivalent to prevent physics explosion
    this.lastTime = time;

    this.update(deltaTime);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(deltaTime: number) {
    if (this.state.isGameOver) return; // Removed isVictory check

    this.updatePlayer(deltaTime);
    this.updateChunkGeneration();
    this.cleanupOldEntities();
    this.updateParticles(deltaTime);
    this.updateCamera();
    this.checkCollectibles();
    this.checkEnemies(deltaTime);

    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }
  private updatePlayer(deltaTime: number) {
    const p = this.state.player;
    let jumpForce = -600;

    if (p.invulnTimer > 0) {
      p.invulnTimer -= deltaTime;
    }
    
    if (p.powerupTimer > 0) {
      p.powerupTimer -= deltaTime;
      if (p.powerupType === 'highjump') {
        jumpForce = -800;
      }
      if (p.powerupTimer <= 0) {
         p.powerupType = null;
      }
    }

    // Automatic Forward Movement (Subway Surfers style)
    const baseSpeed = 400;
    const speedMultiplier = 1 + (this.distance / 10000); // 10% faster every 1000 units
    p.velocity.x = (p.powerupType === 'speed' ? 600 : baseSpeed) * speedMultiplier;
    
    // Horizontal drift still allowed on top of base speed if keys pressed
    if (this.keys['ArrowLeft'] || this.keys['a']) {
      p.bounds.x -= 100 * deltaTime;
    }
    if (this.keys['ArrowRight'] || this.keys['d']) {
      p.bounds.x += 100 * deltaTime;
    }

    // Jumping
    if ((this.keys['ArrowUp'] || this.keys['w'] || this.keys['Space'])) {
      if (p.isGrounded) {
        p.velocity.y = jumpForce;
        p.isGrounded = false;
        p.doubleJumpAvailable = true;
        this.spawnParticles(p.bounds.x + p.bounds.width/2, p.bounds.y + p.bounds.height, p.color, 15);
        audio.playJump();
        
        this.keys['ArrowUp'] = false;
        this.keys['w'] = false;
        this.keys['Space'] = false;
      } else if (p.doubleJumpAvailable) {
        p.velocity.y = jumpForce + 100;
        p.doubleJumpAvailable = false;
        
        this.keys['ArrowUp'] = false;
        this.keys['w'] = false;
        this.keys['Space'] = false;
      }
    }

    // Apply gravity
    p.velocity.y += 1500 * deltaTime;
    if (p.velocity.y > 1000) p.velocity.y = 1000;

    // Position Update
    p.bounds.x += p.velocity.x * deltaTime;
    p.bounds.y += p.velocity.y * deltaTime;

    // Track distance and score
    const oldDistance = this.distance;
    this.distance = Math.floor(p.bounds.x / 10);
    if (this.distance > oldDistance) {
      p.score += (this.distance - oldDistance);
      // Update difficulty every 500 units
      this.difficulty = 1 + Math.floor(this.distance / 500);
    }

    p.isGrounded = false;
    
    // Bottom abyss = death
    if (p.bounds.y > this.state.levelHeight + 200) {
      p.hp = 0;
      this.state.isGameOver = true;
    }

    // Resolve Platform Collisions
    for (const platform of this.state.platforms) {
      if (Physics.checkAABB(p.bounds, platform)) {
        const dx = (p.bounds.x + p.bounds.width / 2) - (platform.x + platform.width / 2);
        const dy = (p.bounds.y + p.bounds.height / 2) - (platform.y + platform.height / 2);
        const width = (p.bounds.width + platform.width) / 2;
        const height = (p.bounds.height + platform.height) / 2;
        const overlapX = width - Math.abs(dx);
        const overlapY = height - Math.abs(dy);
        
        if (overlapX < overlapY || Math.abs(dy) > height * 0.95) { // Prioritize vertical land
           if (dy < 0) { // On top
             p.bounds.y = platform.y - p.bounds.height;
             p.velocity.y = 0;
             p.isGrounded = true;
             p.doubleJumpAvailable = true;
           }
        }
      }
    }
  }

  private updateChunkGeneration() {
    // Generate next chunk if player is within 1000 pixels of the current end
    if (this.state.player.bounds.x + 1000 > this.nextSpawnX) {
      const chunk = InfiniteGenerator.createChunk(this.nextSpawnX, this.difficulty);
      this.state.platforms.push(...chunk.platforms);
      this.state.collectibles.push(...chunk.collectibles);
      this.state.enemies.push(...chunk.enemies);
      this.nextSpawnX += chunk.width;
      this.state.levelWidth = this.nextSpawnX;
    }
  }

  private cleanupOldEntities() {
    const minX = this.state.player.bounds.x - 1000;
    
    this.state.platforms = this.state.platforms.filter(p => p.x + p.width > minX);
    this.state.collectibles = this.state.collectibles.filter(c => c.x + c.width > minX);
    this.state.enemies = this.state.enemies.filter(e => e.x + e.width > minX);
  }

  private updateCamera() {
    // Advanced Camera Smoothing (LERP)
    const p = this.state.player;
    const targetX = p.bounds.x + p.bounds.width / 2 - this.canvas.width / 3; // Shifted slightly left of center for better forward visibility
    
    // Smooth camera catch-up (Lerp)
    const lerpFactor = 0.08;
    this.state.camera.x += (targetX - this.state.camera.x) * lerpFactor;

    // Clamp camera
    if (this.state.camera.x < 0) this.state.camera.x = 0;
    
    // Y-axis slight lag follow
    const targetY = p.bounds.y - this.canvas.height / 2;
    this.state.camera.y += (targetY - this.state.camera.y) * 0.05;
    
    // Screen Shake
    if (this.shakeTimer > 0) {
      this.shakeTimer -= 0.016; // Approx 1 frame
      this.state.camera.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.state.camera.y += (Math.random() - 0.5) * this.shakeIntensity;
    }
  }

  private checkCollectibles() {
    const p = this.state.player;
    for (const item of this.state.collectibles) {
      if (item.active && Physics.checkAABB(p.bounds, item)) {
        item.active = false;
        if (item.type === 'crystal') {
           this.state.player.score += item.value;
           this.spawnParticles(item.x + item.width/2, item.y + item.height/2, "#ff00ff", 10);
           audio.playCollect();
        } else if (item.type === 'powerup') {
           p.powerupType = ['speed', 'highjump', 'shield'][item.value] as 'speed' | 'highjump' | 'shield';
           p.powerupTimer = 10.0; // 10 seconds of powerup
           p.score += 50;
           this.spawnParticles(item.x + item.width/2, item.y + item.height/2, "#00f3ff", 20);
           audio.playCollect(); // Use collect for powerup too or a specific one
        }
      }
    }
  }

  private checkEnemies(deltaTime: number) {
    const p = this.state.player;
    for (const enemy of this.state.enemies) {
      if (!enemy.active) continue;
      
      // Simple Patrol Logic
      if (enemy.velocity) {
         enemy.x += enemy.velocity.x * deltaTime;
         
         // Reverse if hitting an invisible boundary or distance (simplification: hardcoded range limit for this demo)
         // We will just let them fall if they go off edges, or bounce off platforms
         // For a complete game, we'd check platform edges. Let's just do a time-based or simple distance flip:
      }

      if (Physics.checkAABB(p.bounds, enemy)) {
        // Very basic simple hit logic
        // If falling down, enemy dies. Else player takes damage.
        if (p.velocity.y > 0 && p.bounds.y + p.bounds.height < enemy.y + enemy.height / 2) {
          enemy.active = false;
          p.velocity.y = -400; // Bounce
          p.score += 100;
          this.spawnParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, "#ff0000", 20);
          audio.playKill();
        } else if (p.invulnTimer <= 0) {
          // Player takes damage and bounces back
          p.hp -= 1;
          p.invulnTimer = 1.0; // 1 second invulnerability
          p.velocity.x = p.velocity.x >= 0 ? -300 : 300;
          p.velocity.y = -300;
          this.spawnParticles(p.bounds.x + p.bounds.width/2, p.bounds.y + p.bounds.height/2, "#fff", 30);
          audio.playDamage();
          
          // Trigger Shake
          this.shakeTimer = 0.5;
          this.shakeIntensity = 10;

          if (p.hp <= 0) {
            this.state.isGameOver = true;
          }
        }
      }
    }
  }

  private updateParticles(deltaTime: number) {
    for (let i = this.state.particles.length - 1; i >= 0; i--) {
      const p = this.state.particles[i];
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.life -= deltaTime;
      if (p.life <= 0) {
        this.state.particles.splice(i, 1);
      }
    }
  }

  private spawnParticles(x: number, y: number, color: string, count: number = 10) {
    for (let i = 0; i < count; i++) {
      this.state.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        life: 0.5 + Math.random() * 0.5,
        color
      });
    }
  }

  private render() {
    // Clear
    this.ctx.fillStyle = "#050510";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Speed Lines Effect
    const speedFactor = this.state.player.velocity.x / 800;
    if (speedFactor > 0.5) {
      this.renderSpeedLines(speedFactor);
    }

    // Render Parallax Background
    this.renderBackground();

    this.ctx.save();
    // Apply Camera
    this.ctx.translate(-this.state.camera.x, -this.state.camera.y);

    // Render Particles
    for (const p of this.state.particles) {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.fillRect(p.x, p.y, 4, 4);
    }
    this.ctx.globalAlpha = 1.0;

    // Draw Platforms (Styled)
    for (const plat of this.state.platforms) {
      const gradient = this.ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
      gradient.addColorStop(0, "#1a1a2e");
      gradient.addColorStop(1, "#0a0a1a");
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
      
      this.ctx.strokeStyle = "#00f3ff55";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
      
      this.ctx.beginPath();
      this.ctx.moveTo(plat.x, plat.y);
      this.ctx.lineTo(plat.x + plat.width, plat.y);
      this.ctx.strokeStyle = "#00f3ff";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    // Draw Collectibles
    for (const item of this.state.collectibles) {
      if (!item.active) continue;
      this.ctx.fillStyle = item.type === 'crystal' ? "#ff00ff" : "#00f3ff";
      
      // Rotating diamond
      this.ctx.save();
      this.ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
      this.ctx.rotate((performance.now() / 1000) * Math.PI); // 1 rotation per 2 sec
      
      this.ctx.shadowColor = item.type === 'crystal' ? "#ff00ff" : "#00f3ff";
      this.ctx.shadowBlur = 10;
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, -item.height / 2);
      this.ctx.lineTo(item.width / 2, 0);
      this.ctx.lineTo(0, item.height / 2);
      this.ctx.lineTo(-item.width / 2, 0);
      this.ctx.closePath();
      this.ctx.fill();
      
      this.ctx.restore();
    }

    // Draw Enemies
    for (const enemy of this.state.enemies) {
      if (!enemy.active) continue;
      this.ctx.fillStyle = "#ff0000";
      this.ctx.shadowColor = "#ff0000";
      this.ctx.shadowBlur = 15;
      this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      this.ctx.shadowBlur = 0; // reset
    }

    // Draw Portal
    const portal = this.state.portal;
    if (portal.active) {
      this.ctx.save();
      this.ctx.fillStyle = "rgba(0, 243, 255, 0.3)";
      this.ctx.strokeStyle = "#00f3ff";
      this.ctx.lineWidth = 4;
      this.ctx.shadowColor = "#00f3ff";
      this.ctx.shadowBlur = 20;
      
      // Animated pulse
      const pulse = Math.sin(performance.now() / 200) * 10;
      this.ctx.strokeRect(portal.x - pulse/2, portal.y - pulse/2, portal.width + pulse, portal.height + pulse);
      this.ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
      
      this.ctx.fillStyle = "#fff";
      this.ctx.textAlign = "center";
      this.ctx.font = "bold 14px Orbitron";
      this.ctx.fillText("EXIT NODE", portal.x + portal.width / 2, portal.y - 20);
      this.ctx.restore();
    }

    // Draw Player
    const p = this.state.player;
    
    // Update and Draw Trail
    this.trailTimer += 0.016;
    if (this.trailTimer > 0.05) {
      p.trail.unshift({ x: p.bounds.x, y: p.bounds.y, opacity: 0.5 });
      if (p.trail.length > 5) p.trail.pop();
      this.trailTimer = 0;
    }
    
    p.trail.forEach((t) => {
      t.opacity -= 0.05;
      this.ctx.globalAlpha = t.opacity;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(t.x, t.y, p.bounds.width, p.bounds.height);
    });
    this.ctx.globalAlpha = 1.0;

    const isBlinking = p.invulnTimer > 0 && Math.floor(p.invulnTimer * 10) % 2 === 0;
    
    if (!isBlinking) {
      this.ctx.save();
      this.ctx.translate(p.bounds.x + p.bounds.width/2, p.bounds.y + p.bounds.height/2);
      
      // Simple character "squash and stretch" based on velocity
      const stretch = 1 + Math.abs(p.velocity.y) / 2000;
      const squash = 1 / stretch;
      this.ctx.scale(squash, stretch);

      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 15;
      this.ctx.fillRect(-p.bounds.width/2, -p.bounds.height/2, p.bounds.width, p.bounds.height);
      
      // Eye detail
      this.ctx.fillStyle = "#fff";
      this.ctx.shadowBlur = 0;
      const eyeDir = p.velocity.x >= 0 ? 1 : -1;
      this.ctx.fillRect(eyeDir * 4, -10, 8, 4);
      
      this.ctx.restore();
    }

    this.ctx.restore();
  }

  private renderBackground() {
    const camX = this.state.camera.x;
    const layers = [0.2, 0.5, 0.8]; // Parallax factors
    
    layers.forEach((factor, i) => {
      this.ctx.save();
      this.ctx.translate(-camX * factor, 0);
      
      // Repeating background elements
      const spacing = 400;
      const startX = Math.floor((camX * factor) / spacing) * spacing;
      
      for (let x = startX - spacing; x < startX + this.canvas.width + spacing; x += spacing) {
        if (this.state.backgroundType === 'neon-city') {
          this.ctx.fillStyle = `rgba(0, 243, 255, ${0.05 * (i + 1)})`;
          this.ctx.fillRect(x + 50, this.canvas.height - 300 - (i * 50), 100, 300 + (i * 50));
        } else if (this.state.backgroundType === 'cyber-forest') {
          this.ctx.fillStyle = `rgba(0, 255, 0, ${0.05 * (i + 1)})`;
          this.ctx.beginPath();
          this.ctx.moveTo(x + 50, this.canvas.height);
          this.ctx.lineTo(x + 100, this.canvas.height - 200 - (i * 40));
          this.ctx.lineTo(x + 150, this.canvas.height);
          this.ctx.fill();
        }
      }
      this.ctx.restore();
    });
  }

  private renderSpeedLines(intensity: number) {
    this.ctx.strokeStyle = `rgba(0, 243, 255, ${intensity * 0.2})`;
    this.ctx.lineWidth = 2;
    for (let i = 0; i < 15; i++) {
      const y = Math.random() * this.canvas.height;
      const length = 50 + Math.random() * 150;
      const x = Math.random() * this.canvas.width;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x + length, y);
      this.ctx.stroke();
    }
  }
}

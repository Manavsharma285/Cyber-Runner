import type { Bounds } from "./Physics";

export interface Chunk {
  platforms: Bounds[];
  collectibles: (Bounds & { active: boolean, type: 'crystal' | 'powerup', value: number })[];
  enemies: (Bounds & { active: boolean, type: 'drone' | 'laser', velocity?: { x: number, y: number } })[];
  width: number;
}

export class InfiniteGenerator {
  private static CHUNK_WIDTH = 1200;
  private static GROUND_Y = 500;

  public static generateInitialState(playerColor: string): any {
    const firstChunk = this.createChunk(0, 0); // Very easy start
    return {
      player: {
        bounds: { x: 100, y: 300, width: 32, height: 48 },
        velocity: { x: 0, y: 0 },
        isGrounded: false,
        doubleJumpAvailable: false,
        hp: 3,
        score: 0,
        invulnTimer: 0,
        powerupTimer: 0,
        powerupType: null,
        color: playerColor,
        trail: []
      },
      particles: [],
      backgroundType: 'neon-city',
      platforms: firstChunk.platforms,
      collectibles: firstChunk.collectibles,
      enemies: firstChunk.enemies,
      camera: { x: 0, y: 0 },
      portal: { x: -1000, y: 0, width: 0, height: 0, active: false }, // Portal disabled in infinite mode
      levelWidth: this.CHUNK_WIDTH,
      levelHeight: 800,
      isGameOver: false,
      isVictory: false
    };
  }

  public static createChunk(startX: number, difficulty: number): Chunk {
    const platforms: Bounds[] = [];
    const collectibles: any[] = [];
    const enemies: any[] = [];

    // Base ground platform (sometimes with gaps)
    const hasGap = difficulty > 2 && Math.random() > 0.5;
    if (!hasGap) {
      platforms.push({ x: startX, y: this.GROUND_Y, width: this.CHUNK_WIDTH, height: 200 });
    } else {
      platforms.push({ x: startX, y: this.GROUND_Y, width: 400, height: 200 });
      platforms.push({ x: startX + 800, y: this.GROUND_Y, width: 400, height: 200 });
    }

    // Add floating platforms
    const floatingCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < floatingCount; i++) {
       const px = startX + 200 + (i * 300);
       const py = this.GROUND_Y - 150 - (Math.random() * 150);
       platforms.push({ x: px, y: py, width: 200, height: 30 });
       
       // Crystals on floating platforms
       if (Math.random() > 0.3) {
         collectibles.push({ 
           x: px + 90, y: py - 40, width: 20, height: 20, 
           active: true, type: 'crystal', value: 100 
         });
       }
    }

    // Add enemies based on difficulty
    const enemyCount = Math.min(difficulty, 4);
    for (let i = 0; i < enemyCount; i++) {
      const ex = startX + 400 + (i * 200);
      const ey = this.GROUND_Y - 50;
      enemies.push({ 
        x: ex, y: ey, width: 40, height: 50, 
        active: true, type: 'drone', 
        velocity: { x: -(60 + difficulty * 20), y: 0 } 
      });
    }

    // Random powerup
    if (Math.random() > 0.8) {
      collectibles.push({
        x: startX + 600, y: this.GROUND_Y - 250, width: 25, height: 25,
        active: true, type: 'powerup', value: Math.floor(Math.random() * 3)
      });
    }

    return { platforms, collectibles, enemies, width: this.CHUNK_WIDTH };
  }
}

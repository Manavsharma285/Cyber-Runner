import type { GameState } from "../GameEngine";

export const Level1: GameState = {
  player: {
    bounds: { x: 50, y: 300, width: 32, height: 48 },
    velocity: { x: 0, y: 0 },
    isGrounded: false,
    doubleJumpAvailable: false,
    hp: 3,
    score: 0,
    invulnTimer: 0,
    powerupTimer: 0,
    powerupType: null,
    color: '#ff00ff',
    trail: []
  },
  particles: [],
  backgroundType: 'neon-city',
  platforms: [
    // Starting Zone
    { x: 0, y: 500, width: 800, height: 200 },
    { x: 900, y: 400, width: 300, height: 40 },
    { x: 1300, y: 300, width: 300, height: 40 },
    
    // Gap and Bridge
    { x: 1700, y: 500, width: 600, height: 200 },
    { x: 1900, y: 350, width: 200, height: 30 }, // Floating platform
    
    // High path
    { x: 2400, y: 250, width: 400, height: 40 },
    { x: 2900, y: 150, width: 300, height: 40 },
    
    // Lower path
    { x: 2400, y: 500, width: 1000, height: 200 },
    
    // Parkour Section
    { x: 3600, y: 450, width: 200, height: 30 },
    { x: 3900, y: 350, width: 200, height: 30 },
    { x: 4200, y: 250, width: 200, height: 30 },
    { x: 4500, y: 400, width: 500, height: 300 },
    
    // Final Stretch
    { x: 5200, y: 500, width: 1200, height: 200 }
  ],
  collectibles: [
    { x: 400, y: 450, width: 20, height: 20, active: true, type: 'crystal', value: 100 },
    { x: 700, y: 450, width: 20, height: 20, active: true, type: 'crystal', value: 100 },
    { x: 1450, y: 250, width: 20, height: 20, active: true, type: 'crystal', value: 100 },
    { x: 2500, y: 200, width: 20, height: 20, active: true, type: 'crystal', value: 200 },
    { x: 3050, y: 100, width: 20, height: 20, active: true, type: 'crystal', value: 500 },
    
    // Powerups
    { x: 1000, y: 350, width: 25, height: 25, active: true, type: 'powerup', value: 0 }, // Speed at start
    { x: 4300, y: 200, width: 25, height: 25, active: true, type: 'powerup', value: 1 }, // High Jump for final stretch
  ],
  enemies: [
    // Area 1
    { x: 600, y: 450, width: 40, height: 50, active: true, type: 'drone', velocity: { x: -60, y: 0 } },
    
    // Area 2
    { x: 1800, y: 450, width: 40, height: 50, active: true, type: 'drone', velocity: { x: 80, y: 0 } },
    { x: 2100, y: 450, width: 40, height: 50, active: true, type: 'drone', velocity: { x: -80, y: 0 } },
    
    // Area 3 (Lower path)
    { x: 2500, y: 450, width: 40, height: 50, active: true, type: 'drone', velocity: { x: 120, y: 0 } },
    { x: 2800, y: 450, width: 40, height: 50, active: true, type: 'drone', velocity: { x: -120, y: 0 } },
    { x: 3100, y: 450, width: 40, height: 50, active: true, type: 'drone', velocity: { x: 150, y: 0 } },
    
    // Final Area
    { x: 5400, y: 450, width: 50, height: 60, active: true, type: 'drone', velocity: { x: -200, y: 0 } },
    { x: 5800, y: 450, width: 50, height: 60, active: true, type: 'drone', velocity: { x: 200, y: 0 } },
    { x: 6200, y: 450, width: 50, height: 60, active: true, type: 'drone', velocity: { x: -250, y: 0 } }
  ],
  camera: { x: 0, y: 0 },
  portal: { x: 6000, y: 400, width: 60, height: 100, active: true },
  levelWidth: 6500,
  levelHeight: 800,
  isGameOver: false,
  isVictory: false
};

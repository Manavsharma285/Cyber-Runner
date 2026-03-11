export interface Vector2 {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const GRAVITY = 1500; // pixels per second squared
export const TERMINAL_VELOCITY = 1000;

export class Physics {
  static applyGravity(velocity: Vector2, deltaTime: number): void {
    velocity.y += GRAVITY * deltaTime;
    if (velocity.y > TERMINAL_VELOCITY) {
      velocity.y = TERMINAL_VELOCITY;
    }
  }

  static checkAABB(a: Bounds, b: Bounds): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // Returns true if entity is standing on the ground/platform
  static resolveCollision(
    entity: Bounds & { velocity: Vector2 },
    solid: Bounds
  ): boolean {
    let grounded = false;
    
    // Very simple AABB resolution
    // Calculate overlap on both axes
    const overlapX = (entity.width + solid.width) / 2 - Math.abs((entity.x + entity.width / 2) - (solid.x + solid.width / 2));
    const overlapY = (entity.height + solid.height) / 2 - Math.abs((entity.y + entity.height / 2) - (solid.y + solid.height / 2));

    if (overlapX > 0 && overlapY > 0) {
      if (overlapX < overlapY) {
        // Resolve X axis
        if (entity.x < solid.x) {
          entity.x -= overlapX;
        } else {
          entity.x += overlapX;
        }
        entity.velocity.x = 0;
      } else {
        // Resolve Y axis
        if (entity.y < solid.y) {
          entity.y -= overlapY;
          grounded = true;
        } else {
          entity.y += overlapY;
          // Hit ceiling
          if (entity.velocity.y < 0) {
            entity.velocity.y = 0;
          }
        }
        entity.velocity.y = 0;
      }
    }
    return grounded;
  }
}

import { PositionObject, GameContext, clamp } from 'web-game-engine';
import { findClosestEntities, findClosestEntity, sphereImage } from './main';
import { Barrel } from './barrel';
import { Boost } from './boost';

export class Player extends PositionObject {
  dir: number = 0;
  image = sphereImage;
  speed: number = 0;
  rotateSpeed: number = 0;

  rotateAcceleration = 0.0004;
  maxRotateSpeed = 0.025;
  maxSpeed = 18;
  acceleration = 0.5;
  dampRotation = 0.9;
  dampSpeed = 0.98;

  constructor(x: number, y: number) {
    super(x, y);
  }

  getInput(ctx: GameContext, dir: 'w' | 'a' | 's' | 'd'): boolean {
    return ctx.input.key(dir);
  }

  step(ctx: GameContext): void {
    if (this.getInput(ctx, 'w')) {
      if (this.speed + this.acceleration < this.maxSpeed) {
        this.speed += this.acceleration;
      }
    }
    if (this.getInput(ctx, 's')) {
      if (this.speed - this.acceleration > -this.maxSpeed) {
        this.speed -= this.acceleration;
      }
    }

    this.speed *= this.dampSpeed;
    this.pos.x += Math.cos(this.dir) * this.speed;
    this.pos.y += Math.sin(this.dir) * this.speed;

    if (this.getInput(ctx, 'a')) {
      this.rotateSpeed -= this.rotateAcceleration;
    }
    if (this.getInput(ctx, 'd')) {
      this.rotateSpeed += this.rotateAcceleration;
    }
    this.rotateSpeed = clamp(
      this.rotateSpeed,
      -this.maxRotateSpeed,
      this.maxRotateSpeed
    );
    if (
      (this.rotateSpeed > 0 && !this.getInput(ctx, 'd')) ||
      (this.rotateSpeed < 0 && !this.getInput(ctx, 'a'))
    ) {
      this.rotateSpeed *= this.dampRotation;
    }
    this.dir += this.rotateSpeed;
    while (this.dir < -Math.PI) this.dir += 2 * Math.PI;
    while (this.dir > Math.PI) this.dir -= 2 * Math.PI;

    const entities = findClosestEntities(this.pos, 5);
    const closestEntity = findClosestEntity(entities, this.pos, '', 32);
    if (closestEntity) {
      if (closestEntity instanceof Barrel) {
        this.speed = 0;
      }
      if (closestEntity instanceof Boost) {
        this.speed *= 1.8;
      }
    }
  }
}

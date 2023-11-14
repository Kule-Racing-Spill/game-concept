import { Vec2, GameContext, DrawContext } from 'web-game-engine';
import { enemyImage, findClosestEntities, findClosestEntity } from './main';
import { Player } from './player';

export class Enemy extends Player {
  target: Vec2 = new Vec2(0, 0);

  constructor(x: number, y: number) {
    super(x, y);
    this.image = enemyImage;
    this.rotateAcceleration *= 10;
    this.maxRotateSpeed *= 2;
  }

  draw(_: DrawContext): void {}

  getInput(_: GameContext, key: 'w' | 'a' | 's' | 'd'): boolean {
    let bestDir = this.dir;
    let maxDis = 0;
    const entities = findClosestEntities(this.pos, 20);
    for (const dirOffset of [
      -Math.PI / 2,
      -Math.PI / 4,
      -Math.PI / 8,
      0,
      Math.PI / 8,
      Math.PI / 4,
      Math.PI / 2,
    ]) {
      for (let dis = 16; dis <= 1024; dis += 16) {
        const dir = this.dir + dirOffset;
        const pos = new Vec2(
          this.pos.x + dis * Math.cos(dir),
          this.pos.y + dis * Math.sin(dir)
        );
        const closestEntity = findClosestEntity(entities, pos, 'Barrel', 48);
        if (dis > maxDis) {
          bestDir = dir;
          maxDis = dis;
        }
        if (closestEntity) {
          if (dir == this.dir && dis <= 32) {
            this.speed = 0;
          }

          break;
        }
      }
    }
    const forward = bestDir == this.dir && maxDis > 128;

    if (key == 'd' && bestDir > this.dir) return true;
    if (key == 'a' && bestDir < this.dir) return true;
    if (key == 'w' && forward) return true;
    if (key == 's' && !forward && this.speed > this.acceleration) return true;
    return Math.random() > 0.95;
  }
}

export const randomFloat = (min: number, max: number) => {
  return min + Math.random() * (max - min);
};

export const randomInt = (min: number, max: number) => {
  return Math.round(randomFloat(min, max));
};

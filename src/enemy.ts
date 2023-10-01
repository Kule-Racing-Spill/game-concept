import { Vec2, PositionObject, GameContext } from 'web-game-engine';

export class Enemy extends PositionObject {
  target: Vec2 = new Vec2(0, 0);

  constructor(x: number, y: number) {
    super(x, y);
  }

  onActivate(_: GameContext) {
    this.randomizeTarget();
  }

  step(ctx: GameContext): void {
    // this.pos = this.pos.moveTowards(this.target, 1 * ctx.dtFactor);
    // if (this.pos.lengthTo(this.target) < 32) {
    //   this.randomizeTarget();
    // }
  }

  randomizeTarget() {
    this.target = new Vec2(randomInt(-200, 200), randomInt(-200, 200));
  }
}

export const randomFloat = (min: number, max: number) => {
  return min + Math.random() * (max - min);
};

export const randomInt = (min: number, max: number) => {
  return Math.round(randomFloat(min, max));
};

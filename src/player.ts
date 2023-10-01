import { PositionObject, GameContext } from 'web-game-engine';

export class Player extends PositionObject {
  dir: number = -Math.PI / 2;

  constructor(x: number, y: number) {
    super(x, y);
  }

  step(ctx: GameContext): void {
    if (ctx.input.key('a')) this.dir -= 0.03;
    if (ctx.input.key('d')) this.dir += 0.03;
    this.dir = this.dir % (2 * Math.PI);

    const speed = 3;
    if (ctx.input.key('w')) {
      this.pos.x += Math.cos(this.dir) * speed;
      this.pos.y += Math.sin(this.dir) * speed;
    }
    if (ctx.input.key('s')) {
      this.pos.x += Math.cos(this.dir) * -speed;
      this.pos.y += Math.sin(this.dir) * -speed;
    }
  }
}

import {
  PositionObject,
  GameContext,
  ImageAsset,
  clamp,
} from 'web-game-engine';

const marioUp = new ImageAsset('./mario_up.png');
const marioLeft = new ImageAsset('./mario_left.png');
const marioRight = new ImageAsset('./mario_right.png');

const rotateAcceleration = 0.0003;
const maxRotateSpeed = 0.015;
const maxSpeed = 10;
const acceleration = 1;
const dampRotation = 0.9;
const dampSpeed = 0.96;

export class Player extends PositionObject {
  dir: number = 0;
  image: ImageAsset = marioUp;
  speed: number = 0;
  rotateSpeed: number = 0;

  constructor(x: number, y: number) {
    super(x, y);
  }

  onActivate(ctx: GameContext): void {
    marioUp.__load(ctx.game);
    marioLeft.__load(ctx.game);
    marioRight.__load(ctx.game);
  }

  step(ctx: GameContext): void {
    if (ctx.input.key('w')) {
      this.image = marioUp;
      this.speed += acceleration;
    }
    if (ctx.input.key('s')) {
      this.image = marioUp;
      this.speed -= acceleration;
    }
    this.speed = clamp(this.speed, -maxSpeed, maxSpeed);
    if (!ctx.input.key('w') && !ctx.input.key('s')) {
      this.speed *= dampSpeed;
    }
    this.pos.x += Math.cos(this.dir) * this.speed;
    this.pos.y += Math.sin(this.dir) * this.speed;

    if (ctx.input.key('a')) {
      this.image = marioLeft;
      this.rotateSpeed -= rotateAcceleration;
    }
    if (ctx.input.key('d')) {
      this.image = marioRight;
      this.rotateSpeed += rotateAcceleration;
    }
    this.rotateSpeed = clamp(this.rotateSpeed, -maxRotateSpeed, maxRotateSpeed);
    if (!ctx.input.key('a') && !ctx.input.key('d')) {
      this.rotateSpeed *= dampRotation;
    }
    this.dir += this.rotateSpeed;
    while (this.dir < -Math.PI) this.dir += 2 * Math.PI;
    while (this.dir > Math.PI) this.dir -= 2 * Math.PI;
  }
}

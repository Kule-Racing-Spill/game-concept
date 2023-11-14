import {
  PositionObject,
  GameContext,
  ImageAsset,
  clamp,
} from 'web-game-engine';

const sphere = new ImageAsset('./sphere.png');
// const marioLeft = new ImageAsset('./mario_left.png');
// const marioRight = new ImageAsset('./mario_right.png');

export class Player extends PositionObject {
  dir: number = 0;
  image: ImageAsset = sphere;
  speed: number = 0;
  rotateSpeed: number = 0;

  rotateAcceleration = 0.0003;
  maxRotateSpeed = 0.02;
  maxSpeed = 10;
  acceleration = 1;
  dampRotation = 0.9;
  dampSpeed = 0.98;

  constructor(x: number, y: number) {
    super(x, y);
  }

  onActivate(ctx: GameContext): void {
    sphere.__load(ctx.game);
    // marioLeft.__load(ctx.game);
    // marioRight.__load(ctx.game);
  }

  step(ctx: GameContext): void {
    if (ctx.input.key('w')) {
      this.image = sphere;
      if (this.speed + this.acceleration < this.maxSpeed) {
        this.speed += this.acceleration;
      }
    }
    if (ctx.input.key('s')) {
      this.image = sphere;
      if (this.speed - this.acceleration > -this.maxSpeed) {
        this.speed -= this.acceleration;
      }
    }

    this.speed *= this.dampSpeed;
    this.pos.x += Math.cos(this.dir) * this.speed;
    this.pos.y += Math.sin(this.dir) * this.speed;

    if (ctx.input.key('a')) {
      // this.image = marioLeft;
      this.rotateSpeed -= this.rotateAcceleration;
    }
    if (ctx.input.key('d')) {
      // this.image = marioRight;
      this.rotateSpeed += this.rotateAcceleration;
    }
    this.rotateSpeed = clamp(
      this.rotateSpeed,
      -this.maxRotateSpeed,
      this.maxRotateSpeed
    );
    if (
      (this.rotateSpeed > 0 && !ctx.input.key('d')) ||
      (this.rotateSpeed < 0 && !ctx.input.key('a'))
    ) {
      this.rotateSpeed *= this.dampRotation;
    }
    this.dir += this.rotateSpeed;
    while (this.dir < -Math.PI) this.dir += 2 * Math.PI;
    while (this.dir > Math.PI) this.dir -= 2 * Math.PI;
  }
}

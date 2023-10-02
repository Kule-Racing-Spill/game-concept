import {
  Game,
  DrawContext,
  ImageAsset,
  Vec2,
  clamp,
  TextObject,
} from 'web-game-engine';
import { Player } from './player';
import { Enemy, randomInt } from './enemy';

const game = new Game(document.querySelector('#app'));

export const mooImage = new ImageAsset('./moo.png');
mooImage.__load(game);

const worldSize = 10000;
const mooNumber = 1000;
const player = new Player(0, 0);
const entities: (Player | Enemy)[] = Array(mooNumber)
  .fill(null)
  .map(() => new Enemy(randomInt(0, worldSize), randomInt(0, worldSize)));
entities.push(player);
entities.forEach((enemy) => enemy.activate(game));

const cameraDistance = 512;

game.beforeDraw = (ctx: DrawContext) => {
  const canvasSize = ctx.game.getCanvasSize();
  const cameraPos = player.pos.minus(
    new Vec2(
      cameraDistance * Math.cos(player.dir),
      cameraDistance * Math.sin(player.dir)
    )
  );

  entities.sort(
    (a, b) => cameraPos.lengthTo(b.pos) - cameraPos.lengthTo(a.pos)
  );

  entities.forEach((entity) => {
    const dir = cameraPos.direction(entity.pos);
    const angle = Math.atan2(dir.y, dir.x);
    const dis = cameraPos.lengthTo(entity.pos);
    const scale = clamp(100 / Math.pow(dis, 0.8), 0.01, 2);
    const pos = new Vec2(
      canvasSize.x / 2 - 16 + dis * Math.cos(angle - player.dir - Math.PI / 2),
      canvasSize.y + dis * Math.sin(angle - player.dir - Math.PI / 2)
    );
    if (pos.y < canvasSize.y) {
      pos.y =
        canvasSize.y -
        Math.pow(Math.abs(canvasSize.y - pos.y), 0.5) -
        canvasSize.y / 6;
    }

    ctx.canvas.drawImage(entity.image, pos, scale);
  });

  entities.forEach((entity) => {
    ctx.canvas.drawImage(entity.image, entity.pos.multiply(0.01), 0.1);
  });
  ctx.canvas.drawLine(
    player.pos.multiply(0.01),
    player.pos
      .multiply(0.01)
      .plus(new Vec2(Math.cos(player.dir), Math.sin(player.dir)).multiply(5)),
    {}
  );
};

new TextObject(() => player.dir.toString(), 16, 16).activate(game);

game.play();

import {
  Game,
  DrawContext,
  ImageAsset,
  Vec2,
  clamp,
  // TextObject,
} from 'web-game-engine';
import { Player } from './player';
import { Enemy } from './enemy';
import { Bush } from './bush';

const level = `
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbb             bbbbbbbbbbbbbbbbbbbbbbbb                             bbbbbbb
bbbbbbb               bbbbbbbbbbbbbbbbbbbbbb                             bbbbbbb
bbbbbbb                     bbbbbbbbbbbbbbbb                              bbbbbb
bbbbbbb                     bbbbbbbbbbbbbbbbbbbbbbbbbbbb                  bbbbbb
bbbbbbb       bbbbb               bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb          bbbbbb
bbbbbbb       bbbbbbbbbbbb        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb          bbbbbb
bbbbbbb       bbbbbbbbbbbb        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb       bbbbbb
bbbbbbb       bbbbbbbbbbbb             bbbbbbbbbbbbbbbbbbbbbbbbbbbb       bbbbbb
bbbbbbb       bbbbbbbbbbbbbbbbbb       bbbbbbbbbbbbbbbbbbbbbbbbbbbb       bbbbbb
bbbbbbb       bbbbbbbbbbbbbbbbbb       bbbbbbbbbbbbbbbbbbbbbbbbbbbb       bbbbbb
bbbbbbb       bbbbbbbbbbbbbbbbbb                   bbbbbbbbbbbbbbbb       bbbbbb
bbbbbbb       bbbbbbbbbbbbbbbbbb                   bbbbbbbbbbbbbbbb       bbbbbb
bbbbbbb            bbbbbbbbbbbbbbbbbb              bbbbbbbbbbbbbbbb       bbbbbb
bbbbbbb            bbbbbbbbbbbbbbbbbb                                     bbbbbb
bbbbbbb            bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb                         bbbbbb
bbbbbbbbbbbb       bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb                         bbbbbb
bbbbbbbbbbbb       bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbb                             bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbb                                   bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbb                                                      bbbbbbbbbb
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb                                    bbbbbbbbbb
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb                                         bbbbb
bbbbbbbbb     bbbbbbbbbbbbbbbbbbbbbbbbbbb                                  bbbbb
bbbbbbbbb         bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb        bbbbb
bbbbb             bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb        bbbbb
bbbbb                                                                      bbbbb
bbbbb                                                                      bbbbb
bbbbbbbbb                                                             bbbbbbbbbb
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
`;

const game = new Game(document.querySelector('#app'));

export const mooImage = new ImageAsset('./moo.png');
mooImage.__load(game);
export const bushImage = new ImageAsset('./bush.png');
bushImage.__load(game);

const player = new Player(0, 0);
const entities: (Player | Enemy | Bush)[] = [player];
level.split('\n').forEach((line, y) =>
  line.split('').forEach((c, x) => {
    let entity;
    const xx = x * 32;
    const yy = y * 32;
    switch (c) {
      case 'b':
        entity = new Bush(xx, yy);
        break;
      case 'c':
        entity = new Enemy(xx, yy);
        break;
    }
    if (entity) {
      entities.push(entity);
    }
  })
);
entities.forEach((entity) => entity.activate(game));

const cameraDistance = 256;

game.beforeDraw = (ctx: DrawContext) => {
  const canvasSize = ctx.game.getCanvasSize();

  const skyHeight = canvasSize.y / 3;
  ctx.canvas.drawRect(new Vec2(0, 0), new Vec2(canvasSize.x, skyHeight + 1), {
    fillStyle: 'blue',
  });
  ctx.canvas.drawRect(
    new Vec2(0, skyHeight - 1),
    new Vec2(canvasSize.x, canvasSize.y),
    {
      fillStyle: 'green',
    }
  );

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
    let angle =
      Math.atan2(entity.pos.y - cameraPos.y, entity.pos.x - cameraPos.x) -
      player.dir;
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    if (!(-Math.PI / 2 < angle && angle < Math.PI / 2)) return;

    const dis = cameraPos.lengthTo(entity.pos);
    const scale = clamp(100 / Math.pow(dis, 0.8), 0.01, 2);
    const origin = new Vec2(canvasSize.x / 2 - 16, canvasSize.y);
    const offset = new Vec2(
      32 * Math.pow(dis, 0.4) * Math.cos(angle - Math.PI / 2),
      16 * Math.pow(dis, 0.3) * Math.sin(angle - Math.PI / 2)
    );
    ctx.canvas.drawImage(entity.image, origin.plus(offset), scale);
  });

  // Minimap

  // entities.forEach((entity) => {
  //   ctx.canvas.drawImage(entity.image, entity.pos.multiply(0.01), 0.1);
  // });
  // ctx.canvas.drawLine(
  //   player.pos.multiply(0.01),
  //   player.pos
  //     .multiply(0.01)
  //     .plus(new Vec2(Math.cos(player.dir), Math.sin(player.dir)).multiply(5)),
  //   {}
  // );
};

// new TextObject(() => player.dir.toString(), 16, 16).activate(game);

game.play();

import { Game, ImageAsset, Vec2, clamp } from 'web-game-engine';
import { Player } from './player';
import { Enemy } from './enemy';
import { Barrel } from './barrel';
import { Boost } from './boost';

const level = `
  bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb  
 b                                                                            b 
b    c    c     q        c       c        c            c                       b
b                                                                              b
b  c  bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb     b
b    b                                                                    b    b
b   b                                                                      b   b
b c b                                                                      b   b
b   b                                                                      b q b
b c b                                                                      b   b
b   b                                                                      b   b
b c b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b q b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b   b                                                                      b   b
b    b                                                                    b    b
b     bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb     b
b                                                                              b
b                                          q           q           q           b
 b                                                                            b 
  bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb  
`;

const game = new Game(document.querySelector('#app'));
game.setOptions({ scale: 1, height: 480, width: 800 });

export const sphereImage = new ImageAsset('./sphere-16.png');
sphereImage.__load(game);
export const enemyImage = new ImageAsset('./sphere-16-red.png');
enemyImage.__load(game);
export const barrelImage = new ImageAsset('./barrel.png');
barrelImage.__load(game);
export const boostImage = new ImageAsset('./boost-16.png');
boostImage.__load(game);

const player = new Player(2 * 32, 10 * 32);
export const entities: (Player | Enemy | Barrel)[] = [player];
level.split('\n').forEach((line, y) =>
  line.split('').forEach((c, x) => {
    let entity;
    const xx = x * 64;
    const yy = y * 64;
    switch (c) {
      case 'b':
        entity = new Barrel(xx, yy);
        break;
      case 'c':
        entity = new Enemy(xx, yy);
        break;
      case 'q':
        entity = new Boost(xx, yy);
        break;
    }
    if (entity) {
      entities.push(entity);
    }
  })
);
entities.forEach((entity) => entity.activate(game));

const cameraDistance = 256;

export const findClosestEntity = (
  entities: (Player | Enemy | Barrel)[],
  pos: Vec2,
  name: string = '',
  maxDistance: number = -1
) => {
  let minDistance = Infinity;
  let closestEntity = null;

  for (const other of entities) {
    if (other.pos == pos) continue;
    if (name && !(other.constructor.name == name)) continue;
    const distance = other.pos.lengthTo(pos);
    if (distance < minDistance) {
      minDistance = distance;
      closestEntity = other;
    }
  }
  if (maxDistance == -1) return closestEntity;
  if (minDistance < maxDistance) return closestEntity;
  return null;
};

export const findClosestEntities = (pos: Vec2, n: number) => {
  return entities
    .sort((a, b) => a.pos.lengthTo(pos) - b.pos.lengthTo(pos))
    .slice(0, n);
};

game.beforeDraw = (ctx) => {
  const canvasSize = ctx.game.getCanvasSize();

  const skyHeight = canvasSize.y / 5;
  ctx.canvas.drawRect(new Vec2(0, 0), new Vec2(canvasSize.x, canvasSize.y), {
    fillStyle: 'green',
  });
  ctx.canvas.drawRect(new Vec2(0, 0), new Vec2(canvasSize.x, skyHeight + 1), {
    fillStyle: 'blue',
  });

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
    const scale = clamp(200 / Math.pow(dis, 0.8), 0.01, 10);
    const origin = new Vec2(canvasSize.x / 2 - 16, canvasSize.y);
    const offset = new Vec2(
      32 * Math.pow(dis, 0.4) * Math.cos(angle - Math.PI / 2),
      16 * Math.pow(dis, 0.35) * Math.sin(angle - Math.PI / 2)
    );

    ctx.canvas.drawImage(
      entity.image,
      origin.plus(offset),
      Math.round(scale * 100) / 100
    );
  });
};

game.play();

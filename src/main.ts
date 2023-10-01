import { Game, DrawContext, ImageAsset, Vec2, clamp } from 'web-game-engine';
import { Player } from './player';
import { Enemy, randomInt } from './enemy';

const game = new Game(document.querySelector('#app'));

const playerImage = new ImageAsset('./player.png');
const enemyImage = new ImageAsset('./enemy.png');
playerImage.__load(game);
enemyImage.__load(game);

const player = new Player(0, 0);
const entities: (Player | Enemy)[] = Array(100)
  .fill(null)
  .map(() => new Enemy(randomInt(-200, 200), randomInt(-200, 200)));
entities.push(player);
entities.forEach((enemy) => enemy.activate(game));

game.beforeDraw = (ctx: DrawContext) => {
  const canvasSize = ctx.game.getCanvasSize();
  const cameraDistance = 128;
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
    let image: ImageAsset | null = null;
    if (entity instanceof Player) {
      image = playerImage;
    }
    if (entity instanceof Enemy) {
      image = enemyImage;
    }
    if (!image) {
      return;
    }

    const dir = cameraPos.direction(entity.pos);
    const angle = Math.atan2(dir.y, dir.x);
    const dis = cameraPos.lengthTo(entity.pos);
    const scale = clamp(25 / Math.pow(dis, 0.6), 0.1, 3);
    const pos = new Vec2(
      canvasSize.x / 2 - 16 + dis * Math.cos(angle - player.dir - Math.PI / 2),
      canvasSize.y + dis * Math.sin(angle - player.dir - Math.PI / 2)
    );
    if (pos.y < canvasSize.y) {
      pos.y = canvasSize.y - Math.pow(Math.abs(canvasSize.y - pos.y), 0.75);
    }

    ctx.canvas.drawImage(image, pos, scale);
  });
};

game.play();

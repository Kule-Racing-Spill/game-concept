import { Game, TextObject } from 'web-game-engine';

const game = new Game(document.querySelector('#app'));

new TextObject(() => `FPS: ${game.currentFps.toFixed(1)}`, 8, 8).activate(game);

game.play();

// 入口：开局设置 → 初始化场景与游戏 → 运行回合循环
import { TILES } from './config.js';
import { Scene3D } from './scene3d.js';
import { Game } from './game.js';
import { UI } from './ui.js';

async function main() {
  const ui = new UI();
  const scene = new Scene3D(document.getElementById('scene'));
  scene.buildBoard(TILES);

  const configs = await ui.showSetup();

  const game = new Game(configs, scene, ui);
  ui.bind(game);
  game.players.forEach((p) => scene.addToken(p.id, p.color, p.position));
  ui.setCurrent(game.players[0]);
  ui.refresh();
  ui.log('🎮 游戏开始！率先获得 10 AI 积分者获胜。');

  game.run();
}

main();

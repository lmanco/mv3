import Phaser from 'phaser';
import { MainScene } from './scenes/mainScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1200 },
      debug: false,
    },
  },
  scene: MainScene,
  parent: 'game-container',
  backgroundColor: '#181818',
};

export default config;

import Phaser from 'phaser';
import { Player } from '../player';

export class MainScene extends Phaser.Scene {
  player!: Player;

  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.spritesheet('player_idle', '/sprites/characters/wolf/standard/idle.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('player_walk', '/sprites/characters/wolf/standard/walk.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
    this.load.on('loaderror', (file: any) => {
      console.warn('Failed to load asset:', file.key, file.src);
    });
  }

  create() {
    this.cameras.main.setBackgroundColor('#181818');
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    if (!this.textures.exists('player_idle')) {
      this.add.text(100, 100, 'ERROR: idle.png not loaded', { color: '#f00' });
      return;
    }
    if (!this.textures.exists('player_walk')) {
      this.add.text(100, 120, 'ERROR: walk.png not loaded', { color: '#f00' });
      return;
    }

    Player.setupAnimations(this);
    this.player = new Player(this, 100, 450);
    this.physics.add.collider(this.player, platforms);
    this.cameras.main.startFollow(this.player);
    this.player.play('idle_right');
  }

  update() {
    if (this.player) {
      this.player.update();
    }
  }
}

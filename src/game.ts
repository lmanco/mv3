import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
  }

  create() {
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0); // No bounce for rigid feel
    // Only set these if body is available and is a dynamic body
    const body = this.player.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      body.setMaxVelocity(250, 600);
      body.setDragX(2000); // Instant stop when no input
    }

    this.physics.add.collider(this.player, platforms);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.startFollow(this.player);
  }

  update() {
    const speed = 220;
    const jumpVelocity = -400;
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (this.cursors.left?.isDown) {
      body.setVelocityX(-speed);
    } else if (this.cursors.right?.isDown) {
      body.setVelocityX(speed);
    } else {
      body.setVelocityX(0);
    }

    if (this.cursors.up?.isDown && body.blocked.down) {
      body.setVelocityY(jumpVelocity);
    }
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1200 }, // Strong gravity for snappy jumps
      debug: false,
    },
  },
  scene: MainScene,
  parent: 'game-container',
};

export default config;

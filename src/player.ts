import Phaser from 'phaser';

const FRAME_SIZE = 64;

export type Direction = 'left' | 'right';

export class Player extends Phaser.Physics.Arcade.Sprite {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  lastDirection: Direction = 'right';
  idleCols = 4;
  walkCols = 4;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_idle', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.setCollideWorldBounds(true);
    this.setBounce(0);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setMaxVelocity(250, 600);
    body.setDragX(2000);
    this.cursors = scene.input.keyboard!.createCursorKeys();
  }

  static setupAnimations(scene: Phaser.Scene) {
    // Dynamically calculate columns for idle and walk
    const idleTex = scene.textures.get('player_idle').getSourceImage();
    const walkTex = scene.textures.get('player_walk').getSourceImage();
    const idleCols = Math.floor(idleTex.width / FRAME_SIZE);
    const walkCols = Math.floor(walkTex.width / FRAME_SIZE);
    // Helper to get frame index for a given row and col
    const frameIndex = (row: number, col: number, cols: number) => row * cols + col;
    // Animations: row 1 = left, row 3 = right
    scene.anims.create({
      key: 'idle_right',
      frames: scene.anims.generateFrameNumbers('player_idle', { start: frameIndex(3, 0, idleCols), end: frameIndex(3, idleCols - 1, idleCols) }),
      frameRate: 6,
      repeat: -1,
    });
    scene.anims.create({
      key: 'idle_left',
      frames: scene.anims.generateFrameNumbers('player_idle', { start: frameIndex(1, 0, idleCols), end: frameIndex(1, idleCols - 1, idleCols) }),
      frameRate: 6,
      repeat: -1,
    });
    scene.anims.create({
      key: 'walk_right',
      frames: scene.anims.generateFrameNumbers('player_walk', { start: frameIndex(3, 0, walkCols), end: frameIndex(3, walkCols - 1, walkCols) }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'walk_left',
      frames: scene.anims.generateFrameNumbers('player_walk', { start: frameIndex(1, 0, walkCols), end: frameIndex(1, walkCols - 1, walkCols) }),
      frameRate: 10,
      repeat: -1,
    });
  }

  update() {
    const speed = 220;
    const jumpVelocity = -400;
    const body = this.body as Phaser.Physics.Arcade.Body;
    let moving = false;
    if (this.cursors.left?.isDown) {
      body.setVelocityX(-speed);
      this.lastDirection = 'left';
      this.play('walk_left', true);
      moving = true;
    } else if (this.cursors.right?.isDown) {
      body.setVelocityX(speed);
      this.lastDirection = 'right';
      this.play('walk_right', true);
      moving = true;
    } else {
      body.setVelocityX(0);
    }
    if (!moving) {
      if (this.lastDirection === 'left') {
        this.play('idle_left', true);
      } else {
        this.play('idle_right', true);
      }
    }
    if (this.cursors.up?.isDown && body.blocked.down) {
      body.setVelocityY(jumpVelocity);
    }
  }
}

import Phaser from 'phaser';

// --- Functional Player Implementation ---

// Player state type
export type PlayerState = {
  sprite: Phaser.Physics.Arcade.Sprite;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  lastDirection: 'left' | 'right';
};

// Factory function to create the player
export function createPlayer(scene: Phaser.Scene, x: number, y: number): PlayerState {
  const sprite = scene.physics.add.sprite(x, y, 'player_idle', 0);
  sprite.setOrigin(0.5, 0.5);
  sprite.setCollideWorldBounds(true);
  sprite.setBounce(0);
  sprite.body.setMaxVelocity(250, 600);
  (sprite.body as Phaser.Physics.Arcade.Body).setDragX(2000);
  const cursors = scene.input.keyboard!.createCursorKeys();
  return { sprite, cursors, lastDirection: 'right' };
}

// Setup player animations
export function setupPlayerAnimations(scene: Phaser.Scene) {
  const FRAME_SIZE = 64;
  const idleTex = scene.textures.get('player_idle').getSourceImage();
  const walkTex = scene.textures.get('player_walk').getSourceImage();
  const idleCols = Math.floor(idleTex.width / FRAME_SIZE);
  const walkCols = Math.floor(walkTex.width / FRAME_SIZE);
  const frameIndex = (row: number, col: number, cols: number) => row * cols + col;
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

// Player update logic
export function updatePlayer(state: PlayerState) {
  const speed = 220;
  const jumpVelocity = -400;
  const body = state.sprite.body as Phaser.Physics.Arcade.Body;
  let moving = false;
  if (state.cursors.left?.isDown) {
    body.setVelocityX(-speed);
    state.lastDirection = 'left';
    state.sprite.play('walk_left', true);
    moving = true;
  } else if (state.cursors.right?.isDown) {
    body.setVelocityX(speed);
    state.lastDirection = 'right';
    state.sprite.play('walk_right', true);
    moving = true;
  } else {
    body.setVelocityX(0);
  }
  if (!moving) {
    if (state.lastDirection === 'left') {
      state.sprite.play('idle_left', true);
    } else {
      state.sprite.play('idle_right', true);
    }
  }
  if (state.cursors.up?.isDown && body.blocked.down) {
    body.setVelocityY(jumpVelocity);
  }
}

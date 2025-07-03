import Phaser from 'phaser';

// --- Functional Player Implementation ---

// Player state type
export type PlayerState = {
  sprite: Phaser.Physics.Arcade.Sprite;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  lastDirection: 'left' | 'right';
  aKey?: Phaser.Input.Keyboard.Key;
  wasd?: {
    up: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
  };
};

// Factory function to create the player
export function createPlayer(scene: Phaser.Scene, x: number, y: number): PlayerState {
  const sprite = scene.physics.add.sprite(x, y, 'player_idle', 0);
  sprite.setOrigin(0.5, 1); // bottom center for better collision feel
  sprite.setCollideWorldBounds(true);
  sprite.setBounce(0);
  sprite.body.setMaxVelocity(250, 600);
  (sprite.body as Phaser.Physics.Arcade.Body).setDragX(2000);
  // Tighter collision box, bottom-aligned
  sprite.body.setSize(36, 52);
  sprite.body.setOffset(14, 12);
  // Add A key for jump
  const cursors = scene.input.keyboard!.createCursorKeys();
  const aKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  // WASD and Space
  const wasd = {
    up: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    left: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    down: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    right: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    space: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
  };
  return { sprite, cursors, lastDirection: 'right', aKey, wasd };
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
    frameRate: 3, // Slower idle
    repeat: -1,
  });
  scene.anims.create({
    key: 'idle_left',
    frames: scene.anims.generateFrameNumbers('player_idle', { start: frameIndex(1, 0, idleCols), end: frameIndex(1, idleCols - 1, idleCols) }),
    frameRate: 3, // Slower idle
    repeat: -1,
  });
  scene.anims.create({
    key: 'walk_right',
    frames: scene.anims.generateFrameNumbers('player_walk', { start: frameIndex(3, 0, walkCols), end: frameIndex(3, walkCols - 1, walkCols) }),
    frameRate: 12, // Faster walk
    repeat: -1,
  });
  scene.anims.create({
    key: 'walk_left',
    frames: scene.anims.generateFrameNumbers('player_walk', { start: frameIndex(1, 0, walkCols), end: frameIndex(1, walkCols - 1, walkCols) }),
    frameRate: 12, // Faster walk
    repeat: -1,
  });
}

// Player update logic
export function updatePlayer(state: PlayerState & { aKey?: Phaser.Input.Keyboard.Key }) {
  const speed = 220;
  const jumpVelocity = -400;
  const body = state.sprite.body as Phaser.Physics.Arcade.Body;

  // --- Keyboard movement (arrows or WASD) ---
  const left = state.cursors.left?.isDown || state.wasd?.left.isDown;
  const right = state.cursors.right?.isDown || state.wasd?.right.isDown;
  // If both left and right are pressed, stop and keep facing
  if (left && right) {
    body.setVelocityX(0);
    // Do not change lastDirection
  } else if (left) {
    body.setVelocityX(-speed);
    state.lastDirection = 'left';
  } else if (right) {
    body.setVelocityX(speed);
    state.lastDirection = 'right';
  } else {
    body.setVelocityX(0);
  }

  // --- Gamepad movement ---
  const pads = state.sprite.scene.input.gamepad?.gamepads || [];
  let pad = pads.find(p => p && p.connected);
  if (pad) {
    const axisH = pad.axes.length > 0 ? pad.axes[0].getValue() : 0;
    // If both left and right D-pad or stick are pressed, stop
    if ((pad.left && pad.right) || (axisH < -0.2 && axisH > 0.2)) {
      body.setVelocityX(0);
    } else if (pad.left || axisH < -0.2) {
      body.setVelocityX(-speed);
      state.lastDirection = 'left';
    } else if (pad.right || axisH > 0.2) {
      body.setVelocityX(speed);
      state.lastDirection = 'right';
    }
  }

  // Animation: use velocity, not just key state
  if (Math.abs(body.velocity.x) > 5) {
    if (body.velocity.x < 0) {
      state.sprite.play('walk_left', true);
    } else {
      state.sprite.play('walk_right', true);
    }
  } else {
    if (state.lastDirection === 'left') {
      state.sprite.play('idle_left', true);
    } else {
      state.sprite.play('idle_right', true);
    }
  }

  // --- Jump: Space bar (keyboard) or X/cross (gamepad) only ---
  const jumpKey = state.wasd?.space.isDown;
  // --- Gamepad jump (X/cross or D-pad up) ---
  let padJump = false;
  if (pad) {
    padJump = pad.buttons[0]?.pressed; // X/cross on PS4
  }
  if ((jumpKey || padJump) && body.blocked.down) {
    body.setVelocityY(jumpVelocity);
  }
}

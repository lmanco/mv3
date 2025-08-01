
import Phaser from 'phaser';

// Animate player spin (for testing or flip effect)
// Removed flip logic; replaced with dust cloud effect
// This function is no longer needed

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
  wasJumpDown?: boolean;
  jumpXVelocity?: number;
  jumpCount?: number;
  isFlipping?: boolean;
  flipStartY?: number;
  _spinTest?: number;
};


export function createPlayer(scene: Phaser.Scene, x: number, y: number): PlayerState {
  const sprite = scene.physics.add.sprite(x, y, 'player_idle', 0);
  sprite.setOrigin(0.5, 0.9); // Feet origin for platformer

// DUST CLOUD ANIMATION SETUP:
// Place FX052_01.png ... FX052_04.png in public/sprites/fx/dust/
// In mainScene.ts preload():
//   this.load.image('dust1', 'sprites/fx/dust/FX052_01.png');
//   this.load.image('dust2', 'sprites/fx/dust/FX052_02.png');
//   this.load.image('dust3', 'sprites/fx/dust/FX052_03.png');
//   this.load.image('dust4', 'sprites/fx/dust/FX052_04.png');
// In mainScene.ts create():
//   this.anims.create({
//     key: 'dust_cloud',
//     frames: [
//       { key: 'dust1' },
//       { key: 'dust2' },
//       { key: 'dust3' },
//       { key: 'dust4' }
//     ],
//     frameRate: 16,
//     repeat: 0,
//     hideOnComplete: true
//   });
  sprite.setCollideWorldBounds(true);
  sprite.setBounce(0);
  sprite.body.setMaxVelocity(250, 600);
  (sprite.body as Phaser.Physics.Arcade.Body).setDragX(2000);
  sprite.body.setSize(36, 52);
  sprite.body.setOffset(14, 12);
  const cursors = scene.input.keyboard!.createCursorKeys();
  const aKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  const wasd = {
    up: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    left: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    down: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    right: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    space: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
  };
  return { sprite, cursors, lastDirection: 'right', aKey, wasd, jumpCount: 0, isFlipping: false };
}

// Setup player animations
export function setupPlayerAnimations(scene: Phaser.Scene) {
  const FRAME_SIZE = 64;
  const idleTex = scene.textures.get('player_idle').getSourceImage();
  const walkTex = scene.textures.get('player_walk').getSourceImage();
  const idleCols = Math.floor(idleTex.width / FRAME_SIZE);
  const walkCols = Math.floor(walkTex.width / FRAME_SIZE);
  const frameIndex = (row: number, col: number, cols: number) => row * cols + col;

  // Idle breathing: only two frames, slow inhale/exhale
  scene.anims.create({
    key: 'idle_right',
    frames: [
      { key: 'player_idle', frame: frameIndex(3, 0, idleCols) },
      { key: 'player_idle', frame: frameIndex(3, 1, idleCols) }
    ],
    frameRate: 1,
    repeat: -1,
  });
  scene.anims.create({
    key: 'idle_left',
    frames: [
      { key: 'player_idle', frame: frameIndex(1, 0, idleCols) },
      { key: 'player_idle', frame: frameIndex(1, 1, idleCols) }
    ],
    frameRate: 1,
    repeat: -1,
  });

  // Walk animations
  scene.anims.create({
    key: 'walk_right',
    frames: scene.anims.generateFrameNumbers('player_walk', { start: frameIndex(3, 0, walkCols), end: frameIndex(3, walkCols - 1, walkCols) }),
    frameRate: 12,
    repeat: -1,
  });
  scene.anims.create({
    key: 'walk_left',
    frames: scene.anims.generateFrameNumbers('player_walk', { start: frameIndex(1, 0, walkCols), end: frameIndex(1, walkCols - 1, walkCols) }),
    frameRate: 12,
    repeat: -1,
  });

  // Jump animations
  if (scene.textures.exists('player_jump')) {
    const jumpTex = scene.textures.get('player_jump').getSourceImage();
    const jumpCols = Math.floor(jumpTex.width / 64);
    scene.anims.create({
      key: 'jump_up',
      frames: scene.anims.generateFrameNumbers('player_jump', { start: 0 * jumpCols, end: 0 * jumpCols + jumpCols - 1 }),
      frameRate: 16,
      repeat: 0,
      showOnStart: true,
      hideOnComplete: false
    });
    scene.anims.create({
      key: 'jump_left',
      frames: scene.anims.generateFrameNumbers('player_jump', { start: 1 * jumpCols, end: 1 * jumpCols + jumpCols - 1 }),
      frameRate: 16,
      repeat: 0,
      showOnStart: true,
      hideOnComplete: false
    });
    scene.anims.create({
      key: 'jump_down',
      frames: scene.anims.generateFrameNumbers('player_jump', { start: 2 * jumpCols, end: 2 * jumpCols + jumpCols - 1 }),
      frameRate: 16,
      repeat: 0,
      showOnStart: true,
      hideOnComplete: false
    });
    scene.anims.create({
      key: 'jump_right',
      frames: scene.anims.generateFrameNumbers('player_jump', { start: 3 * jumpCols, end: 3 * jumpCols + jumpCols - 1 }),
      frameRate: 16,
      repeat: 0,
      showOnStart: true,
      hideOnComplete: false
    });
  } else {
    console.warn('Texture "player_jump" not found, jump animation will be skipped.');
  }
}

// Player update logic
export function updatePlayer(state: PlayerState & { aKey?: Phaser.Input.Keyboard.Key }) {
  const speed = 160; // Slower walk speed
  const jumpVelocity = -400; // Lower jump for more weight
  const jumpCutMultiplier = 0.35; // How much to reduce upward velocity on jump cut
  const body = state.sprite.body as Phaser.Physics.Arcade.Body;

  // --- Keyboard movement (arrows or WASD) ---
  const left = state.cursors.left?.isDown || state.wasd?.left.isDown;
  const right = state.cursors.right?.isDown || state.wasd?.right.isDown;

  // --- Rigid movement: only allow direction change when grounded ---
  if (body.blocked.down) {
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
    state.jumpXVelocity = undefined; // Reset jumpXVelocity when grounded
    state.jumpCount = 0; // Reset jump count on landing
    state.isFlipping = false; // Reset flip state
    // Do NOT reset angle here; let flip logic handle it
  } else if (state.jumpXVelocity !== undefined) {
    // While airborne, keep x velocity locked
    body.setVelocityX(state.jumpXVelocity);
  }

  // --- Gamepad movement ---
  const pads = state.sprite.scene.input.gamepad?.gamepads || [];
  let pad = pads.find(p => p && p.connected);
  if (pad && body.blocked.down) {
    const axisH = pad.axes.length > 0 ? pad.axes[0].getValue() : 0;
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

  // --- Jump: Space bar (keyboard) or X/cross (gamepad) only ---
  const jumpKey = state.wasd?.space.isDown;
  let padJump = false;
  if (pad) {
    padJump = pad.buttons[0]?.pressed; // X/cross on PS4
  }
  const jumpDown = !!jumpKey || !!padJump;

  // Edge-triggered jump: only start jump on new press
  // Edge-triggered jump: allow double jump
  if (jumpDown && !state.wasJumpDown) {
    if (body.blocked.down) {
      // First jump
      body.setVelocityY(jumpVelocity);
      if (left && !right) {
        state.jumpXVelocity = -speed;
        body.setVelocityX(-speed);
        state.lastDirection = 'left';
      } else if (right && !left) {
        state.jumpXVelocity = speed;
        body.setVelocityX(speed);
        state.lastDirection = 'right';
      } else {
        state.jumpXVelocity = 0;
        body.setVelocityX(0);
      }
      state.jumpCount = 1;
      // Play jump animation
      const anims = state.sprite.anims.animationManager;
      if (anims.exists('jump_left') && state.lastDirection === 'left') {
        state.sprite.play('jump_left', true);
      } else if (anims.exists('jump_right') && state.lastDirection === 'right') {
        state.sprite.play('jump_right', true);
      } else if (anims.exists('jump_up')) {
        state.sprite.play('jump_up', true);
      } else {
        state.sprite.play('idle_right', true);
      }
    } else if ((state.jumpCount ?? 0) < 2) {
      // Second jump (double jump)
      body.setVelocityY(jumpVelocity);
      state.jumpCount = 2;
      // Play jump animation
      const anims = state.sprite.anims.animationManager;
      if (anims.exists('jump_left') && state.lastDirection === 'left') {
        state.sprite.play('jump_left', true);
      } else if (anims.exists('jump_right') && state.lastDirection === 'right') {
        state.sprite.play('jump_right', true);
      } else if (anims.exists('jump_up')) {
        state.sprite.play('jump_up', true);
      } else {
        state.sprite.play('idle_right', true);
      }
      // Trigger dust cloud animation (only if at least one frame is loaded)
      const scene = state.sprite.scene;
      let dustFrame = 'dust1';
      for (let i = 1; i <= 4; i++) {
        if (scene.textures.exists('dust' + i)) {
          dustFrame = 'dust' + i;
          break;
        }
      }
      if (scene.anims.exists('dust_cloud') && scene.textures.exists(dustFrame)) {
        const dust = scene.add.sprite(
          state.sprite.x,
          state.sprite.y + state.sprite.height * 0.5 - 30,
          dustFrame
        );
        dust.setOrigin(0.5, 1);
        dust.setDepth(state.sprite.depth - 1); // Behind player
        dust.play('dust_cloud');
        // Ensure dust sprite is visible for the animation duration
        dust.on('animationcomplete', () => {
          dust.destroy();
        });
      }
    }
  }
  // ...existing code...

  // --- Flip animation removed; no sprite rotation ---
  state.sprite.setAngle(0);

  // Jump cut: on jump release while rising, cut velocity
  if (!jumpDown && state.wasJumpDown && body.velocity.y < 0) {
    body.setVelocityY(body.velocity.y * jumpCutMultiplier);
  }

  state.wasJumpDown = jumpDown;

  // Animation: use velocity, not just key state
  if (!body.blocked.down) {
    // If jump animation is not playing, show last frame of jump anim
    const anims = state.sprite.anims.animationManager;
    const currentAnim = state.sprite.anims.currentAnim?.key;
    if (state.lastDirection === 'left' && anims.exists('jump_left')) {
      if (currentAnim !== 'jump_left') {
        state.sprite.play('jump_left', true);
      }
    } else if (state.lastDirection === 'right' && anims.exists('jump_right')) {
      if (currentAnim !== 'jump_right') {
        state.sprite.play('jump_right', true);
      }
    } else if (anims.exists('jump_up')) {
      if (currentAnim !== 'jump_up') {
        state.sprite.play('jump_up', true);
      }
    } else {
      // fallback to idle
      state.sprite.play('idle_right', true);
    }
  } else if (Math.abs(body.velocity.x) > 5) {
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
}

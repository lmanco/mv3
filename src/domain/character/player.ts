
import Phaser from 'phaser';
import {
  Action,
  SidescrollerDirection,
  Direction,
  getTexture,
  createActionAnims,
  AnimKeys,
  createSpriteKey
} from './common';

export type KeyboardInput = {
  up: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  space: Phaser.Input.Keyboard.Key;
}

export const KeyboardInput = {
  [Direction.LEFT]: Phaser.Input.Keyboard.KeyCodes.A,
  [Direction.RIGHT]: Phaser.Input.Keyboard.KeyCodes.D,
  [Direction.UP]: Phaser.Input.Keyboard.KeyCodes.W,
  [Direction.DOWN]: Phaser.Input.Keyboard.KeyCodes.S,
  space: Phaser.Input.Keyboard.KeyCodes.SPACE,
} as const;


export type PlayerState = {
  sprite: Phaser.Physics.Arcade.Sprite;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  lastDirection: SidescrollerDirection;
  keyboardInput: KeyboardInput;
  wasJumpDown: boolean;
  jumpXVelocity: number;
  jumpCount: number;
};

export const FRAME_SIZE = 64;

export const PLAYER_PREFIX = 'player';

export const PlayerAnims = Object.values(Action)
  .reduce((acc, action) => {
    acc[action] = createSpriteKey(action, PLAYER_PREFIX);
    return acc;
  }, {} as Record<Action, string>);

function createPlayerSprite(
  physics: Phaser.Physics.Arcade.ArcadePhysics,
  x: number,
  y: number,
): Phaser.Physics.Arcade.Sprite {
  const sprite = physics.add.sprite(x, y, PlayerAnims.idle, 0);
  sprite.setOrigin(0.5, 0.9); // Feet origin for platformer
  sprite.setCollideWorldBounds(true);
  sprite.setBounce(0);
  sprite.body.setMaxVelocity(250, 600);
  (sprite.body as Phaser.Physics.Arcade.Body).setDragX(2000);
  sprite.body.setSize(36, 52);
  sprite.body.setOffset(14, 12);
  return sprite;
}

function addKeyboardInput(input: Phaser.Input.InputPlugin): KeyboardInput {
  return Object.keys(KeyboardInput).reduce((keys, key) => {
    const keyCode = KeyboardInput[key as keyof typeof KeyboardInput];
    keys[key as keyof typeof KeyboardInput] = input.keyboard!.addKey(keyCode);
    return keys;
  }, {} as Record<keyof typeof KeyboardInput, Phaser.Input.Keyboard.Key>) as KeyboardInput;
};

export function createPlayer(scene: Phaser.Scene, x: number, y: number): PlayerState {
  const sprite = createPlayerSprite(scene.physics, x, y);
  const cursors = scene.input.keyboard!.createCursorKeys();
  const keyboardInput = addKeyboardInput(scene.input);
  return {
    sprite,
    cursors,
    lastDirection: SidescrollerDirection.RIGHT,
    keyboardInput,
    jumpCount: 0,
    wasJumpDown: false,
    jumpXVelocity: 0
  };
}

// Setup player animations
export function setupPlayerAnimations(scene: Phaser.Scene) {
  const actionTextures = {
    [Action.IDLE]: getTexture(scene, PlayerAnims.idle),
    [Action.WALK]: getTexture(scene, PlayerAnims.walk),
    [Action.JUMP]: getTexture(scene, PlayerAnims.jump),
  } as const;

  // Create action animations for all directions
  // This will create idle, walk, jump animations for each direction
  // e.g. idle_left, idle_right, walk_left, walk_right, etc.
  const sidescrollerDirections = Object.values(SidescrollerDirection);
  Object.values(Action).forEach((action) => {
    const cols = actionTextures[action] ?
      Math.floor(actionTextures[action].width / FRAME_SIZE) :
      0;
    createActionAnims(action, sidescrollerDirections, scene.anims, cols, PLAYER_PREFIX);
  });
}

const PLAYER_CONSTANTS = {
  SPEED: 160, // Slower walk speed
  JUMP_VELOCITY: -400, // Lower jump for more weight
  JUMP_CUT_MULTIPLIER: 0.35, // How much to reduce upward velocity on jump cut
} as const;

function handleKeyboardInput(state: PlayerState) {
  return {
    left: state.cursors.left?.isDown || state.keyboardInput?.left.isDown,
    right: state.cursors.right?.isDown || state.keyboardInput?.right.isDown,
  };
}

function handleGamepadInput(state: PlayerState) {
  const pads = state.sprite.scene.input.gamepad?.gamepads || [];
  const pad = pads.find(p => p && p.connected);
  if (!pad) return null;

  const axisH = pad.axes.length > 0 ? pad.axes[0].getValue() : 0;
  return {
    pad,
    left: pad.left || axisH < -0.2,
    right: pad.right || axisH > 0.2,
    jump: pad.buttons[0]?.pressed
  };
}

function handleGroundMovement(state: PlayerState, body: Phaser.Physics.Arcade.Body, left: boolean, right: boolean) {
  if (left && right) {
    body.setVelocityX(0);
    // Do not change lastDirection
  } else if (left) {
    body.setVelocityX(-PLAYER_CONSTANTS.SPEED);
    state.lastDirection = SidescrollerDirection.LEFT;
  } else if (right) {
    body.setVelocityX(PLAYER_CONSTANTS.SPEED);
    state.lastDirection = SidescrollerDirection.RIGHT;
  } else {
    body.setVelocityX(0);
  }
  state.jumpXVelocity = 0; // Reset jumpXVelocity when grounded
  state.jumpCount = 0; // Reset jump count on landing
}

function playJumpAnimation(state: PlayerState) {
  const anims = state.sprite.anims.animationManager;
  const animKeys = AnimKeys(PLAYER_PREFIX);
  if (!anims.exists(animKeys.jump[state.lastDirection]))
    return;
  state.sprite.play(animKeys.jump[state.lastDirection], true);
}

const DUST_CONFIG = {
  FRAMES: ['dust1', 'dust2', 'dust3', 'dust4'] as const,
  ANIM_KEY: 'dust_cloud',
  Y_OFFSET: 30,
} as const;

function findFirstExistingTexture(scene: Phaser.Scene, textures: readonly string[]): string | null {
  return textures.find(texture => scene.textures.exists(texture)) || null;
}

function createDustCloud(state: PlayerState) {
  const scene = state.sprite.scene;
  const dustFrame = findFirstExistingTexture(scene, DUST_CONFIG.FRAMES);

  if (!dustFrame || !scene.anims.exists(DUST_CONFIG.ANIM_KEY)) return;

  const dust = scene.add.sprite(
    state.sprite.x,
    state.sprite.y + state.sprite.height * 0.5 - DUST_CONFIG.Y_OFFSET,
    dustFrame
  ).setOrigin(0.5, 1)
    .setDepth(state.sprite.depth - 1)
    .play(DUST_CONFIG.ANIM_KEY)
    .once('animationcomplete', () => dust.destroy());
}

function handleJump(state: PlayerState, body: Phaser.Physics.Arcade.Body, jumpDown: boolean, left: boolean, right: boolean) {
  if (jumpDown && !state.wasJumpDown) {
    if (body.blocked.down) {
      // First jump
      body.setVelocityY(PLAYER_CONSTANTS.JUMP_VELOCITY);
      if (left && !right) {
        state.jumpXVelocity = -PLAYER_CONSTANTS.SPEED;
        body.setVelocityX(-PLAYER_CONSTANTS.SPEED);
        state.lastDirection = SidescrollerDirection.LEFT;
      } else if (right && !left) {
        state.jumpXVelocity = PLAYER_CONSTANTS.SPEED;
        body.setVelocityX(PLAYER_CONSTANTS.SPEED);
        state.lastDirection = SidescrollerDirection.RIGHT;
      } else {
        state.jumpXVelocity = 0;
        body.setVelocityX(0);
      }
      state.jumpCount = 1;
      playJumpAnimation(state);
    } else if ((state.jumpCount ?? 0) < 2) {
      // Second jump (double jump)
      body.setVelocityY(PLAYER_CONSTANTS.JUMP_VELOCITY);
      state.jumpCount = 2;
      playJumpAnimation(state);
      createDustCloud(state);
    }
  }

  // Jump cut: on jump release while rising, cut velocity
  if (!jumpDown && state.wasJumpDown && body.velocity.y < 0) {
    body.setVelocityY(body.velocity.y * PLAYER_CONSTANTS.JUMP_CUT_MULTIPLIER);
  }

  state.wasJumpDown = jumpDown;
}

const ANIM_CONFIG = {
  MOVEMENT_THRESHOLD: 5,
} as const;

type AnimationState = {
  isGrounded: boolean;
  isMoving: boolean;
  direction: SidescrollerDirection;
  currentAnim: string | undefined;
};

function getAnimationState(state: PlayerState, body: Phaser.Physics.Arcade.Body): AnimationState {
  return {
    isGrounded: body.blocked.down,
    isMoving: Math.abs(body.velocity.x) > ANIM_CONFIG.MOVEMENT_THRESHOLD,
    direction: state.lastDirection,
    currentAnim: state.sprite.anims.currentAnim?.key
  };
}

function getNextAnimation(animState: AnimationState): Action {
  if (!animState.isGrounded) return Action.JUMP;
  if (animState.isMoving) return Action.WALK;
  return Action.IDLE;
}

function playAnimation(state: PlayerState, animKey: Action) {
  const animKeys = AnimKeys(PLAYER_PREFIX);
  const animation = animKeys[animKey][state.lastDirection];
  const anims = state.sprite.anims.animationManager;

  // Only play if animation exists and is different from current
  if (anims.exists(animation) && animation !== state.sprite.anims.currentAnim?.key) {
    state.sprite.play(animation, true);
  }
}

function updateAnimation(state: PlayerState, body: Phaser.Physics.Arcade.Body) {
  const animState = getAnimationState(state, body);
  const nextAnim = getNextAnimation(animState);
  playAnimation(state, nextAnim);
}

// Player update logic
export function updatePlayer(state: PlayerState) {
  const body = state.sprite.body as Phaser.Physics.Arcade.Body;

  // Handle input
  const keyboardInput = handleKeyboardInput(state);
  const gamepadInput = handleGamepadInput(state);

  const left = keyboardInput.left || (gamepadInput?.left ?? false);
  const right = keyboardInput.right || (gamepadInput?.right ?? false);
  const jumpDown = state.keyboardInput?.space.isDown || (gamepadInput?.jump ?? false);

  // Handle movement
  if (body.blocked.down) {
    handleGroundMovement(state, body, left, right);
  } else if (state.jumpXVelocity !== 0) {
    // While airborne, keep x velocity locked
    body.setVelocityX(state.jumpXVelocity);
  }

  // Handle jumping
  handleJump(state, body, jumpDown, left, right);

  // Update animations
  updateAnimation(state, body);
}

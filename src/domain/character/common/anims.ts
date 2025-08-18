import { Direction, frameIndex, getRow } from "./frames";

export type Action = 'idle' | 'walk' | 'jump';
export const Action = {
  IDLE: 'idle' as Action,
  WALK: 'walk' as Action,
  JUMP: 'jump' as Action,
} as const;

export const AnimKeys = Object.values(Action)
  .reduce((acc, action) => {
    acc[action] = Object.values(Direction)
      .reduce((dirAcc, direction) => {
        dirAcc[direction] = `${action}_${direction}`;
        return dirAcc;
      }, {} as Record<Direction, string>);
    return acc;
  }, {} as Record<Action, Record<Direction, string>>);

export const createActionFns = {
  [Action.IDLE]: createIdleAnim,
  [Action.WALK]: createWalkAnim,
  [Action.JUMP]: createJumpAnim,
} as const;

export const getTexture = (scene: Phaser.Scene, key: string) => scene.textures.get(key).getSourceImage();

export function createActionAnims(
  action: Action,
  directions: Direction[],
  anims: Phaser.Animations.AnimationManager,
  cols: number
) {
  if (!createActionFns[action]) {
    throw new TypeError(`Unknown action: ${action}`);
  }
  directions.forEach((direction) => { createActionFns[action](anims, direction, cols); });
}

// Idle breathing: only two frames, slow inhale/exhale
export function createIdleAnim(
  anims: Phaser.Animations.AnimationManager,
  direction: Direction,
  idleCols: number
) {
  const row = getRow(direction);
  anims.create({
    key: `idle_${direction}`,
    frames:
      anims.generateFrameNumbers('player_idle', {
        start: frameIndex(row, 0, idleCols),
        end: frameIndex(row, 1, idleCols)
      }),
    frameRate: 1,
    repeat: -1,
  });
}

export function createWalkAnim(
  anims: Phaser.Animations.AnimationManager,
  direction: Direction,
  walkCols: number
) {
  const row = getRow(direction);
  anims.create({
    key: `walk_${direction}`,
    frames: anims.generateFrameNumbers('player_walk', {
      start: frameIndex(row, 0, walkCols),
      end: frameIndex(row, walkCols - 1, walkCols)
    }),
    frameRate: 12,
    repeat: -1,
  });
}

export function createJumpAnim(
  anims: Phaser.Animations.AnimationManager,
  direction: Direction,
  jumpCols: number
) {
  const row = getRow(direction);
  anims.create({
    key: `jump_${direction}`,
    frames: anims.generateFrameNumbers('player_jump', {
      start: row * jumpCols,
      end: row * jumpCols + jumpCols - 1
    }),
    frameRate: 16,
    repeat: 0,
    showOnStart: true,
    hideOnComplete: false
  });
}

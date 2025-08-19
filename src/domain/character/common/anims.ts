import { Direction, frameIndex, getRow } from "./frames";

export type Action = 'idle' | 'walk' | 'jump';
export const Action = {
  IDLE: 'idle' as Action,
  WALK: 'walk' as Action,
  JUMP: 'jump' as Action,
} as const;

export function createAnimKey(action: Action, direction: Direction, prefix: string): string {
  return `${prefix}_${action}_${direction}`;
}

export function createSpriteKey(action: Action, prefix: string): string {
  return `${prefix}_${action}`;
}

export const AnimKeys = (prefix: string) =>
  Object.values(Action)
    .reduce((acc, action) => {
      acc[action] = Object.values(Direction)
        .reduce((dirAcc, direction) => {
          dirAcc[direction] = createAnimKey(action, direction, prefix);
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
  cols: number,
  prefix: string
) {
  if (!createActionFns[action]) {
    throw new TypeError(`Unknown action: ${action}`);
  }
  directions.forEach((direction) => { 
    createActionFns[action](anims, direction, cols, prefix); 
  });
}

// Idle breathing: only two frames, slow inhale/exhale
export function createIdleAnim(
  anims: Phaser.Animations.AnimationManager,
  direction: Direction,
  idleCols: number,
  prefix: string
) {
  const row = getRow(direction);
  anims.create({
    key: createAnimKey(Action.IDLE, direction, prefix),
    frames:
      anims.generateFrameNumbers(createSpriteKey(Action.IDLE, prefix), {
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
  walkCols: number,
  prefix: string
) {
  const row = getRow(direction);
  anims.create({
    key: createAnimKey(Action.WALK, direction, prefix),
    frames: anims.generateFrameNumbers(createSpriteKey(Action.WALK, prefix), {
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
  jumpCols: number,
  prefix: string
) {
  const row = getRow(direction);
  anims.create({
    key: createAnimKey(Action.JUMP, direction, prefix),
    frames: anims.generateFrameNumbers(createSpriteKey(Action.JUMP, prefix), {
      start: row * jumpCols,
      end: row * jumpCols + jumpCols - 1
    }),
    frameRate: 16,
    repeat: 0,
    showOnStart: true,
    hideOnComplete: false
  });
}

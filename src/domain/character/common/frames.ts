export type SidescrollerDirection = 'left' | 'right';

export type Direction = SidescrollerDirection | 'up' | 'down';

export const SidescrollerDirection = {
  LEFT: 'left' as SidescrollerDirection,
  RIGHT: 'right' as SidescrollerDirection,
} as const;

export const Direction = {
  LEFT: SidescrollerDirection.LEFT,
  RIGHT: SidescrollerDirection.RIGHT,
  UP: 'up' as Direction,
  DOWN: 'down' as Direction,
} as const;

export const DirectionOrdinal = {
  [Direction.LEFT]: 1,
  [Direction.RIGHT]: 3,
  [Direction.UP]: 0,
  [Direction.DOWN]: 2,
} as const;

export const frameIndex = (row: number, col: number, cols: number) => row * cols + col;

export const getRow = (direction: Direction) => {
  switch (direction) {
    case Direction.LEFT:
      return DirectionOrdinal[Direction.LEFT];
    case Direction.RIGHT:
      return DirectionOrdinal[Direction.RIGHT];
    case Direction.UP:
      return DirectionOrdinal[Direction.UP];
    case Direction.DOWN:
      return DirectionOrdinal[Direction.DOWN];
    default:
      throw new TypeError(`Unknown Direction passed to getRow: ${direction}`);
  }
}

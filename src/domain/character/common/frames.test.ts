/* import { Direction, frameIndex, getRow } from './frames';
import { SidescrollerDirection } from './frames';

describe('Frame Utilities', () => {
    it('should correctly calculate frame indices', () => {
        expect(frameIndex(0, 0, 4)).toBe(0);
        expect(frameIndex(1, 2, 4)).toBe(6);
        expect(frameIndex(2, 3, 4)).toBe(11);
    });

    it('should correctly get row for direction', () => {
        expect(getRow(Direction.LEFT)).toBe(0);
        expect(getRow(Direction.RIGHT)).toBe(1);
        expect(getRow(Direction.UP)).toBe(2);
        expect(getRow(Direction.DOWN)).toBe(3);
    });
    it('should throw error for unknown direction', () => {
        expect(() => getRow('unknown' as SidescrollerDirection)).toThrow(TypeError);
    });

}); */

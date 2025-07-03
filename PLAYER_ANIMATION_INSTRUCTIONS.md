# Player Animation Instructions

## Location
- All player animation sprite sheets are in:
  `public/sprites/characters/wolf/standard/`

## Format
- Each animation is a PNG sprite sheet.
- Each frame is 64x64 pixels.
- Each sheet typically has 4 rows (from top to bottom):
  1. Up
  2. Left
  3. Down
  4. Right
- The number of columns (frames) varies by animation length.
- File names are self-explanatory, e.g.:
  - `idle.png`, `walk.png`, `jump.png`, etc.

## Implementation
- To add a new animation:
  1. Place the new sprite sheet in the directory above, named for the animation (e.g. `jump.png`).
  2. In the Phaser preload function, load it as a spritesheet:
     ```ts
     scene.load.spritesheet('player_jump', '/sprites/characters/wolf/standard/jump.png', {
       frameWidth: 64,
       frameHeight: 64,
     });
     ```
  3. In the animation setup function, create the animation for each direction as needed. Example for left/right:
     ```ts
     if (scene.textures.exists('player_jump')) {
       const jumpTex = scene.textures.get('player_jump').getSourceImage();
       const jumpCols = Math.floor(jumpTex.width / 64);
       scene.anims.create({
         key: 'jump_right',
         frames: scene.anims.generateFrameNumbers('player_jump', { start: 3 * jumpCols, end: 3 * jumpCols + jumpCols - 1 }),
         frameRate: 8,
         repeat: -1,
       });
       scene.anims.create({
         key: 'jump_left',
         frames: scene.anims.generateFrameNumbers('player_jump', { start: 1 * jumpCols, end: 1 * jumpCols + jumpCols - 1 }),
         frameRate: 8,
         repeat: -1,
       });
     }
     ```
- Use the appropriate animation key in your update logic, e.g. `jump_left`, `jump_right`, etc.

---

**Note:**
- Not all animations use all 4 directions. Use the rows that make sense for your animation.
- Always check that the texture exists before creating or playing an animation to avoid errors.

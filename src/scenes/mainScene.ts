import Phaser from 'phaser';
import { createPlayer, setupPlayerAnimations, updatePlayer } from '../player';
import type { PlayerState } from '../player';

// Functional: create platforms
function createPlatforms(scene: Phaser.Scene) {
  const platforms = scene.physics.add.staticGroup();
  // Main starting platform
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();
  // Rightward path (lowered and closer)
  platforms.create(600, 540, 'ground');
  platforms.create(800, 510, 'ground');
  platforms.create(1000, 480, 'ground');
  platforms.create(1300, 450, 'ground');
  // Lower ground (for falling)
  platforms.create(800, 590, 'ground').setScale(4, 0.5).refreshBody();
  return platforms;
}

// Create a glowing wisp texture at runtime
function createWispTexture(scene: Phaser.Scene) {
  if (scene.textures.exists('wisp')) return;
  const gfx = scene.add.graphics();
  gfx.fillStyle(0x66ccff, 0.85);
  gfx.fillCircle(16, 16, 14);
  gfx.lineStyle(2, 0xffffff, 0.7);
  gfx.strokeCircle(16, 16, 14);
  gfx.generateTexture('wisp', 32, 32);
  gfx.destroy();
}

// Add a placeholder energy wisp collectible
function createCollectibles(scene: Phaser.Scene, group: Phaser.Physics.Arcade.StaticGroup) {
  createWispTexture(scene);
  // Place wisps well above each platform as a collectible path
  const wispPositions = [
    { x: 600, y: 540 - 64 },   // 64px above platform at y=540
    { x: 800, y: 510 - 64 },   // 64px above platform at y=510
    { x: 1000, y: 480 - 64 },  // 64px above platform at y=480
    { x: 1300, y: 450 - 64 },  // 64px above platform at y=450
  ];
  wispPositions.forEach(pos => {
    const wisp = group.create(pos.x, pos.y, 'wisp');
    wisp.setDisplaySize(16, 16);
  });
}

// Add a placeholder side-facing door goal
function createGoalDoor(scene: Phaser.Scene) {
  // Place door at far right edge, fully above ground
  const doorWidth = 18;
  const doorHeight = 48;
  const platformY = 450;
  const platformHeight = 32;
  const worldRight = 1600;
  const doorX = worldRight - doorWidth / 2 - 8; // 8px inset from edge for aesthetics
  const doorY = platformY - doorHeight / 2 - (platformHeight / 2);
  const door = scene.add.rectangle(doorX, doorY, doorWidth, doorHeight, 0x8b5a2b).setStrokeStyle(3, 0x222222);
  scene.add.rectangle(doorX - 8, doorY, 4, 8, 0x222222); // handle
  scene.physics.add.existing(door, true);

  // Add a wall above the door to the ceiling
  const wallX = worldRight - 24; // flush with right edge
  const wallTop = 0;
  const wallBottom = platformY - platformHeight / 2 - doorHeight;
  const wallHeight = wallBottom - wallTop;
  if (wallHeight > 0) {
    const wall = scene.add.rectangle(wallX, wallTop + wallHeight / 2, 16, wallHeight, 0x234123).setStrokeStyle(2, 0x222222);
    scene.physics.add.existing(wall, true);
  }
  return door;
}

// Functional: handle asset loading
export function preloadAssets(scene: Phaser.Scene) {
  scene.load.spritesheet('player_idle', '/sprites/characters/wolf/standard/idle.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet('player_walk', '/sprites/characters/wolf/standard/walk.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
  scene.load.on('loaderror', (file: { key: string; src: string }) => {
    console.warn('Failed to load asset:', file.key, file.src);
  });
}

// Functional: create main scene logic
function createMainScene(scene: Phaser.Scene, state: { player?: PlayerState }) {
  scene.cameras.main.setBackgroundColor('#181818');
  scene.physics.world.setBounds(0, 0, 1600, 600);
  scene.cameras.main.setBounds(0, 0, 1600, 600);
  const platforms = createPlatforms(scene);

  // Collectibles group
  const collectibles = scene.physics.add.staticGroup();
  createCollectibles(scene, collectibles);

  // Goal door
  createGoalDoor(scene);

  if (!scene.textures.exists('player_idle')) {
    scene.add.text(100, 100, 'ERROR: idle.png not loaded', { color: '#f00' });
    return;
  }
  if (!scene.textures.exists('player_walk')) {
    scene.add.text(100, 120, 'ERROR: walk.png not loaded', { color: '#f00' });
    return;
  }

  setupPlayerAnimations(scene);
  state.player = createPlayer(scene, 100, 450);
  state.player.sprite.setCollideWorldBounds(true);
  scene.physics.add.collider(state.player.sprite, platforms);
  scene.cameras.main.startFollow(state.player.sprite);
  state.player.sprite.play('idle_right');

  // Collectible overlap
  scene.physics.add.overlap(state.player.sprite, collectibles, (_, wisp) => {
    wisp.destroy();
    // TODO: Add score, effect, etc.
  });
}

// Functional: update main scene
function updateMainScene(state: { player?: PlayerState }) {
  if (state.player) {
    updatePlayer(state.player);
  }
}

export class MainScene extends Phaser.Scene {
  state: { player?: PlayerState } = {};

  constructor() {
    super('MainScene');
  }

  preload() {
    preloadAssets(this);
  }

  create() {
    createMainScene(this, this.state);
  }

  update() {
    updateMainScene(this.state);
  }
}

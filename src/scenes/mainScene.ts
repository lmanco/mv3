import Phaser from 'phaser';
import {
  createPlayer,
  FRAME_SIZE,
  PlayerAnims,
  setupPlayerAnimations,
  updatePlayer
} from '../domain/character/player';
import type { PlayerState } from '../domain/character/player';

// Only a single flat ground platform
function createPlatforms(scene: Phaser.Scene) {
  const platforms = scene.physics.add.staticGroup();
  // Flat ground across the bottom
  platforms.create(800, 590, 'ground').setScale(25, 0.5).refreshBody();
  // Single block platform in the middle, high enough to go under or over
  platforms.create(800, 400, 'ground').setScale(0.5, 0.5).refreshBody();
  return platforms;
}

const paths = {
  [PlayerAnims.idle]: '/sprites/characters/wolf/standard/idle.png',
  [PlayerAnims.walk]: '/sprites/characters/wolf/standard/walk.png',
  [PlayerAnims.jump]: '/sprites/characters/wolf/standard/jump.png',
};

function loadPlayerSprites(scene: Phaser.Scene) {
  Object.entries(paths).forEach(([anim, path]) => {
    scene.load.spritesheet(anim, path, {
      frameWidth: FRAME_SIZE,
      frameHeight: FRAME_SIZE,
    });
  });
  // Dust cloud frames
  Array.from(new Array(4)).map((_, i) => {
    scene.load.image(`dust${i + 1}`, `sprites/fx/dust/FX052_0${i + 1}.png`);
  });
}

export function preloadAssets(scene: Phaser.Scene) {
  loadPlayerSprites(scene);
  scene.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
  scene.load.on('loaderror', (file: { key: string; src: string }) => {
    console.warn('Failed to load asset:', file.key, file.src);
  });
}

function createMainScene(scene: Phaser.Scene, state: { player?: PlayerState }) {
  scene.cameras.main.setBackgroundColor('#181818');
  scene.physics.world.setBounds(0, 0, 1600, 600);
  scene.cameras.main.setBounds(0, 0, 1600, 600);
  const platforms = createPlatforms(scene);

  if (!scene.textures.exists('player_idle')) {
    scene.add.text(100, 100, 'ERROR: idle.png not loaded', { color: '#f00' });
    return;
  }
  if (!scene.textures.exists('player_walk')) {
    scene.add.text(100, 120, 'ERROR: walk.png not loaded', { color: '#f00' });
    return;
  }

  // Setup dust cloud animation (after preload)
  scene.anims.create({
    key: 'dust_cloud',
    frames: [
      { key: 'dust1' },
      { key: 'dust2' },
      { key: 'dust3' },
      { key: 'dust4' }
    ],
    frameRate: 16,
    repeat: 0,
    hideOnComplete: true
  });

  setupPlayerAnimations(scene);
  state.player = createPlayer(scene, 100, 450);
  state.player.sprite.setCollideWorldBounds(true);
  scene.physics.add.collider(state.player.sprite, platforms);
  // Camera follow with zoom and offset
  scene.cameras.main.setZoom(1.2); // Slightly zoomed in for more room
  scene.cameras.main.setDeadzone(120, 200); // Deadzone is about one third of viewport width
  scene.cameras.main.setFollowOffset(0, 0); // No offset, player is centered until leaving deadzone
  scene.cameras.main.startFollow(state.player.sprite);
}

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

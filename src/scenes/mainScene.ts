import Phaser from 'phaser';
import { createPlayer, setupPlayerAnimations, updatePlayer } from '../player';
import type { PlayerState } from '../player';

// Only a single flat ground platform
function createPlatforms(scene: Phaser.Scene) {
  const platforms = scene.physics.add.staticGroup();
  // Flat ground across the bottom
  platforms.create(800, 590, 'ground').setScale(25, 0.5).refreshBody();
  // Single block platform in the middle, high enough to go under or over
  platforms.create(800, 400, 'ground').setScale(0.5, 0.5).refreshBody();
  return platforms;
}

// No collectibles, no door, no wall

export function preloadAssets(scene: Phaser.Scene) {
  scene.load.spritesheet('player_idle', '/sprites/characters/wolf/standard/idle.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet('player_walk', '/sprites/characters/wolf/standard/walk.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet('player_jump', '/sprites/characters/wolf/standard/jump.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
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

  setupPlayerAnimations(scene);
  state.player = createPlayer(scene, 100, 450);
  state.player.sprite.setCollideWorldBounds(true);
  scene.physics.add.collider(state.player.sprite, platforms);
  scene.cameras.main.startFollow(state.player.sprite);
  state.player.sprite.play('idle_right');
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

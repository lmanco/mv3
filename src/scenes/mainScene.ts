import Phaser from 'phaser';
import { createPlayer, setupPlayerAnimations, updatePlayer } from '../player';
import type { PlayerState } from '../player';

// Functional: create platforms
function createPlatforms(scene: Phaser.Scene) {
  const platforms = scene.physics.add.staticGroup();
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');
  return platforms;
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
  scene.physics.add.collider(state.player.sprite, platforms);
  scene.cameras.main.startFollow(state.player.sprite);
  state.player.sprite.play('idle_right');
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

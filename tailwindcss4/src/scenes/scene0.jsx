import Phaser from 'phaser';

export default class MyScene extends Phaser.Scene {
  constructor() {
    super('MyScene');
    this.robotMoving = false;
    this.robotSpeed = 150;
    this.chestOpened = false;
    this.sceneReadyCallback = null;
  }

  preload() {
    this.load.image('background', '/forest_bg.jpg');

    // ✅ Load robot as a spritesheet instead of atlas
    this.load.spritesheet('robot', '/robot2.png', {
      frameWidth: 160,   // adjust if each robot frame has different size
      frameHeight: 228
    });

    // ✅ Load chest spritesheet
    // this.load.spritesheet('treasure', '/treasure_chest.png', {
    //   frameWidth: 128,
    //   frameHeight: 128
    // });
  }

  create() {
    const { width, height } = this.game.config;
    const GROUND_Y = 400;

    this.physics.world.setBounds(0, 0, width, height);

    this.add.image(0, 0, 'background')
      .setOrigin(0, 0)
      .setDisplaySize(width, height);

    // ✅ Create robot sprite
    this.robot = this.physics.add.sprite(100, GROUND_Y, 'robot')
      .setScale(0.5)
      .setOrigin(0.5, 1);

    // ✅ Robot walking animation
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('robot', { start: 0, end: 5 }), // frames 0–5
      frameRate: 10,
      repeat: -1
    });

    this.robot.play('walk');

    // ✅ Treasure chest sprite
    // this.treasureChest = this.physics.add.staticSprite(width / 2, GROUND_Y, 'treasure')
    //   .setScale(0.7)
    //   .setOrigin(0.5, 1);

    // // ✅ Chest opening animation
    // this.anims.create({
    //   key: 'openChest',
    //   frames: this.anims.generateFrameNumbers('treasure', { start: 0, end: 4 }),
    //   frameRate: 10,
    //   repeat: 0
    // });

    this.physics.add.overlap(this.robot, this.treasureChest, this.onReachChest, null, this);

    // Notify React that scene is ready
    this.events.emit('scene-ready', this);
  }

  update() {
    if (this.robotMoving) {
      this.robot.setVelocityX(this.robotSpeed);
      if (!this.robot.anims.isPlaying) {
        this.robot.play('walk');
      }
    } else {
      this.robot.setVelocityX(0);
      this.robot.anims.stop();
    }
  }

  onReachChest() {
    if (!this.chestOpened) {
      this.chestOpened = true;
      this.robotMoving = false;

      this.treasureChest.play('openChest');

      const gif = document.getElementById('treasure-gif');
      if (gif) gif.style.display = 'block';
    }
  }

  moveRobotToChest() {
    this.robotMoving = true;
    this.robot.anims.play('walk', true);
  }
}

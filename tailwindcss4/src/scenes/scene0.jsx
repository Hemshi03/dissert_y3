// MyScene.js
import Phaser from 'phaser';

export default class MyScene extends Phaser.Scene {
  constructor() {
    super('MyScene');
    this.robotMoving = false;
    this.robotSpeed = 150;
    this.stopX = null;
  }

  preload() {
    // Background
    this.load.image('background', '/forest_bg.jpg');

    // Robot spritesheet
    this.load.spritesheet('robot', '/robot2.png', {
      frameWidth: 230,
      frameHeight: 225,
    });
  }

  create() {
    const width = this.game.config.width;
    const height = this.game.config.height;
    const GROUND_Y = height;

    this.physics.world.setBounds(0, 0, width, height);

    // Background
    this.add.image(0, 0, 'background')
      .setOrigin(0, 0)
      .setDisplaySize(width, height);

    // Robot sprite
    this.robot = this.physics.add.sprite(100, GROUND_Y, 'robot')
      .setScale(0.5)
      .setOrigin(0.5, 1);

    // Walk animation
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('robot', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1,
    });

    // Idle animation
    this.anims.create({
      key: 'idle',
      frames: [{ key: 'robot', frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    this.robot.play('idle');

    // Tell React scene is ready
    this.game.events.emit('scene-ready', this);
  }

  update() {
    if (!this.robot || !this.robotMoving) return;

    // Play walk animation if not already
    if (this.robot.anims.currentAnim?.key !== 'walk') {
      this.robot.play('walk', true);
    }

    // Smooth movement toward stopX
    const distance = this.stopX - this.robot.x;
    if (distance <= 0) {
      this.robotMoving = false;
      this.robot.setVelocityX(0);
      this.robot.play('idle');
      this.robot.x = this.stopX; // clamp
    } else {
      // Slow down when near
      this.robot.setVelocityX(Math.min(this.robotSpeed, distance * 5));
    }
  }

  moveRobotToChest() {
    // Fixed chest X (matches React DOM)
    const chestX = 680;

    const robotWidth = this.robot.displayWidth;
    this.stopX = chestX - robotWidth - 10; // 10px padding

    this.robotMoving = true;
    this.robot.play('walk', true);
    this.robot.setVelocityX(this.robotSpeed);
  }
}



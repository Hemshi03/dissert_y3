import Phaser from 'phaser';

export default class MyScene extends Phaser.Scene {
  constructor() {
    super('MyScene');
    this.robotMoving = false;
    this.robotSpeed = 150;
  }

  preload() {
    this.load.image('background', '/forest_bg.jpg');
    this.load.spritesheet('robot', '/robot.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create() {
    const { width, height } = this.game.config;
    const GROUND_Y = 350;

    this.physics.world.setBounds(0, 0, width, height);

    // Background
    this.add.image(0, 0, 'background')
      .setOrigin(0, 0)
      .setDisplaySize(width, height);

    // Robot sprite
    this.robot = this.physics.add.sprite(100, GROUND_Y, 'robot').setScale(2).setOrigin(0.5, 1);

    // Animations
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('robot', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'idle',
      frames: [{ key: 'robot', frame: 0 }],
      frameRate: 10,
    });

    this.robot.play('idle');

    // Chest position (we won't use Phaser sprite for chest)
    this.chestX = width / 2;

    // Notify React that scene is ready
    this.events.emit('scene-ready', this);
  }

  update() {
    if (this.robotMoving) {
      this.robot.setVelocityX(this.robotSpeed);
      this.robot.play('walk', true);

      // Check collision with chest (HTML element)
      if (this.robot.x >= this.chestX) {
        this.robot.setVelocityX(0);
        this.robot.play('idle');
        this.robotMoving = false;

        // Trigger chest opening in React
        window.dispatchEvent(new Event('openChest'));
      }
    }
  }

  moveRobotToChest() {
    this.robotMoving = true;
  }
}

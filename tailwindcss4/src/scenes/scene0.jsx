// Scene0.jsx
import Phaser from 'phaser';

export default class Scene0 extends Phaser.Scene {
  constructor() {
    super('Scene0');

    this.robotMoving = false;
    this.robotSpeed = 150;
    this.stopX = null;
    this.currentLevel = 1;
    this.updateListenerAdded = false;

    this.bgImages = {
      1: { key: 'bg1', path: '/forest_bg.jpg' },
      2: { key: 'bg2', path: '/forest2.png' },
      3: { key: 'bg3', path: '/forest4.png' },
    };

    this.levelSpeeches = {
      1: "Hello, I am RoboVar! Let's start coding!",
      2: "Great! The chest is unlocked!",
      3: "Correct! The chest is unlocked.",
    };
  }

  preload() {
    Object.values(this.bgImages).forEach(bg => this.load.image(bg.key, bg.path));
    this.load.spritesheet('robot', '/robot2.png', {
      frameWidth: 230,
      frameHeight: 225,
    });
  }

  create() {
    const width = this.game.config.width;
    const height = this.game.config.height;

    this.physics.world.setBounds(0, 0, width, height);
    this.createBackground();

    // Robot sprite
    this.robot = this.physics.add.sprite(100, height, 'robot')
      .setScale(0.9)
      .setOrigin(0.5, 1);

    this.createAnimations();
    this.robot.play('idle');

    // Level indicator
    this.levelText = this.add.text(width - 100, 30, `Level ${this.currentLevel}`, {
      font: '24px Arial',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5);

    // Scene ready event
    this.game.events.emit('scene-ready', this);
  }

  createBackground() {
    const width = this.game.config.width;
    const height = this.game.config.height;
    const bgConfig = this.bgImages[this.currentLevel];

    if (this.textures.exists(bgConfig.key)) {
      this.bg = this.add.image(width / 2, height / 2, bgConfig.key)
        .setOrigin(0.5, 0.5)
        .setDisplaySize(width, height);
    } else {
      this.bg = this.add.rectangle(width / 2, height / 2, width, height, 0x444444);
    }
  }

  createAnimations() {
    if (!this.anims.exists('walk')) {
      this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('robot', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!this.anims.exists('idle')) {
      this.anims.create({
        key: 'idle',
        frames: [{ key: 'robot', frame: 0 }],
        frameRate: 1,
        repeat: -1,
      });
    }
  }

  update() {
    if (!this.robot || !this.robotMoving) return;

    if (this.robot.anims.currentAnim?.key !== 'walk') {
      this.robot.play('walk', true);
    }

    const distance = this.stopX - this.robot.x;
    if (distance <= 0) {
      this.robotMoving = false;
      this.robot.setVelocityX(0);
      this.robot.play('idle');
      this.robot.x = this.stopX;
    } else {
      this.robot.setVelocityX(Math.min(this.robotSpeed, distance * 5));
    }
  }

  moveRobotToChest() {
    const chestX = 680;
    const robotWidth = this.robot.displayWidth;
    this.stopX = chestX - robotWidth - 10;
    this.robotMoving = true;
    this.robot.play('walk', true);
    this.robot.setVelocityX(this.robotSpeed);
  }

  setLevel(level) {
    if (!this.bgImages[level]) return;
    this.currentLevel = level;

    if (this.levelText) this.levelText.setText(`Level ${level}`);

    if (this.bg) this.bg.destroy();
    const bgConfig = this.bgImages[level];
    const width = this.game.config.width;
    const height = this.game.config.height;

    if (this.textures.exists(bgConfig.key)) {
      this.bg = this.add.image(width / 2, height / 2, bgConfig.key)
        .setOrigin(0.5, 0.5)
        .setDisplaySize(width, height);
    } else {
      this.bg = this.add.rectangle(width / 2, height / 2, width, height, 0x444444);
    }
    this.children.sendToBack(this.bg);
  }

  showSpeech(level) {
    if (!this.levelSpeeches[level]) return;

    // Destroy previous bubble if exists
    if (this.robotSpeechContainer) {
      this.robotSpeechContainer.destroy();
      this.robotSpeechContainer = null;
    }

    // Remove old typing event
    if (this.typingEvent) {
      this.typingEvent.remove(false);
      this.typingEvent = null;
    }

    // Create speech container
    this.robotSpeechContainer = this.add.container(
      this.robot.x + 100,
      this.robot.y - this.robot.displayHeight / 1.5
    );

    this.robotSpeechBubble = this.add.graphics();
    this.drawSpeechBubble(this.robotSpeechBubble, 0, 0, 180, 60);
    this.robotSpeechContainer.add(this.robotSpeechBubble);

    this.robotSpeechText = this.add.text(0, 0, '', {
      font: 'bold 18px Comic Sans MS',
      fill: '#000000',
      align: 'center',
      wordWrap: { width: 160 },
      lineSpacing: 4
    }).setOrigin(0.5);

    this.robotSpeechContainer.add(this.robotSpeechText);
    this.robotSpeechContainer.setVisible(true);

    // Type out speech
    this.typeText(this.levelSpeeches[level]);

    // Keep bubble following robot (added only once)
    if (!this.updateListenerAdded) {
      this.events.on('update', () => {
        if (this.robotSpeechContainer) {
          this.robotSpeechContainer.setPosition(
            this.robot.x + 100,
            this.robot.y - this.robot.displayHeight / 1.5
          );
        }
      });
      this.updateListenerAdded = true;
    }

    // TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(this.levelSpeeches[level]);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }

  typeText(text, speed = 40) {
    if (this.typingEvent) this.typingEvent.remove(false);
    this.robotSpeechText.setText('');
    let index = 0;

    this.typingEvent = this.time.addEvent({
      delay: speed,
      callback: () => {
        this.robotSpeechText.setText(this.robotSpeechText.text + text[index]);
        index++;
        if (index === text.length) this.typingEvent.remove(false);
      },
      loop: true
    });
  }

  drawSpeechBubble(graphics, x, y, width, height) {
    graphics.clear();
    graphics.fillStyle(0xffffff, 0.9);
    const radius = Math.min(width, height) / 2;
    graphics.strokeRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
  }
}


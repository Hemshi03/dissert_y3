import React, { useEffect, useState } from 'react';
import Phaser from 'phaser';
import MyScene from './scenes/scene0';

export default function GameComponent({ codeValid }) {
  const [sceneInstance, setSceneInstance] = useState(null);

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 400,
      parent: 'phaser-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
        },
      },
      scene: [MyScene],
    });

    // Listen for scene ready
    game.events.on('scene-ready', (scene) => {
      setSceneInstance(scene);
    });

    return () => game.destroy(true);
  }, []);

  useEffect(() => {
    if (codeValid && sceneInstance) {
      // Show GIF
      const gif = document.getElementById('treasure-gif');
      if (gif) gif.style.display = 'block';

      // Move the robot
      sceneInstance.moveRobotToChest();
    }
  }, [codeValid, sceneInstance]);

  return (
    <div className="relative" style={{ width: '800px', height: '400px' }}>
      <div id="phaser-container" style={{ width: '800px', height: '400px' }} />

      {/* Treasure chest GIF */}
      <img
        id="treasure-gif"
        src="../treasure_chest.gif" // Make sure this GIF is in your public folder
        alt="Treasure Chest"
        className="absolute w-[110px] h-[110px] bottom-10 left-1/2 -translate-x-1/2 z-10"
        style={{ display: 'none' }}
      />
    </div>
  );
}









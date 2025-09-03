import React, { useEffect, useState } from 'react';
import Phaser from 'phaser';
import MyScene from './scenes/scene0';

export default function GameComponent({ codeValid }) {
  const [sceneInstance, setSceneInstance] = useState(null);

  // Initialize Phaser scene
  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 400,
      parent: 'phaser-container',
      physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
      scene: [MyScene],
    });

    game.events.on('scene-ready', (scene) => setSceneInstance(scene));

    return () => game.destroy(true);
  }, []);

  // Handle chest GIF / static PNG swap
  useEffect(() => {
    const chest = document.getElementById('treasure-gif');
    if (!chest) return;

    if (codeValid) {
      // Show GIF
      chest.style.display = 'block';
      chest.src = `/treasure_chest.gif?t=${Date.now()}`;

      // Move robot independently
      if (sceneInstance?.moveRobotToChest) sceneInstance.moveRobotToChest();

      // Swap to static "open chest" after GIF finishes
      const timer = setTimeout(() => {
        chest.src = '/static_chest.png';
      }, 2000); // adjust duration to match your GIF

      return () => clearTimeout(timer);
    } else {
      // Hide chest if code is invalid
      chest.style.display = 'none';
    }
  }, [codeValid, sceneInstance]);

  return (
    <div className="relative" style={{ width: '800px', height: '400px' }}>
      {/* Phaser Canvas */}
      <div id="phaser-container" style={{ width: '800px', height: '400px' }} />

      {/* Treasure chest GIF / PNG */}
      <img
        id="treasure-gif"
        src="/treasure_chest.gif"
        alt="Treasure Chest"
        style={{
          display: 'none',
          width: '110px',
          height: '110px',
          bottom: '2px',
          left: '570px',
          position: 'absolute',
          zIndex: 10,
          objectFit: 'contain'
        }}
      />
    </div>
  );
}

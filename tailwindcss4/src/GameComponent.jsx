import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import MyScene from './scenes/scene0';

export default function GameComponent({ level, setSceneInstance }) {
  const [scene, setLocalScene] = useState(null);
  const gameRef = useRef(null);

  // Initialize Phaser only once
  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 500,
        parent: 'phaser-container',
        physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
        scene: [MyScene],
      });

      // Listen for scene ready event
      gameRef.current.events.on('scene-ready', (sceneInstance) => {
        setLocalScene(sceneInstance);
        if (setSceneInstance) setSceneInstance(sceneInstance);
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [setSceneInstance]);

  // Update scene level when `level` prop changes
  useEffect(() => {
    if (!scene || !scene.setLevel) return;
    scene.setLevel(level);
  }, [level, scene]);

  // Treasure chest, gold particles & glow logic
  useEffect(() => {
    const chest = document.getElementById('treasure-gif');
    const particlesContainer = document.getElementById('gold-particles');
    if (!chest || !particlesContainer) return;

    chest.style.display = 'none';
    chest.style.filter = ''; // remove glow initially
    chest.style.transition = 'filter 0.5s ease-in-out';

    const showGoldParticles = () => {
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.backgroundColor = 'gold';
        particle.style.borderRadius = '50%';
        particle.style.left = '22px';
        particle.style.top = '0px';
        particle.style.opacity = 1;
        particle.style.transform = `translate(0,0) scale(1)`;
        particle.style.transition = 'transform 1s ease-out, opacity 1s ease-out';

        particlesContainer.appendChild(particle);

        const angle = Math.random() * 2 * Math.PI;
        const radius = 20 + Math.random() * 30;
        const x = Math.cos(angle) * radius;
        const y = -Math.sin(angle) * radius - 20;

        setTimeout(() => {
          particle.style.transform = `translate(${x}px, ${y}px) scale(0.5)`;
          particle.style.opacity = 0;
        }, 50);

        setTimeout(() => {
          particlesContainer.removeChild(particle);
        }, 1100);
      }
    };

    const showChest = () => {
      if (level !== 2) return; // only for level 2
      chest.style.display = 'block';
      chest.src = `/treasure_chest.gif?t=${Date.now()}`;

      // Glow effect
      chest.style.filter = 'drop-shadow(0 0 15px gold) drop-shadow(0 0 10px orange)';
      setTimeout(() => {
        chest.style.filter = '';
        chest.src = '/static_chest.png';
      }, 2000);

      // Show gold particles
      showGoldParticles();
    };

    // Attach to scene so Chapter1 can call it
    if (scene) scene.showChest = showChest;

    // Level 3 chest is permanently unlocked
    if (level === 3) {
      chest.style.display = 'block';
      chest.src = '/static_chest.png';
    }
  }, [scene, level]);

  return (
    <div
      id="phaser-container-wrapper"
      style={{ width: '800px', height: '400px', position: 'relative' }}
    >
      <div id="phaser-container" style={{ width: '800px', height: '400px' }} />
      <img
        id="treasure-gif"
        src="/treasure_chest.gif"
        alt="Treasure Chest"
        style={{
          display: 'none',
          width: '110px',
          height: '90px',
          left: '570px',
          position: 'absolute',
          zIndex: 10,
          objectFit: 'contain',
        }}
      />
      {/* Gold particles container */}
      <div
        id="gold-particles"
        style={{
          position: 'absolute',
          left: '570px',
          top: '350px',
          width: '50px',
          height: '50px',
          pointerEvents: 'none',
          overflow: 'visible',
          zIndex: 20,
        }}
      />
    </div>
  );
}

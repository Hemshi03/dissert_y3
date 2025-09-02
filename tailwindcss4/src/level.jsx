import React, { useState } from 'react';
import GameComponent from './GameComponent';

export default function Level() {
  const [codeValid, setCodeValid] = useState(false);

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Level 1: Variables</h2>

      {/* Test Button */}
      <button
        className="bg-green-500 text-white px-4 py-2 mb-4"
        onClick={() => setCodeValid(true)}
      >
        Test Robot Move
      </button>

      {/* Phaser game */}
      <GameComponent codeValid={codeValid} />
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import GameComponent from '../GameComponent';
import Editor from '@monaco-editor/react';

export default function Chapter1() {
  const [typedIndex, setTypedIndex] = useState(0);
  const [storyCompleted, setStoryCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [editorValue, setEditorValue] = useState('');
  const [codeValid, setCodeValid] = useState(false);
  const [xp, setXp] = useState(0);
  const [xpPopup, setXpPopup] = useState(null);
  const [storyMessage, setStoryMessage] = useState('');

  const intervalRef = useRef(null);

  const storyElements = [
    { text: "The Forest of Beginnings stretches before you, where magical treasure chests hold the essence of ", className: "" },
    { text: "variables", className: "text-yellow-400 font-bold" },
    { text: ".", className: "" },
    { text: "\nA friendly robot named ", className: "" },
    { text: "RoboVar", className: "text-blue-400 font-bold" },
    { text: " rolls forward.", className: "" },
    { text: "\nRoboVar says: \"Welcome, young coder! These chests are locked by the magic of ", className: "" },
    { text: "variables", className: "text-yellow-400 font-bold" },
    { text: ".\"", className: "" },
    { text: "\n\"Variables are containers where we store information—", className: "" },
    { text: "numbers", className: "text-green-400 font-bold" },
    { text: ", ", className: "" },
    { text: "words", className: "text-pink-400 font-bold" },
    { text: ", or other data.\"", className: "" },
    { text: "\n\"To unlock a chest, declare a variable to store your ", className: "" },
    { text: "mana points", className: "text-red-400 font-bold" },
    { text: ".\"", className: "" },
    { text: "\nType your declaration in the editor. The correct code will open the chest and grant you XP and magical items.", className: "" },
  ];

  // Typing effect
  useEffect(() => {
    if (!storyCompleted) {
      intervalRef.current = setInterval(() => {
        setTypedIndex(prev => {
          if (prev + 1 > storyElements.reduce((sum, e) => sum + e.text.length, 0)) {
            clearInterval(intervalRef.current);
            setStoryCompleted(true);
            return prev;
          }
          return prev + 1;
        });
      }, 30);

      return () => clearInterval(intervalRef.current);
    }
  }, [storyCompleted]);

  const skipStory = () => {
    clearInterval(intervalRef.current);
    setTypedIndex(storyElements.reduce((sum, e) => sum + e.text.length, 0));
    setStoryCompleted(true);
    setGameStarted(true);
  };

  const handleRunCode = () => {
    const trimmed = editorValue.trim();
    const regex = /^dim\s+mana\s+as\s+integer\s*=\s*50\s*$/i;

    //---
    if (regex.test(trimmed)) {
      setCodeValid(true);
      setStoryMessage('✨ Correct! The chest opens. ✨');
      setXp(prev => prev + 50);
      setXpPopup('+50 XP');
      setTimeout(() => setXpPopup(null), 1200);
    } else {
      alert('❌ Try again. Hint: Dim mana As Integer = 50');
    }
  };
  

  let currentLength = 0;
  const renderedStory = storyElements.map((el, idx) => {
    const end = currentLength + el.text.length;
    const visibleText = typedIndex >= end ? el.text : typedIndex > currentLength ? el.text.slice(0, typedIndex - currentLength) : '';
    currentLength = end;
    return (
      <span key={idx} className={el.className}>
        {visibleText}
      </span>
    );
  });

  return (
    <div className="bg-[#0A0F28] text-white min-h-screen flex flex-col justify-center items-center p-4">
      {!gameStarted && (
        <div className="w-full max-w-3xl mb-4 p-4 bg-[#1C1F3C] rounded min-h-[150px]">
          <pre className="whitespace-pre-wrap">{renderedStory}</pre>
          <button
            onClick={skipStory}
            className="mt-4 px-4 py-2 bg-purple-500 rounded hover:bg-purple-600 transition"
          >
            {storyCompleted ? 'Start Game' : 'Skip Story'}
          </button>
        </div>
      )}

      {gameStarted && (
        <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-4 h-[500px] mt-4">
          {/* Game Scene */}
          <div className="w-full lg:w-3/5 h-64 lg:h-full relative bg-[#1C1F3C] rounded-lg flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-3 left-3 bg-black/60 px-3 py-1 rounded-lg text-yellow-300 font-bold text-sm shadow">
              ⭐ XP: {xp}
            </div>

            <GameComponent codeValid={codeValid} />

            {xpPopup && <div className="absolute bottom-28 left-1/2 -translate-x-1/2 text-green-400 font-bold text-lg animate-float">{xpPopup}</div>}
            {storyMessage && <div className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-300 font-bold text-center drop-shadow-lg z-15">{storyMessage}</div>}
          </div>

          {/* Editor Panel */}
          <div className="w-full lg:w-2/5 h-64 lg:h-full bg-gray-800 p-3 rounded-2xl shadow-lg border border-gray-700 flex flex-col">
            <Editor
              height="55%"
              defaultLanguage="vb"
              value={editorValue}
              theme="vs-dark"
              options={{
                fontSize: 15,
                fontFamily: 'Fira Code, monospace',
                fontLigatures: true,
                minimap: { enabled: false },
                smoothScrolling: true,
                roundedSelection: true,
                padding: { top: 8 },
              }}
              onChange={(value) => setEditorValue(value)}
            />

            <button
              onClick={handleRunCode}
              disabled={!editorValue.trim() || codeValid}
              className={`px-4 py-2 rounded mt-2 transition ${editorValue.trim() && !codeValid ? 'bg-blue-500 hover:bg-blue-400' : 'bg-gray-500 cursor-not-allowed'}`}
            >
              Run Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


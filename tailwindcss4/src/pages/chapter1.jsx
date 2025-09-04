// Chapter1.jsx
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
  const [chapterComplete, setChapterComplete] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('vb');

  const intervalRef = useRef(null);
  const maxXp = 100;

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
    { text: ".\"", className: "" },
    { text: "\n\"To unlock a chest, declare a variable to store your mana points.", className: "" },
    { text: "\nType your declaration in the editor. The correct code will open the chest and grant you XP and magical items.", className: "" },
  ];

  // Variable declaration hints (story/example)
  const variableHints = {
    vb: 'Example: Dim RoboVar As String',
    python: 'Example: RoboVar = "Hello"',
    java: 'Example: String RoboVar;'
  };

  // Code validation regex (keeps original challenge)
  const codeValidationRegex = {
    vb: /^dim\s+mana\s+as\s+integer\s*=\s*50$/i,
    python: /^mana\s*=\s*50$/i,
    java: /^int\s+mana\s*=\s*50;$/i
  };

  useEffect(() => {
    if (!storyCompleted) {
      intervalRef.current = setInterval(() => {
        setTypedIndex(prev => {
          const totalLength = storyElements.reduce((sum, e) => sum + e.text.length, 0);
          if (prev + 1 > totalLength) {
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
    if (codeValidationRegex[selectedLanguage].test(trimmed)) {
      setCodeValid(true);
      setStoryMessage('✨ Correct! The chest opens. ✨');
      setXp(prev => {
        const newXp = Math.min(prev + 50, maxXp);
        if (newXp >= maxXp) setChapterComplete(true);
        return newXp;
      });
      setXpPopup('+50 XP');
      setTimeout(() => setXpPopup(null), 1200);
    } else {
      alert('❌ Try again! Hint: Use a variable like RoboVar');
    }
  };

  const handleNext = () => {
    console.log('Next button clicked!');
    // Example: navigate to next chapter
  };

  let currentLength = 0;
  const renderedStory = storyElements.map((el, idx) => {
    const end = currentLength + el.text.length;
    const visibleText = typedIndex >= end ? el.text : typedIndex > currentLength ? el.text.slice(0, typedIndex - currentLength) : '';
    currentLength = end;
    return <span key={idx} className={el.className}>{visibleText}</span>;
  });

  return (
    <div className="bg-[#0A0F28] text-white min-h-screen flex flex-col items-center">
      <header className="w-full bg-[#1C1F3C] px-6 py-3 flex items-center justify-between shadow-md">
        <h1 className="text-lg font-bold text-purple-300">📘 Chapter 1: Variables</h1>
        <div className="flex items-center gap-6">
          <div className="w-40">
            <p className="text-xs text-yellow-300 font-bold">XP: {xp}/{maxXp}</p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((xp / maxXp) * 100, 100)}%` }}
              />
            </div>
          </div>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition"
          >
            Next
          </button>
        </div>
      </header>

      {!gameStarted && (
        <div className="w-full max-w-3xl mt-6 mb-4 p-4 bg-[#1C1F3C] rounded min-h-[150px]">
          <pre className="whitespace-pre-wrap">{renderedStory}</pre>

          {storyCompleted && (
            <div className="mt-4">
              <label className="mr-2">Select Language:</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-black p-1 rounded"
              >
                <option value="vb">Visual Basic</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
              <p className="mt-2 text-gray-300 text-sm">{variableHints[selectedLanguage]}</p>
            </div>
          )}

          <button
            onClick={skipStory}
            className="mt-4 px-4 py-2 bg-purple-500 rounded hover:bg-purple-600 transition"
          >
            {storyCompleted ? 'Start Game' : 'Skip Story'}
          </button>
        </div>
      )}

      {gameStarted && (
        <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-4 h-[600px] lg:h-[500px] mt-6">
          <div className="w-full lg:w-3/5 relative bg-[#1C1F3C] rounded-lg flex flex-col items-center justify-center overflow-hidden">
            <GameComponent codeValid={codeValid} />

            {xpPopup && (
              <div className="absolute bottom-28 left-1/2 -translate-x-1/2 text-green-400 font-bold text-lg animate-float">
                {xpPopup}
              </div>
            )}
            {storyMessage && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-300 font-bold text-center drop-shadow-lg z-15">
                {storyMessage}
              </div>
            )}

            {chapterComplete && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                <div className="bg-[#1C1F3C] p-6 rounded-2xl text-center shadow-lg">
                  <h2 className="text-2xl font-bold text-yellow-300">🎉 Chapter Complete!</h2>
                  <p className="mt-2 text-gray-200">You’ve mastered variables and earned {xp} XP.</p>
                  <button
                    onClick={handleNext}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-2/5 flex flex-col">
            <div className="bg-[#1C1F3C] border-l-4 border-yellow-400 p-3 rounded-lg shadow-md mb-3">
              <h2 className="font-bold text-yellow-300 flex items-center gap-2">💡 Key Concept</h2>
              <p className="text-gray-200 mt-1 text-sm">
                Think of variables like labeled boxes where you can store different types of information.
              </p>
              <ul className="mt-2 text-gray-300 text-sm space-y-1">
                <li><span className="font-bold text-pink-400">String:</span> Text like "Hello World"</li>
                <li><span className="font-bold text-green-400">Number:</span> Numbers like 42 or 3.14</li>
                <li><span className="font-bold text-blue-400">Boolean:</span> True or False values</li>
              </ul>
            </div>

            <div className="flex-1 bg-gray-800 p-3 rounded-2xl shadow-lg border border-gray-700 flex flex-col">
              <div className="flex-1 rounded-xl overflow-hidden shadow-inner mb-2 min-h-[250px]">
                <Editor
                  height="100%"
                  defaultLanguage={selectedLanguage}
                  value={editorValue}
                  theme="vs-dark"
                  options={{
                    fontSize: 16,
                    fontFamily: 'Fira Code, monospace',
                    fontLigatures: true,
                    minimap: { enabled: false },
                    smoothScrolling: true,
                    roundedSelection: true,
                    padding: { top: 10, bottom: 10 },
                    scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                  }}
                  onChange={(value) => setEditorValue(value)}
                />
              </div>

              <button
                onClick={handleRunCode}
                disabled={!editorValue.trim() || codeValid}
                className={`mt-auto px-4 py-2 rounded transition ${
                  editorValue.trim() && !codeValid
                    ? 'bg-blue-500 hover:bg-blue-400'
                    : 'bg-purple-500 cursor-not-allowed'
                }`}
              >
                Run Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}









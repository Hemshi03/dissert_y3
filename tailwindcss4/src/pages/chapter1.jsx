import { useState, useEffect } from "react";
import { ArrowRight, Star } from "lucide-react";
import interact from "interactjs";
import GameComponent from "../GameComponent";
import { useNavigate } from "react-router-dom";

export default function Chapter1() {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [droppedBlocks, setDroppedBlocks] = useState([]);
  const [shuffledBlocks, setShuffledBlocks] = useState([]);
  const [sceneInstance, setSceneInstance] = useState(null);
  const [gameMessage, setGameMessage] = useState("");
  const totalLevels = 3;

  const navigate = useNavigate();

  const languageBlocks = {
    1: { vb: ["Dim", "RoboVar", "As", "String"], java: ["String", "roboVar", ";"], python: ['robo_var', '=', '""'] },
    2: { vb: ["Dim", "treasureCode", "As", "Integer"], java: ["int", "treasureCode", ";"], python: ["treasureCode", "=", "0"] },
    3: { vb: ["Dim", "Unlocked", "As", "Boolean"], java: ["boolean", "Unlocked", "=", "true", ";"], python: ["Unlocked", "=", "True"] },
  };

  // Normalize expected code for Java Level 2 (ignore spaces)
  const expectedCode = {
    1: { vb: "Dim RoboVar As String", java: "String roboVar ;", python: 'robo_var = ""' },
    2: { vb: "Dim treasureCode As Integer", java: "int treasureCode ;", python: "treasureCode = 0" },
    3: { vb: "Dim Unlocked As Boolean", java: "boolean Unlocked = true ;", python: "Unlocked = True" },
  };

  const levelQuestions = {
    1: "Name your robot using the blocks below.",
    2: "Next, unlock the chest with a code.",
    3: "Check whether the chest is locked.",
  };

  const progressPercent = Math.round((level / totalLevels) * 100);

  const shuffleArray = (arr) => {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleStartGame = () => {
    if (!selectedLanguage) {
      setGameMessage("⚠️ Please select a language first!");
      return;
    }
    setShowIntro(false);
    setLevel(1);
    setXp(0);
    setDroppedBlocks(Array(languageBlocks[1][selectedLanguage].length).fill(""));
    setShuffledBlocks(shuffleArray(languageBlocks[1][selectedLanguage]));
  };

  const handleNextLevel = () => {
    if (level < totalLevels) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setDroppedBlocks(Array(languageBlocks[nextLevel][selectedLanguage].length).fill(""));
      setShuffledBlocks(shuffleArray(languageBlocks[nextLevel][selectedLanguage]));

      if (sceneInstance) {
        if (sceneInstance.setLevel) sceneInstance.setLevel(nextLevel);
        if (sceneInstance.robotSpeechContainer) {
          sceneInstance.robotSpeechContainer.destroy();
        }
      }

      setXp((prev) => prev + 50);
    }
  };

  const handleRunCode = () => {
    const allFilled = droppedBlocks.every((b) => b);
    if (!allFilled) {
      setGameMessage("⚠️ Please fill all blocks in the workspace before running!");
      return;
    }

    // Join blocks and normalize spaces for comparison
    const userCode = droppedBlocks.join(" ").trim().replace(/\s+/g, " ");
    const expected = expectedCode[level][selectedLanguage].trim().replace(/\s+/g, " ");

    if (sceneInstance && typeof sceneInstance.showSpeech === "function") {
      setTimeout(() => {
        sceneInstance.showSpeech(level);
      }, 50);
    }

    if (userCode === expected) {
      setXp((prev) => prev + 50);

      // Level 2: show treasure/chest
      if (level === 2 && sceneInstance) {
        if (typeof sceneInstance.moveRobotToChest === "function") {
          sceneInstance.moveRobotToChest();
        }
        if (typeof sceneInstance.showChest === "function") {
          sceneInstance.showChest();
        }
      }

      // Level 3: show chest as unlocked
      if (level === 3 && sceneInstance && typeof sceneInstance.showChest === "function") {
        sceneInstance.showChest(true);
      }
    } else {
      setGameMessage("❌ Oops! Check the order of your blocks.");
    }
  };

  const handleResetWorkspace = () => {
    setDroppedBlocks(Array(languageBlocks[level][selectedLanguage].length).fill(""));
  };

  useEffect(() => {
    if (level <= totalLevels) {
      interact(".draggable-block").draggable({
        inertia: true,
        autoScroll: true,
        listeners: {
          move(event) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute("data-x", x);
            target.setAttribute("data-y", y);
          },
        },
      });

      interact("#workspace").dropzone({
        accept: ".draggable-block",
        overlap: 0.75,
        ondrop(event) {
          const value = event.relatedTarget.dataset.value;
          setDroppedBlocks((prev) => {
            const newBlocks = [...prev];
            const emptyIndex = newBlocks.findIndex((b) => !b);
            if (emptyIndex === -1) return newBlocks;
            newBlocks[emptyIndex] = value;
            return newBlocks;
          });
        },
      });

      return () => {
        interact(".draggable-block").unset();
        interact("#workspace").unset();
      };
    }
  }, [level, selectedLanguage]);

  return (
    <div className="bg-[#0A0F28] text-white min-h-screen flex flex-col">
      {/* Intro / Language Selection */}
      {showIntro ? (
        <div className="relative flex flex-col items-center justify-center text-center h-screen px-4">
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 text-center px-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-300 mb-4 animate-bounce drop-shadow-lg">
              🌌 Welcome to Looplands!
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Guide your robot through magical forests and unlock coding powers!
            </p>
            <h2 className="text-lg text-blue-300 mb-4 font-semibold">
              Choose your coding spell:
            </h2>
            <div className="flex justify-center gap-4 mb-10 flex-wrap">
              {["vb", "java", "python"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-6 py-3 rounded-lg font-bold shadow-lg transition transform hover:scale-110 ${
                    selectedLanguage === lang
                      ? "bg-green-500"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {lang === "vb" ? "Visual Basic" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={handleStartGame}
              className="px-10 py-4 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-xl font-bold shadow-lg animate-pulse"
            >
              🚀 Start Adventure
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Header & XP */}
          <div className="bg-[#130c301f] shadow-lg px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-12 rounded-xl">
            <div className="flex-1 w-full">
              <h1 className="text-xl font-bold text-blue-300">Learning Variables</h1>
              <p className="text-sm text-gray-400">Level {level} of {totalLevels}</p>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mt-2">
                <div
                  className="h-3 bg-green-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-green-400 font-bold mt-1 block md:text-left text-center">
                {progressPercent}%
              </span>
            </div>
            <div className="flex items-center gap-2 text-center md:text-right mt-2 md:mt-0">
              <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
              <p className="text-lg md:text-xl font-bold text-yellow-400">{xp} XP</p>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-row gap-6 p-6">
            <GameComponent
              level={level}
              language={selectedLanguage}
              codeValid={droppedBlocks.join(" ").trim().replace(/\s+/g, " ") === expectedCode[level]?.[selectedLanguage].trim().replace(/\s+/g, " ")}
              setSceneInstance={setSceneInstance}
            />

            {/* Sidebar */}
            <div className="flex flex-col gap-4 w-[350px]">
              <div className="text-blue-300 font-semibold mb-2">{levelQuestions[level]}</div>

              <div className="bg-[#1C1F3C] rounded-xl p-4 shadow-lg">
                <h4 className="font-semibold text-blue-300 mb-2">🧩 Blocks</h4>
                <div className="flex flex-wrap gap-2">
                  {shuffledBlocks.map((block, idx) => (
                    <span
                      key={idx}
                      className="draggable-block px-3 py-1 bg-blue-700 rounded cursor-pointer"
                      data-value={block}
                    >
                      {block}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#1C1F3C] rounded-xl p-4 shadow-lg">
                <h4 className="font-semibold text-blue-300 mb-2">📝 Workspace</h4>
                <div id="workspace" className="flex gap-2 border border-dashed border-gray-500 h-32 p-2 rounded-lg">
                  {droppedBlocks.map((block, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 border border-gray-700 rounded flex items-center justify-center text-gray-500 ${!block ? "bg-[#0F1228]" : "bg-[#1A1D33]"}`}
                    >
                      {block || "Drop"}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleResetWorkspace}
                  className="mt-2 px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
                >
                  Reset Workspace
                </button>
              </div>

              <div className="mt-1 bg-[#0F1228] p-1 rounded font-mono text-green-300 text-[14px] overflow-x-auto h-10">
                {droppedBlocks.filter((b) => b).join(" ")}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRunCode}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded font-semibold"
                >
                  Run Code
                </button>
                <button className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded font-semibold">
                  Hint
                </button>
              </div>

              {/* Next Level / MCQ */}
              <div className="flex justify-center mt-4">
                {level < totalLevels ? (
                  <button
                    onClick={handleNextLevel}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 font-semibold shadow-lg"
                  >
                    <ArrowRight size={24} />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/McqPage1", { state: { xp, selectedLanguage } })}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
                  >
                    Go to MCQ
                  </button>
                )}
              </div>
            </div>
          </div>

          {gameMessage && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-[#1C1F3C] p-6 rounded-xl shadow-xl text-center max-w-sm">
                <p className="text-white text-lg mb-4">{gameMessage}</p>
                <button
                  onClick={() => setGameMessage("")}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded font-semibold"
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}


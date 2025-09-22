import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import interact from "interactjs";
import { ArrowRight, Star } from "lucide-react";
import { db, auth } from "../firebase.config";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  runTransaction,
  arrayUnion,
} from "firebase/firestore";
import GameComponent from "../GameComponent";
import hintsData from "../data/hints.json";

export default function Chapter1() {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [chapterData, setChapterData] = useState(null);
  const [levels, setLevels] = useState({});
  const [levelKeys, setLevelKeys] = useState([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [mana, setMana] = useState(100);
  const [droppedBlocks, setDroppedBlocks] = useState([]);
  const [shuffledBlocks, setShuffledBlocks] = useState([]);
  const [sceneInstance, setSceneInstance] = useState(null);
  const [gameMessage, setGameMessage] = useState("");
  const [portalActivated, setPortalActivated] = useState(false);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [currentHint, setCurrentHint] = useState("");

  const navigate = useNavigate();

  const getLanguageKey = (lang) => {
    if (lang === "vb") return "Visual Basic";
    if (lang === "java") return "Java";
    if (lang === "python") return "Python";
    return "";
  };

  const shuffleArray = (arr) => {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // 🔹 Fetch chapter and user progress
  useEffect(() => {
    const fetchChapterAndUserProgress = async () => {
      try {
        const chapterRef = doc(db, "chapters", "ch1");
        const chapterSnap = await getDoc(chapterRef);

        const levelsRef = collection(db, "chapters", "ch1", "levels");
        const levelsSnap = await getDocs(levelsRef);

        const levelsData = {};
        levelsSnap.forEach((docSnap) => {
          levelsData[docSnap.id] = docSnap.data();
        });

        if (chapterSnap.exists()) {
          setChapterData(chapterSnap.data());
          setLevels(levelsData);
          setLevelKeys(Object.keys(levelsData).sort());
        }

        const uid = auth.currentUser.uid;
        const userRef = doc(db, "user_progress", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setCompletedLevels(userData.completedLevels || []);
          setXp(userData.totalxp || 0);
          setMana(userData.mana ?? 100);
        }
      } catch (err) {
        console.error("Error fetching chapter or user progress:", err);
      }
    };

    fetchChapterAndUserProgress();
  }, []);

  // 🔹 Mark level as completed
  const markLevelCompleted = async (levelId, xpReward, manaReward = 0) => {
    try {
      const uid = auth.currentUser.uid;
      const userRef = doc(db, "user_progress", uid);

      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw "User does not exist!";

        const prevCompleted = userDoc.data().completedLevels || [];
        const prevXp = userDoc.data().totalxp || 0;
        const prevMana = userDoc.data().mana ?? 100;

        if (!prevCompleted.includes(levelId)) {
          transaction.update(userRef, {
            completedLevels: arrayUnion(levelId),
            totalxp: prevXp + xpReward,
            mana: prevMana + manaReward,
          });
        }
      });

      setCompletedLevels((prev) =>
        prev.includes(levelId) ? prev : [...prev, levelId]
      );
      setXp((prev) => prev + xpReward);
      setMana((prev) => prev + manaReward);
    } catch (err) {
      console.error("Error updating completedLevels:", err);
    }
  };

  const handleStartGame = () => {
    if (!selectedLanguage) {
      setGameMessage("⚠️ Please select a language first!");
      return;
    }
    if (!chapterData || levelKeys.length === 0) {
      setGameMessage("⚠️ Chapter data not loaded yet!");
      return;
    }

    setShowIntro(false);
    setCurrentLevelIndex(0);
    setDroppedBlocks([]);
    setPortalActivated(false);
    loadLevel(0);
  };

  const loadLevel = (index) => {
    const levelId = levelKeys[index];
    const levelData = levels[levelId];
    if (!levelData) return;

    const langKey = getLanguageKey(selectedLanguage);
    const blocks = levelData.languageBlocks?.[langKey] || [];

    setDroppedBlocks(Array(blocks.length).fill(""));
    setShuffledBlocks(shuffleArray(blocks));
    setPortalActivated(false);

    // Reset hints
    setCurrentHintIndex(0);
    setCurrentHint("");

    // 🔧 Update scene level without resetting (preserves chest)
    if (sceneInstance) {
      if (sceneInstance.setLevel) sceneInstance.setLevel(index + 1);
      if (sceneInstance.robotSpeechContainer) {
        sceneInstance.robotSpeechContainer.destroy();
      }
    }
  };

  const handleRunCode = () => {
    const levelId = levelKeys[currentLevelIndex];
    const levelData = levels[levelId];
    if (!levelData) return;

    const allFilled = droppedBlocks.every((b) => b);
    if (!allFilled) {
      setGameMessage("⚠️ Fill all slots before running!");
      return;
    }

    const langKey = getLanguageKey(selectedLanguage);
    const expected = levelData.answer?.[langKey];
    if (!expected) {
      setGameMessage("❌ No expected answer found!");
      return;
    }

    const cleanExpected = expected
      .replace(/\\n/g, "")
      .replace(/\n/g, "")
      .trim()
      .replace(/\s+/g, " ");
    const userCode = droppedBlocks.join(" ").trim().replace(/\s+/g, " ");

    if (userCode === cleanExpected) {
      const xpReward = levelData.xpReward || 0;
      const manaReward = levelData.manaReward || 0;
      if (!completedLevels.includes(levelId))
        markLevelCompleted(levelId, xpReward, manaReward);

      // 🔧 ENHANCED: Robot speech animation
      if (sceneInstance && typeof sceneInstance.showSpeech === "function") {
        setTimeout(() => sceneInstance.showSpeech(currentLevelIndex + 1), 50);
      }

      const currentLevel = currentLevelIndex + 1;

      // 🔧 ENHANCED: Level-specific animations from hardcoded version
      if (currentLevel === 2 && sceneInstance) {
        // Level 2: Move robot to chest and show chest
        if (sceneInstance.moveRobotToChest) sceneInstance.moveRobotToChest();
        if (sceneInstance.showChest) sceneInstance.showChest();
      }

      if (currentLevel === 3 && sceneInstance && sceneInstance.showChest) {
        // Level 3: Show chest as unlocked
        sceneInstance.showChest(true);
      }

      // 🔧 ENHANCED: Portal activation for level 4
      if (currentLevel === 4 && sceneInstance && typeof sceneInstance.showPortal === "function") {
        sceneInstance.showPortal();
        setPortalActivated(true);
        setGameMessage("✅ Portal activated! Click the MCQ Quiz button to proceed.");
        return;
      }

      if (currentLevelIndex >= levelKeys.length - 1) {
        setPortalActivated(true);
        setGameMessage("✅ All levels completed! Click MCQ Quiz.");
      } else {
        setGameMessage("✅ Correct! Click Next Level to continue.");
      }
    } else {
      setGameMessage("❌ Oops! Check the order of your blocks.");
    }
  };

  const handleResetWorkspace = () => {
    setDroppedBlocks(Array(droppedBlocks.length).fill(""));
  };

  const handleNextLevel = () => {
    if (currentLevelIndex < levelKeys.length - 1) {
      const newIndex = currentLevelIndex + 1;
      setCurrentLevelIndex(newIndex);
      loadLevel(newIndex);
    } else {
      if (portalActivated)
        navigate("/McqPage1", { state: { xp, mana, selectedLanguage } });
    }
  };

  // 🔹 Get hints for current level
  const getCurrentLevelHints = () => {
    const chapterId = "ch1";
    const levelId = levelKeys[currentLevelIndex];
    const lang = selectedLanguage;
    return hintsData[chapterId]?.[levelId]?.[getLanguageKey(lang)] || [];
  };

  const handleShowHint = async () => {
    if (!selectedLanguage) return;

    const levelHints = getCurrentLevelHints();

    if (!levelHints.length || currentHintIndex >= levelHints.length) {
      setCurrentHint("No more hints available for this level!");
      return;
    }

    setCurrentHint(levelHints[currentHintIndex]);
    setCurrentHintIndex(currentHintIndex + 1);

    // Update Firestore for dashboard
    try {
      const uid = auth.currentUser.uid;
      const userRef = doc(db, "user_progress", uid);

      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw "User not found";

        const prevHints = userDoc.data().hintsUsed || 0;
        const prevMana = userDoc.data().mana ?? 100;

        transaction.update(userRef, {
          hintsUsed: prevHints + 1,
          mana: Math.max(prevMana - 5, 0),
        });
      });

      setMana((prev) => Math.max(prev - 5, 0));
    } catch (err) {
      console.error("Error updating hintsUsed:", err);
    }
  };

  // 🔹 Enhanced drag & drop with removal capability
  useEffect(() => {
    if (!showIntro && selectedLanguage && shuffledBlocks.length > 0) {
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
          end(event) {
            event.target.style.transform = '';
            event.target.setAttribute("data-x", 0);
            event.target.setAttribute("data-y", 0);
          }
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
  }, [levelKeys, currentLevelIndex, selectedLanguage, showIntro, shuffledBlocks]);

  if (!chapterData || levelKeys.length === 0) {
    return (
      <div className="bg-[#0A0F28] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading chapter data...</p>
        </div>
      </div>
    );
  }

  const levelId = levelKeys[currentLevelIndex];
  const levelData = levels[levelId];
  const questionText = levelData?.questionText || "Loading question...";
  const description = chapterData?.description || "Learning Variables";
  const totalLevels = levelKeys.length;
  const progressPercent = Math.round(
    ((currentLevelIndex + 1) / totalLevels) * 100
  );

  return (
    <div className="bg-[#0A0F28] text-white min-h-screen flex flex-col">
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
            <h2 className="text-lg text-blue-300 mb-4 font-semibold">Choose your coding spell:</h2>
            <div className="flex justify-center gap-4 mb-10 flex-wrap">
              {["vb", "java", "python"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-6 py-3 rounded-lg font-bold shadow-lg transition transform hover:scale-110 ${selectedLanguage === lang ? "bg-green-500" : "bg-blue-600 hover:bg-blue-700"
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
          {/* Header & XP & Mana */}
          <div className="bg-[#130c301f] shadow-lg px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-12 rounded-xl">
            <div className="flex-1 w-full">
              <h1 className="text-xl font-bold text-blue-300">{description}</h1>
              <p className="text-sm text-gray-400">Level {currentLevelIndex + 1} of {totalLevels}</p>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mt-2">
                <div className="h-3 bg-green-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-xs text-green-400 font-bold mt-1 block md:text-left text-center">
                {progressPercent}%
              </span>
            </div>
            <div className="flex items-center gap-4 text-center md:text-right mt-2 md:mt-0">
              <div className="flex items-center gap-1">
                <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
                <p className="text-lg md:text-xl font-bold text-yellow-400">{xp} XP</p>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-lg md:text-xl font-bold text-blue-400">💧 {mana} Mana</p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-row gap-6 p-6">
            <GameComponent
              level={currentLevelIndex + 1}
              language={selectedLanguage}
              codeValid={droppedBlocks.join(" ").trim().replace(/\s+/g, " ") === levelData?.answer?.[getLanguageKey(selectedLanguage)]?.replace(/\\n/g, "").replace(/\n/g, "").trim().replace(/\s+/g, " ")}
              setSceneInstance={setSceneInstance}
            />

            {/* Sidebar */}
            <div className="flex flex-col gap-4 w-[350px]">
              <div className="text-blue-300 font-semibold mb-2">{questionText}</div>

              {/* Workspace */}
              <div className="bg-[#1C1F3C] rounded-xl p-4 shadow-lg mb-4">
                <h4 className="font-semibold text-blue-300 mb-2">📝 Workspace</h4>
                <div id="workspace" className="flex gap-2 justify-center">
                  {droppedBlocks.map((block, idx) => (
                    <div
                      key={idx}
                      className={`w-20 h-12 border-2 border-gray-700 rounded flex items-center justify-center text-gray-400 font-semibold ${block ? "bg-green-600 text-white" : "bg-[#0F1228]"}`}
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

              {/* Blocks Tray */}
              <div className="blocks-tray bg-[#0F1228] rounded-xl p-4 shadow-lg flex overflow-x-auto gap-2">
                {shuffledBlocks.map((block, idx) => (
                  <div
                    key={idx}
                    className="draggable-block w-20 h-12 bg-blue-600 rounded flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-blue-500"
                    data-value={block}
                  >
                    {block}
                  </div>
                ))}
              </div>

              {/* Code preview */}
              <div className="mt-1 bg-[#0F1228] p-1 rounded font-mono text-green-300 text-[14px] overflow-x-auto h-10">
                {droppedBlocks.filter((b) => b).join(" ")}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleRunCode}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-white font-bold"
                >
                  Run Code
                </button>
                <button
                  onClick={handleShowHint}
                  className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded text-white font-bold"
                >
                  Hint
                </button>
                {/* 🔧 ENHANCED: Show different buttons based on level and portal status */}
                {currentLevelIndex < totalLevels - 1 ? (
                  <button
                    onClick={handleNextLevel}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white font-bold"
                  >
                    Next Level
                  </button>
                ) : (
                  <button
                    onClick={() => portalActivated && navigate("/McqPage1", { state: { xp, mana, selectedLanguage } })}
                    className={`flex-1 px-4 py-2 rounded text-white font-bold ${portalActivated ? "bg-green-500 hover:bg-green-600" : "bg-gray-600 cursor-not-allowed"}`}
                  >
                    MCQ Quiz
                  </button>
                )}
              </div>

              {/* Display current hint */}
              {currentHint && (
                <div className="mt-2 p-2 bg-gray-800 rounded text-yellow-300 text-sm">
                  💡 {currentHint}
                </div>
              )}

              {/* Game message */}
              {gameMessage && (
                <div className="mt-2 p-2 bg-gray-900 rounded text-white text-sm">
                  {gameMessage}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import interact from "interactjs";
import { Star } from "lucide-react";
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
  const [levelCompletionStates, setLevelCompletionStates] = useState({});
  const [isProcessingCompletion, setIsProcessingCompletion] = useState(false);

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

  // Fetch chapter and user progress
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
          const sortedLevelKeys = Object.keys(levelsData).sort();
          setLevelKeys(sortedLevelKeys);

          const uid = auth.currentUser.uid;
          const userRef = doc(db, "user_progress", uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            const userCompletedLevels = userData.completedLevels || [];

            setCompletedLevels(userCompletedLevels);
            setXp(userData.totalxp || 0);
            setMana(userData.mana ?? 100);

            const completionStates = {};
            userCompletedLevels.forEach(levelId => {
              completionStates[levelId] = true;
            });
            setLevelCompletionStates(completionStates);

            const ch1CompletedLevels = userCompletedLevels.filter(id => id.startsWith('L'));
            const nextLevelIndex = Math.min(ch1CompletedLevels.length, sortedLevelKeys.length - 1);

            console.log(`🎯 User has completed ${ch1CompletedLevels.length} levels. Resuming at level ${nextLevelIndex + 1}`);
            setCurrentLevelIndex(nextLevelIndex);
          }
        }
      } catch (err) {
        console.error("Error fetching chapter or user progress:", err);
      }
    };

    fetchChapterAndUserProgress();
  }, []);

  const markLevelCompleted = async (levelId, xpReward, manaReward = 0) => {
    if (isProcessingCompletion || levelCompletionStates[levelId]) return false;

    setIsProcessingCompletion(true);

    try {
      const uid = auth.currentUser.uid;
      const userRef = doc(db, "user_progress", uid);

      const result = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");

        const userData = userDoc.data();
        const prevCompleted = userData.completedLevels || [];
        const prevXp = userData.totalxp || 0;
        const prevMana = userData.mana ?? 100;

        if (prevCompleted.includes(levelId)) return { shouldUpdate: false };

        transaction.update(userRef, {
          completedLevels: arrayUnion(levelId),
          totalxp: prevXp + xpReward,
          mana: prevMana + manaReward,
          lastUpdated: new Date().toISOString()
        });

        return { shouldUpdate: true, newXp: prevXp + xpReward, newMana: prevMana + manaReward };
      });

      if (result.shouldUpdate) {
        setLevelCompletionStates(prev => ({ ...prev, [levelId]: true }));
        setCompletedLevels(prev => [...prev, levelId]);
        setXp(result.newXp);
        setMana(result.newMana);
        return true;
      }

      return false;
    } catch (err) {
      console.error("Error marking level completed:", err);
      setGameMessage("❌ Error saving progress. Please try again.");
      return false;
    } finally {
      setIsProcessingCompletion(false);
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
    setDroppedBlocks([]);
    setPortalActivated(false);
    setGameMessage("");
    loadLevel(currentLevelIndex);
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
    setGameMessage("");
    setCurrentHintIndex(0);
    setCurrentHint("");

    if (sceneInstance) {
      if (sceneInstance.setLevel) sceneInstance.setLevel(index + 1);
      if (sceneInstance.robotSpeechContainer) sceneInstance.robotSpeechContainer.destroy();
    }
  };

  const handleRunCode = async () => {
    const levelId = levelKeys[currentLevelIndex];
    const levelData = levels[levelId];
    if (!levelData) return;

    if (!droppedBlocks.every((b) => b)) {
      setGameMessage("⚠️ Fill all slots before running!");
      return;
    }

    const langKey = getLanguageKey(selectedLanguage);
    const expected = levelData.answer?.[langKey];
    if (!expected) {
      setGameMessage("❌ No expected answer found!");
      return;
    }

    const cleanExpected = expected.replace(/\\n/g, "").replace(/\n/g, "").trim().replace(/\s+/g, " ");
    const userCode = droppedBlocks.join(" ").trim().replace(/\s+/g, " ");

    if (userCode === cleanExpected) {
      const xpReward = levelData.xpReward || 0;
      const manaReward = levelData.manaReward || 0;

      const wasCompleted = await markLevelCompleted(levelId, xpReward, manaReward);

      if (wasCompleted) {
        setGameMessage(`✅ Correct! +${xpReward} XP${manaReward > 0 ? ` +${manaReward} Mana` : ''}! Click Next Level to continue.`);
      } else {
        setGameMessage("✅ Correct! (Already completed) Click Next Level to continue.");
      }

      if (sceneInstance?.showSpeech) setTimeout(() => sceneInstance.showSpeech(currentLevelIndex + 1), 50);

      if (currentLevelIndex + 1 === 2 && sceneInstance?.moveRobotToChest) sceneInstance.moveRobotToChest();
      if (currentLevelIndex + 1 === 2 && sceneInstance?.showChest) sceneInstance.showChest();
      if (currentLevelIndex + 1 === 3 && sceneInstance?.showChest) sceneInstance.showChest(true);

      if (currentLevelIndex === levelKeys.length - 1 && sceneInstance?.showPortal) {
        sceneInstance.showPortal();
        setPortalActivated(true);
        setGameMessage("✅ Portal activated! Click the MCQ Quiz button to proceed.");
      }

    } else {
      setGameMessage("❌ Oops! Check the order of your blocks.");
    }
  };

  const handleResetWorkspace = () => setDroppedBlocks(Array(droppedBlocks.length).fill(""));
  const handleNextLevel = () => {
    if (currentLevelIndex < levelKeys.length - 1) {
      const newIndex = currentLevelIndex + 1;
      setCurrentLevelIndex(newIndex);
      loadLevel(newIndex);
    } else {
      portalActivated ? navigate("/McqPage1") : setGameMessage("⚠️ Complete the last level correctly to activate the portal!");
    }
  };

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

    try {
      const uid = auth.currentUser.uid;
      const userRef = doc(db, "user_progress", uid);

      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User not found");

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
    <div className="text-white min-h-screen flex flex-col">
      {showIntro ? (
        <div className="relative flex flex-col items-center justify-center text-center min-h-screen px-4">
          <img
            src="/intro_bg.png"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover -z-20"
            style={{ filter: "blur(2px)" }}
          />
          {/* Robot image on the left side */}
          <div className="absolute left-10 bottom-10 z-10">
            <img
              src="/wave_robot.png"  // Your robot image path
              alt="Robot"
              className="w-55 h-55 gentle-bounce"
            />
            <div className="bg-blue-600 px-4 py-2 rounded-lg mt-2 animate-pulse">
              <p className="text-sm font-bold">Hello! Let's code!</p>
            </div>
          </div>

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
        <div className="bg-[#0A0F28] flex-1">
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
              <div id="workspace" className="bg-[#1c1f3c] p-3 rounded-lg min-h-[100px] mb-4 flex flex-wrap gap-2">
                {droppedBlocks.map((block, i) => (
                  <div key={i} className="bg-gray-600 px-3 py-2 rounded-md min-w-[90px] text-center">{block}</div>
                ))}
              </div>

              {/* Shuffled blocks */}
              <div className="flex flex-wrap gap-2">
                {shuffledBlocks.map((block, i) => (
                  <div key={i} className="draggable-block cursor-grab bg-blue-600 px-3 py-2 rounded-md min-w-[60px]" data-value={block}>
                    {block}
                  </div>
                ))}
              </div>

              {/* Code Preview */}
              <div className="bg-[#0f122d] p-3 rounded-lg min-h-[30px] mt-1 font-mono text-sm text-green-300 overflow-auto">
                <pre>{droppedBlocks.join(" ")}</pre>
              </div>

              {/* Controls */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleRunCode}
                  disabled={isProcessingCompletion}
                  className="bg-green-500 px-4 py-2 rounded-md font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingCompletion ? "Saving..." : "Run Code"}
                </button>
                <button onClick={handleResetWorkspace} className="bg-yellow-500 px-4 py-2 rounded-md font-bold hover:bg-yellow-600">Reset</button>
                <button onClick={handleNextLevel} className="bg-blue-500 px-4 py-2 rounded-md font-bold hover:bg-blue-600">Next</button>
              </div>

              {/* Hint */}
              <div className="mt-2">
                <button onClick={handleShowHint} className="bg-purple-500 px-4 py-2 rounded-md font-bold hover:bg-purple-600 mb-1">Show Hint (-5 Mana)</button>
                {currentHint && <p className="text-gray-300 text-sm mt-1">{currentHint}</p>}
              </div>

              {/* Game message */}
              {gameMessage && <div className="text-yellow-300 mt-2 font-semibold">{gameMessage}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

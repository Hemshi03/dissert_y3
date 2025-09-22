import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase.config";
import { collection, getDocs, doc, runTransaction, arrayUnion } from "firebase/firestore";

export default function MCQPage1() {
  const navigate = useNavigate();

  const [mcqs, setMcqs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);

  const uid = auth.currentUser.uid;

  useEffect(() => {
    const fetchMCQs = async () => {
      try {
        const mcqCollectionRef = collection(db, "chapters", "ch1", "mcqs");
        const mcqSnap = await getDocs(mcqCollectionRef);

        if (mcqSnap.empty) {
          console.log("No MCQs found in the collection!");
          setLoading(false);
          return;
        }

        const mcqsArray = mcqSnap.docs.map((docSnap) => {
          const mcq = docSnap.data();
          if (!mcq.options || mcq.options.length === 0) return null;

          const optionsMap = mcq.options[0]; // [{A,B,C,D}]
          const optionsArray = Object.keys(optionsMap).map((k) => ({
            id: k,
            text: optionsMap[k],
            correct: k === mcq.correctAnswer,
          }));

          return {
            id: docSnap.id,
            question: mcq.question,
            options: optionsArray,
          };
        }).filter(Boolean);

        setMcqs(mcqsArray);
      } catch (err) {
        console.error("Error fetching MCQs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMCQs();
  }, []);

  if (loading) return <div className="text-white">Loading MCQs...</div>;
  if (mcqs.length === 0) return <div className="text-white">No questions available.</div>;

  const currentQuestion = mcqs[currentIndex];

  const handleOptionClick = async (option) => {
    if (showFeedback) return;
    setSelectedOption(option);
    setShowFeedback(true);

    if (option.correct) {
      const xpReward = 10; // XP per MCQ (adjust as needed)
      const userRef = doc(db, "user_progress", uid);

      try {
        await runTransaction(db, async (transaction) => {
          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists()) throw "User not found";

          const prevCompletedMCQs = userDoc.data().completedMCQs || [];
          const prevXp = userDoc.data().totalxp || 0;
          const allMCQs = mcqs.map((q) => q.id);

          // Update completedMCQs & totalxp
          if (!prevCompletedMCQs.includes(currentQuestion.id)) {
            transaction.update(userRef, {
              completedMCQs: arrayUnion(currentQuestion.id),
              totalxp: prevXp + xpReward,
            });
          }

          // Check if all MCQs are done → unlock badge
          const updatedCompleted = [...prevCompletedMCQs, currentQuestion.id];
          if (allMCQs.every((id) => updatedCompleted.includes(id))) {
            transaction.update(userRef, {
              badges: arrayUnion("Variable Badge"),
            });
          }
        });
      } catch (err) {
        console.error("Error updating user MCQ progress:", err);
      }
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowFeedback(false);
    if (currentIndex + 1 < mcqs.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate("/badge", { state: { badgeName: "Variable Badge" } });
    }
  };

  return (
    <div className="bg-[#0A0F28] min-h-screen flex flex-col items-center justify-center p-6 text-white">
      <h2 className="text-2xl mb-6">{currentQuestion.question}</h2>
      <div className="grid gap-4 w-full max-w-md">
        {currentQuestion.options.map((option, idx) => {
          let bgColor = "bg-[#89CFF0]";
          if (showFeedback) {
            if (option === selectedOption) {
              bgColor = option.correct ? "bg-green-500" : "bg-red-500";
            } else if (option.correct) {
              bgColor = "bg-green-500";
            }
          }
          return (
            <button
              key={idx}
              className={`${bgColor} text-[#0A0F28] font-semibold py-3 px-4 rounded-lg hover:bg-[#1E90FF] transition`}
              onClick={() => handleOptionClick(option)}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <button
          className="mt-6 bg-purple-600 hover:bg-purple-500 py-2 px-6 rounded-lg font-bold transition"
          onClick={handleNext}
        >
          {currentIndex + 1 < mcqs.length ? "Next Question" : "Finish"}
        </button>
      )}
    </div>
  );
}






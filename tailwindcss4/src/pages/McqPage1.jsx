
import { useState } from "react";
import {useNavigate} from "react-router-dom";


const mcqQuestions = [
  {
    question: "What is used to store numbers in programming?",
    options: [
      { text: "Variable", correct: true },
      { text: "Function", correct: false },
      { text: "Loop", correct: false },
      { text: "Condition", correct: false },
    ],
  },
  {
    question: "Which of the following is a constant in Visual Basic?",
    options: [
      { text: "Const Pi = 3.14", correct: true },
      { text: "Dim x = 10", correct: false },
      { text: "If x > 5 Then", correct: false },
      { text: "For i = 1 To 5", correct: false },
    ],
  },
];

export default function MCQPage({ onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentQuestion = mcqQuestions[currentIndex];

  const handleOptionClick = (option) => {
    if (showFeedback) return; // prevent multiple clicks
    setSelectedOption(option);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowFeedback(false);
    if (currentIndex + 1 < mcqQuestions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish(); // all questions done
    }
  };

  return (
    <div className="bg-[#0A0F28] min-h-screen flex flex-col items-center justify-center p-6 text-white">
      <h2 className="text-2xl mb-6">{currentQuestion.question}</h2>
      <div className="grid gap-4 w-full max-w-md">
        {currentQuestion.options.map((option, idx) => {
          let bgColor = "bg-[#89CFF0]"; // baby blue default
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
          {currentIndex + 1 < mcqQuestions.length ? "Next Question" : "Finish"}
        </button>
      )}
    </div>
  );
}


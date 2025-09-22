import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function BadgePage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const badgeFile = "variable_badge.png";
  const badgeName = "Variable Master";
  const completedLevels = 4;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1931] text-white p-6">
      {/* Main content container */}
      <div className={`bg-[#0A1931] rounded-2xl border border-[#6EACDA]/20 p-8 max-w-md w-full transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#6EACDA] to-[#83D2FF]">
            Achievement Unlocked!
          </h1>
          <p className="text-[#83D2FF]">You've mastered variable concepts</p>
        </div>
        
        {/* Level Completion Indicators */}
        <div className="flex justify-center mb-6">
          {[1, 2, 3, 4].map((level) => (
            <div key={level} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${level <= completedLevels ? 'bg-gradient-to-br from-[#6EACDA] to-[#83D2FF]' : 'bg-gray-700'}`}>
                {level <= completedLevels && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {level < 4 && (
                <div className={`w-4 h-1 mx-1 ${level < completedLevels ? 'bg-gradient-to-r from-[#6EACDA] to-[#83D2FF]' : 'bg-gray-700'}`}></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center text-sm text-[#83D2FF] mb-8">
          Completed all {completedLevels} levels
        </div>
        
        {/* Badge Display - Larger Size */}
        <div className="relative mb-8 flex justify-center">
          <div className="relative w-64 h-64 bg-gradient-to-br from-[#0A1931] to-[#132545] rounded-2xl flex items-center justify-center border border-[#6EACDA]/20">
            {/* Badge shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6EACDA]/10 to-transparent transform -skew-x-12 animate-shine"></div>
            
            {/* Badge image with elegant frame */}
            <div className="w-52 h-52 rounded-full bg-gradient-to-br from-[#6EACDA] to-[#83D2FF] p-2 shadow-lg">
              <div className="w-full h-full rounded-full bg-[#0A1931] flex items-center justify-center">
                <img
                  src={`/${badgeFile}`}
                  alt={`${badgeName} badge`}
                  className="w- h-1000 object-contain "
                />
              </div>
            </div>
            
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-[#6EACDA]/10 blur-xl rounded-full z-0"></div>
          </div>
        </div>
        
        {/* Badge Info */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2 text-[#83D2FF]">{badgeName}</h2>
          <div className="inline-flex items-center bg-[#132545] rounded-full px-4 py-2 border border-[#6EACDA]/20">
            <svg className="w-5 h-5 mr-2 text-[#83D2FF]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-[#83D2FF]">Mastery Badge</span>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="group relative w-full bg-gradient-to-r from-[#6EACDA] to-[#83D2FF] hover:from-[#5A9BC5] hover:to-[#6EACDA] text-[#0A1931] font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-[#6EACDA]/30 hover:shadow-[#6EACDA]/50"
          >
            Continue Your Journey
            <svg className="w-5 h-5 ml-2 inline-block transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="fixed -bottom-32 -left-32 w-64 h-64 bg-[#6EACDA]/10 rounded-full blur-3xl"></div>
      <div className="fixed -top-32 -right-32 w-64 h-64 bg-[#83D2FF]/10 rounded-full blur-3xl"></div>
      
      <style>
        {`
          @keyframes shine {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          .animate-shine {
            animation: shine 1.5s ease-in-out infinite;
          }
          body {
            background-color: #0A1931;
          }
        `}
      </style>
    </div>
  );
}


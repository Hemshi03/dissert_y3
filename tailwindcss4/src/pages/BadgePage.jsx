import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase.config";

export default function BadgePage() {
  const navigate = useNavigate();
  const [badges, setBadges] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [progressData, setProgressData] = useState({
    completedLevels: [],
    completedMCQs: [],
    tags: [],
  });

  useEffect(() => setIsVisible(true), []);

  useEffect(() => {
    const fetchAndAwardBadges = async () => {
      if (!auth.currentUser) return;
      const uid = auth.currentUser.uid;
      const progressRef = doc(db, "user_progress", uid);

      try {
        const progressSnap = await getDoc(progressRef);
        if (!progressSnap.exists()) return;

        const progress = progressSnap.data();
        setProgressData({
          completedLevels: progress.completedLevels || [],
          completedMCQs: progress.completedMCQs || [],
          tags: progress.tags || [], // e.g., "Variable Master"
        });

        const earnedBadgeIds = progress.badges || [];
        const totalxp = progress.totalxp || 0;

        const badgeIds = ["bd_01"];
        const badgesToShow = [];

        for (const badgeId of badgeIds) {
          const badgeRef = doc(db, "badges", badgeId);
          const badgeSnap = await getDoc(badgeRef);
          if (!badgeSnap.exists()) continue;

          const badge = badgeSnap.data();
          const requiredLevels = badge.completedLevels || [];
          const requiredMCQs = badge.completedMCQs || [];
          const minXP = badge.criteria?.minxp || 0;

          const meetsLevels = requiredLevels.every(level =>
            progress.completedLevels.includes(level)
          );
          const meetsMCQs = requiredMCQs.every(mcq =>
            progress.completedMCQs.includes(mcq)
          );
          const meetsXP = totalxp === minXP;

          const alreadyEarned = earnedBadgeIds.includes(badgeId);

          if (meetsLevels && meetsMCQs && meetsXP && !alreadyEarned) {
            await updateDoc(progressRef, { badges: arrayUnion(badgeId) });
            earnedBadgeIds.push(badgeId);
          }

          if (earnedBadgeIds.includes(badgeId)) {
            badgesToShow.push(badge);
          }
        }

        setBadges(badgesToShow);
      } catch (err) {
        console.error("Error fetching or awarding badges:", err);
      }
    };

    fetchAndAwardBadges();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1931] text-white p-6">
      <div
        className={`bg-[#0A1931] rounded-2xl p-8 max-w-lg w-full transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-wide mb-1 bg-clip-text text-transparent bg-gradient-to-r from-[#6EACDA] to-[#83D2FF]">
            Achievement Hall
          </h1>
        </div>
        {/* Badge Section */}
        {badges.length === 0 ? (
          <p className="text-center text-[#83D2FF]">No badges earned yet.</p>
        ) : (
          <div className="flex flex-col gap-10 items-center">
            {badges.map(badge => (
              <div key={badge.badge_name} className="text-center">
                    <img
                      src={`/${badge.icon.replace("./", "")}`}
                      alt={`${badge.badge_name} badge`}
                      className="w-70 h-70 object-contain -mt-10 mb-4 mx-auto"
                    />  
              <div className="text-center -mt-8">             
                <h2 className="text-2xl font-semibold mt-0 text-[#cea00a]">
                  {badge.badge_name}
                </h2>
                <p className="text-sm text-[#83D2FF]/80">{badge.description}</p>
              </div>
              </div>
            ))}
          </div>
        )}

        {/* Progress Checkboxes */}
        <div className="mt-10 grid gap-4">
          <div className="flex items-center gap-3 bg-[#132545] p-4 rounded-xl shadow-inner">
            <input
              type="checkbox"
              checked={progressData.completedLevels.length >= 4}
              readOnly
              className="w-5 h-5 accent-[#6EACDA]"
            />
            <span className="text-sm">Completed all 4 levels</span>
          </div>
          <div className="flex items-center gap-3 bg-[#132545] p-4 rounded-xl shadow-inner">
            <input
              type="checkbox"
              checked={progressData.completedMCQs.length > 0}
              readOnly
              className="w-5 h-5 accent-[#6EACDA]"
            />
            <span className="text-sm">Completed MCQ</span>
          </div>
          {progressData.tags.map(tag => (
            <div
              key={tag}
              className="flex items-center gap-3 bg-[#132545] p-4 rounded-xl shadow-inner"
            >
              <input
                type="checkbox"
                checked
                readOnly
                className="w-5 h-5 accent-[#6EACDA]"
              />
              <span className="text-sm">{tag}</span>
            </div>
          ))}
        </div>

{/* Continue Button */}
<div className="text-center mt-10">
  <button
    onClick={() => navigate("/")}
    className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#6EACDA] to-[#83D2FF] 
               text-[#0A1931] font-semibold tracking-wide shadow-md 
               shadow-[#6EACDA]/30 hover:shadow-[#6EACDA]/50 
               transition-transform transform hover:scale-[1.05]"
  >
    Continue Journey
  </button>
</div>
      </div>
    </div>
  );
}

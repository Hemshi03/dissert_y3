import { useState, useEffect } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase.config";
import { useNavigate } from "react-router-dom";
import { Star, Zap, Book } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [xp, setXp] = useState(0);
  const [mana, setMana] = useState(100);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [userName, setUserName] = useState("");
  const [badges, setBadges] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Real-time listener for user_progress
    const unsubscribeProgress = onSnapshot(
      doc(db, "user_progress", user.uid),
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setXp(data.totalxp || 0);
          setMana(data.mana ?? 100);
          setCompletedLevels(data.completedLevels || []);
          setHintsUsed(data.hintsUsed || 0);

          // Fetch badges
          if (data.badges && data.badges.length > 0) {
            const badgesData = [];
            for (const badgeId of data.badges) {
              const badgeSnap = await getDoc(doc(db, "badges", badgeId));
              if (badgeSnap.exists()) {
                badgesData.push(badgeSnap.data());
              }
            }
            setBadges(badgesData);
          } else {
            setBadges([]);
          }
        }
      }
    );

    // Real-time listener for username
    const unsubscribeUser = onSnapshot(
      doc(db, "users", user.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          setUserName(docSnap.data().username || "Adventurer");
        }
      }
    );

    return () => {
      unsubscribeProgress();
      unsubscribeUser();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F28] to-[#1C1F3C] text-white p-6 overflow-x-hidden">
      {/* Greeting */}
      <h1 className="text-4xl font-extrabold text-yellow-400 mb-4 animate-bounce">
        🌟 Welcome back, {userName}!
      </h1>
      <p className="text-gray-300 mb-8">Your coding adventure continues…</p>

      {/* XP & Mana bars */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1 bg-[#22254b] rounded-xl p-4 shadow-lg">
          <div className="flex justify-between mb-2">
            <p className="font-semibold text-gray-300">XP</p>
            <p className="font-bold text-yellow-400">{xp}</p>
          </div>
          <div className="h-6 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(xp, 100)}%` }}
              transition={{ duration: 0.5 }}
              className="h-6 bg-yellow-400"
            />
          </div>
        </div>

        <div className="flex-1 bg-[#22254b] rounded-xl p-4 shadow-lg">
          <div className="flex justify-between mb-2">
            <p className="font-semibold text-gray-300">Mana</p>
            <p className="font-bold text-blue-400">{mana}</p>
          </div>
          <div className="h-6 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${mana}%` }}
              transition={{ duration: 0.5 }}
              className="h-6 bg-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Completed Levels */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-300 mb-2 flex items-center gap-2">
          <Book className="w-5 h-5 text-green-400" /> Completed Levels
        </h2>
        {completedLevels.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto">
            {completedLevels.map((lvl) => (
              <motion.div
                key={lvl}
                whileHover={{ scale: 1.1 }}
                className="min-w-[100px] bg-[#33366a] rounded-xl p-4 text-center shadow-lg cursor-pointer"
              >
                <p className="font-bold text-green-400">{lvl}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No levels completed yet.</p>
        )}
      </div>

      {/* Hints Used */}
      <div className="mb-8 bg-[#22254b] rounded-xl p-4 shadow-lg flex items-center gap-4">
        <Zap className="w-6 h-6 text-yellow-400" />
        <div>
          <p className="text-gray-300 font-semibold">Hints Used</p>
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-yellow-400 font-bold text-xl"
          >
            {hintsUsed}
          </motion.p>
        </div>
      </div>

      {/* Badges Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" /> Your Badges
        </h2>
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {badges.map((badge) => (
              <div
                key={badge.badge_name}
                className="bg-[#33366a] rounded-xl p-4 text-center shadow-lg min-w-[100px]"
              >
                <img
                  src={`/${badge.icon.replace("./", "")}`}
                  alt={badge.badge_name}
                  className="w-16 h-16 object-contain mx-auto mb-2"
                />
                <p className="text-yellow-400 font-semibold">{badge.badge_name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No badges earned yet.</p>
        )}
      </div>

      {/* Continue Adventure */}
      <div className="text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/Chapter1")}
          className="px-10 py-4 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-white text-xl shadow-lg"
        >
          🚀 Continue Adventure
        </motion.button>
      </div>
    </div>
  );
}



















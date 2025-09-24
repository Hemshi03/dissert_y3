import React, { useEffect, useState } from "react";
import { collection, doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { FaCrown } from "react-icons/fa";

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "user_progress"),
      async (snapshot) => {
        const users = [];

        for (const progressDoc of snapshot.docs) {
          const progressData = progressDoc.data();
          const uid = progressData.authUID;

          try {
            // Fetch username from users collection
            const userDocRef = doc(db, "users", uid);
            const userDocSnap = await getDoc(userDocRef);
            const username = userDocSnap.exists()
              ? userDocSnap.data().progress?.username || userDocSnap.data().username || "Adventurer"
              : "Adventurer";

            users.push({
              uid,
              name: username,
              points: progressData.totalxp || 0,
              createdAt: progressData.createdAt || null, // timestamp for tiebreaker
            });
          } catch (err) {
            console.error(`Error fetching username for UID ${uid}:`, err);
          }
        }

        // Sort: primary = XP desc, secondary = earliest createdAt, tertiary = username
        users.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (a.createdAt && b.createdAt)
            return a.createdAt.toMillis() - b.createdAt.toMillis();
          return a.name.localeCompare(b.name);
        });

        // Only top 10
        setLeaderboardData(users.slice(0, 10));
      },
      (err) => console.error("Error fetching leaderboard:", err)
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-[#0A0F28] text-white min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-700">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaCrown size={28} className="text-yellow-400" /> Leaderboard
        </h1>
      </header>

      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <p className="text-center mb-8 text-lg">
          See the top coding champions in KODEDGE!
        </p>

        <div className="flex flex-col gap-4">
          {leaderboardData.length > 0 ? (
            leaderboardData.map((user, index) => (
              <div
                key={user.uid}
                className="bg-[#101433] p-4 rounded-xl flex justify-between items-center hover:scale-105 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="text-yellow-400 text-2xl font-bold">#{index + 1}</div>
                  <div className="text-xl font-semibold">{user.name}</div>
                </div>
                <div className="text-purple-400 font-semibold text-lg">{user.points} XP</div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No leaderboard data yet.</p>
          )}
        </div>
      </main>

      <footer className="mt-auto bg-[#0A0F28] border-t border-gray-800 py-6 px-4 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} KODEDGE. All rights reserved.</p>
      </footer>
    </div>
  );
}


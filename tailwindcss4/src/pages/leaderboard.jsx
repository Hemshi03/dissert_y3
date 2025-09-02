// Leaderboard.jsx
import React from "react";
import { FaCrown } from "react-icons/fa";

export default function Leaderboard() {
  const leaderboardData = [
    { rank: 1, name: "Alice", points: 1200 },
    { rank: 2, name: "Bob", points: 1100 },
    { rank: 3, name: "Charlie", points: 950 },
    { rank: 4, name: "David", points: 900 },
    { rank: 5, name: "Eva", points: 850 },
  ];

  return (
    <div className="bg-[#0A0F28] text-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-700">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaCrown size={28} className="text-yellow-400" /> Leaderboard
        </h1>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <p className="text-center mb-8 text-lg">
          See the top coding champions in KODEDGE!
        </p>

        <div className="flex flex-col gap-4">
          {leaderboardData.map((user) => (
            <div
              key={user.rank}
              className="bg-[#101433] p-4 rounded-xl flex justify-between items-center hover:scale-105 transition"
            >
              <div className="flex items-center gap-4">
                <div className="text-yellow-400 text-2xl font-bold">
                  #{user.rank}
                </div>
                <div className="text-xl font-semibold">{user.name}</div>
              </div>
              <div className="text-purple-400 font-semibold text-lg">
                {user.points} XP
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-[#0A0F28] border-t border-gray-800 py-6 px-4 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} KODEDGE. All rights reserved.</p>
      </footer>
    </div>
  );
}


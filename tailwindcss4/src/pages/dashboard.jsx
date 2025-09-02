import React from "react";
import { Link } from "react-router-dom";
import { Crown, Star, Trophy, Flame } from "lucide-react";

export default function Dashboard() {
  const userStats = {
    level: 3,
    xp: 600,
    nextLevelXp: 800,
    totalXp: 1200,
    chaptersCompleted: 1,
    totalChapters: 10,
    rank: 47,
    streak: 5,
  };

  const badges = [
    { id: 1, name: "Variable Master", icon: "📝", earned: true },
    { id: 2, name: "Decision Maker", icon: "🎯", earned: false },
    { id: 3, name: "Loop Master", icon: "🔄", earned: false },
    { id: 4, name: "First Steps", icon: "👶", earned: true },
    { id: 5, name: "Speed Demon", icon: "⚡", earned: false },
    { id: 6, name: "Perfectionist", icon: "💎", earned: false },
  ];

  const recentActivity = [
    { action: "Completed", item: "Variables Challenge 2", xp: 50, time: "2 hours ago" },
    { action: "Earned", item: "Variable Master Badge", xp: 100, time: "2 hours ago" },
    { action: "Completed", item: "Chapter 1: Variables", xp: 150, time: "3 hours ago" },
    { action: "Started", item: "KODEDGE Journey", xp: 25, time: "1 day ago" },
  ];

  const leaderboard = [
    { rank: 1, name: "Alex_Coder", xp: 2450, avatar: "🏆" },
    { rank: 2, name: "Sarah_Dev", xp: 2100, avatar: "⭐" },
    { rank: 3, name: "Mike_Script", xp: 1950, avatar: "🚀" },
    { rank: 4, name: "CodeNinja", xp: 1800, avatar: "🥷" },
    { rank: 5, name: "You", xp: userStats.totalXp, avatar: "👤" },
  ];

  const xpProgress = (userStats.xp / userStats.nextLevelXp) * 100;

  return (
    <div className="min-h-screen bg-[#0A0F28] text-white">
      {/* Header */}
      <header className="p-6 border-b border-gray-700">
        <h1 className="text-3xl font-bold mb-1">Welcome Back, Hero!</h1>
        <p className="text-gray-400">Ready to continue your coding adventure?</p>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-[#1B2240] rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold">Level {userStats.level}</div>
            <div className="text-sm text-gray-400">Hero Level</div>
          </div>

          <div className="bg-[#1B2240] rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold">{userStats.totalXp}</div>
            <div className="text-sm text-gray-400">Total XP</div>
          </div>

          <div className="bg-[#1B2240] rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold">#{userStats.rank}</div>
            <div className="text-sm text-gray-400">Global Rank</div>
          </div>

          <div className="bg-[#1B2240] rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold">{userStats.streak}</div>
            <div className="text-sm text-gray-400">Day Streak</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Level Progress */}
          <div className="bg-[#1B2240] p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Level Progress</h2>
              <span className="bg-green-600 px-2 py-1 rounded">Level {userStats.level}</span>
            </div>
            <div className="mb-2 flex justify-between text-sm text-gray-300">
              <span>XP Progress</span>
              <span>{userStats.xp} / {userStats.nextLevelXp} XP</span>
            </div>
            <div className="bg-gray-700 h-3 rounded-full overflow-hidden mb-2">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: `${xpProgress}%` }} />
            </div>
            <p className="text-xs text-gray-400">{userStats.nextLevelXp - userStats.xp} XP to next level</p>
          </div>

          {/* Chapter Progress */}
          <div className="bg-[#1B2240] p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Learning Progress</h2>
              <span className="bg-blue-600 px-2 py-1 rounded">
                {userStats.chaptersCompleted}/{userStats.totalChapters} Chapters
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-800 p-4 rounded text-center">
                <div className="text-2xl mb-1">✅</div>
                <div className="font-medium">Variables</div>
                <div className="text-xs text-green-400">Completed</div>
              </div>
              <div className="bg-gray-800 p-4 rounded text-center opacity-60">
                <div className="text-2xl mb-1">🔒</div>
                <div className="font-medium">Conditions</div>
                <div className="text-xs text-gray-400">Locked</div>
              </div>
              <div className="bg-gray-800 p-4 rounded text-center opacity-60">
                <div className="text-2xl mb-1">🔒</div>
                <div className="font-medium">Loops</div>
                <div className="text-xs text-gray-400">Locked</div>
              </div>
            </div>
            <Link
              to="/chapter/2"
              className="block text-center bg-purple-600 hover:bg-purple-700 py-2 rounded font-semibold"
            >
              Continue Learning
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#1B2240] p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-2">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-900 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-600 text-sm">
                      {activity.action === "Completed" ? "✓" : activity.action === "Earned" ? "🏆" : "▶️"}
                    </div>
                    <div>
                      <div className="font-medium">{activity.action} {activity.item}</div>
                      <div className="text-xs text-gray-400">{activity.time}</div>
                    </div>
                  </div>
                  <span className="bg-green-600 px-2 py-1 rounded text-xs">+{activity.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leaderboard */}
          <div className="bg-[#1B2240] p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-4">Leaderboard</h3>
            <div className="space-y-2">
              {leaderboard.map((player, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center p-2 rounded ${
                    player.name === "You" ? "bg-purple-900" : "bg-gray-900"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 flex items-center justify-center">{player.avatar}</div>
                    <div>
                      <div className="font-medium">{player.name}</div>
                      <div className="text-xs text-gray-400">#{player.rank}</div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-yellow-400">{player.xp} XP</div>
                </div>
              ))}
            </div>
            <Link
              to="/leaderboard"
              className="block mt-4 text-center bg-gray-700 hover:bg-gray-600 py-1 rounded text-sm"
            >
              View Full Leaderboard
            </Link>
          </div>

          {/* Badges */}
          <div className="bg-[#1B2240] p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-4">Badges</h3>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3 rounded text-center border ${
                    badge.earned ? "border-yellow-500 bg-yellow-900/20" : "border-gray-700 bg-gray-900/30 opacity-50"
                  }`}
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-medium">{badge.name}</div>
                  {badge.earned && <div className="text-xs text-yellow-400 mt-1">Earned!</div>}
                </div>
              ))}
            </div>
            <Link
              to="/badges"
              className="block mt-4 text-center bg-gray-700 hover:bg-gray-600 py-1 rounded text-sm"
            >
              View All Badges
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#1B2240] p-6 rounded-xl space-y-2">
            <h3 className="font-bold text-lg mb-2">Quick Actions</h3>
            <Link
              to="/chapter/1"
              className="block bg-purple-600 hover:bg-purple-700 py-2 rounded text-center"
            >
              Practice Variables
            </Link>
            <Link
              to="/leaderboard"
              className="block bg-gray-700 hover:bg-gray-600 py-2 rounded text-center"
            >
              Challenge Friends
            </Link>
            <Link
              to="/profile"
              className="block bg-gray-800 hover:bg-gray-700 py-2 rounded text-center"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



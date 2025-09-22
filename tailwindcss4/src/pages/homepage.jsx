// Homepage.jsx
import React, { useState, useEffect } from "react";
import { FaGamepad, FaTrophy, FaUsers, FaCode, FaLightbulb, FaRocket, FaUserCircle, FaCrown, FaBars, FaTimes, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";
import { db } from "../firebase.config";
import { collection, getDocs } from "firebase/firestore";

export default function Homepage({ userProgress }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chapters, setChapters] = useState([]);

  const features = [
    { icon: <FaGamepad size={24} />, title: "Interactive Gaming", desc: "Learn coding through fun, story-driven games." },
    { icon: <FaTrophy size={24} />, title: "Achievement System", desc: "Earn badges, rewards, and track your progress." },
    { icon: <FaUsers size={24} />, title: "Collaborative Learning", desc: "Work with friends and compete on leaderboards." },
    { icon: <FaCode size={24} />, title: "Code Challenges", desc: "Practice coding concepts in engaging exercises." },
    { icon: <FaLightbulb size={24} />, title: "Adaptive AI Tutor", desc: "Get personalized guidance based on your skills." },
    { icon: <FaRocket size={24} />, title: "Fast Progress", desc: "Level up quickly with structured learning paths." },
  ];

  const progress = userProgress || { currentChapter: 1, completedLevels: [] };

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "chapters"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          description: doc.data().description,
          totalxp: doc.data().totalxp,
        }));
        // Sort so CH1, CH2, CH3 stay in order
        data.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
        setChapters(data);
      } catch (err) {
        console.error("Error fetching chapters:", err);
      }
    };

    fetchChapters();
  }, []);

  return (
    <div className="bg-[#0A0F28] text-white min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#1A1F44] flex items-center justify-between px-8 py-4 border-b border-gray-700">
        <div className="flex items-center gap-2 md:gap-3">
          <img src="/logo.png" alt="KODEDGE Logo" className="h-10 w-10 object-contain" />
          <span className="text-2xl font-bold">KODEDGE</span>
        </div>

        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        <nav className={`flex-col md:flex-row md:flex md:items-center gap-4 md:gap-6 absolute md:static top-full right-0 w-full md:w-auto bg-[#1A1F44] md:bg-transparent transition-all duration-300 overflow-hidden ${menuOpen ? "max-h-60" : "max-h-0"} md:max-h-full`}>
          <Link to="/about" className="hover:text-purple-400 px-4 py-2 md:p-0">About Us</Link>
          <Link to="/dashboard" className="hover:text-purple-400 px-4 py-2 md:p-0">Dashboard</Link>
          <Link to="/leaderboard" className="hover:text-purple-400 flex items-center gap-1 px-4 py-2 md:p-0">
            <FaCrown size={20} /> Leaderboard
          </Link>
          <Link to="/profile" className="hover:text-purple-400 px-4 py-2 md:p-0">
            <FaUserCircle size={28} />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Level Up Your Coding Skills Through Epic Adventures</h1>
        <p className="text-lg md:text-xl mb-6 max-w-2xl">
          KODEDGE makes learning programming fun, interactive, and rewarding with story-driven games and challenges.
        </p>
        <div className="flex gap-4">
          <button className="bg-gradient-to-r from-purple-500 to-orange-500 px-6 py-3 rounded-lg font-semibold hover:scale-105 transition">Start Your Adventure</button>
          <button className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#0A0F28] transition">View Demo</button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">Why Choose KODEDGE?</h2>
        <p className="text-center mb-10 max-w-3xl mx-auto">
          Experience a revolutionary way to learn coding with games, achievements, and collaborative challenges tailored for your learning journey.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-[#101433] p-6 rounded-xl flex flex-col items-center text-center hover:scale-105 transition">
              <div className="mb-4 text-purple-400">{feature.icon}</div>
              <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Chapters Section (dynamic) */}
      <section className="py-10 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Start Your Coding Journey</h2>
        <p className="text-center mb-6 max-w-3xl mx-auto">
          Choose a chapter to begin your adventure in coding with KODEDGE.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {chapters.map((chapter, idx) => {
            const isUnlocked = idx + 1 <= progress.currentChapter;
            return (
              <div key={chapter.id} className={`bg-[#101433] p-6 rounded-xl flex flex-col items-center text-center hover:scale-105 transition ${!isUnlocked ? "opacity-50 cursor-not-allowed" : ""}`}>
                <h3 className="font-semibold text-xl mb-2">Chapter {idx + 1}</h3> {/* Display as Chapter 1 */}
                <p>{chapter.description}</p>
                <p className="mt-1 text-purple-400 font-semibold">XP: {chapter.totalxp}</p>

                {isUnlocked ? (
                  <Link
                    to={`/chapter${idx + 1}`} // keeps /chapter1, /chapter2 links
                    className="mt-4 bg-gradient-to-r from-purple-500 to-orange-500 px-4 py-2 rounded-lg font-semibold hover:scale-105 transition"
                  >
                    Start Chapter
                  </Link>
                ) : (
                  <div className="mt-4 flex items-center gap-2 text-gray-400 font-semibold">
                    <FaLock /> Locked
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#0A0F28] border-t border-gray-800 py-6 px-4 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} KODEDGE. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <a href="#" className="hover:text-purple-400">Privacy Policy</a>
          <a href="#" className="hover:text-purple-400">Terms of Service</a>
          <a href="#" className="hover:text-purple-400">Contact</a>
        </div>
      </footer>
    </div>
  );
}










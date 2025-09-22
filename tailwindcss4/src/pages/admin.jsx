import React, { useEffect, useState } from "react";
import { db } from "../firebase.config";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { FaUsers, FaBook, FaAward } from "react-icons/fa";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("users");
  const [users, setUsers] = useState([]);
  const [badges, setBadges] = useState([]);
  const [chapterForms, setChapterForms] = useState([]);
  const [message, setMessage] = useState("");
  const [levelJsonInputs, setLevelJsonInputs] = useState({}); // For safe JSON typing

  // --- FETCH USERS ---
  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // --- FETCH BADGES ---
  const fetchBadges = async () => {
    const snap = await getDocs(collection(db, "badges"));
    setBadges(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // --- FETCH CHAPTERS + LEVELS ---
  const fetchChapters = async () => {
    const snap = await getDocs(collection(db, "chapters"));
    const chapData = await Promise.all(
      snap.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const levelsSnap = await getDocs(collection(db, "chapters", docSnap.id, "levels"));
        const levels = levelsSnap.docs.map((l) => ({ id: l.id, ...l.data() }));
        return { id: docSnap.id, ...data, levels };
      })
    );
    setChapterForms(chapData);

    // Initialize JSON input state
    const jsonInputs = {};
    chapData.forEach((chapter) => {
      chapter.levels.forEach((level) => {
        jsonInputs[level.id] = {
          answer: JSON.stringify(level.answer || {}, null, 2),
          languageBlocks: JSON.stringify(level.languageBlocks || {}, null, 2),
        };
      });
    });
    setLevelJsonInputs(jsonInputs);
  };

  // --- HANDLE FORM CHANGE ---
  const handleChapterChange = (chapterId, field, value) => {
    setChapterForms((prev) =>
      prev.map((c) => (c.id === chapterId ? { ...c, [field]: value } : c))
    );
  };

  const handleLevelChange = (chapterId, levelId, field, value) => {
    setChapterForms((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? {
              ...c,
              levels: c.levels.map((l) =>
                l.id === levelId ? { ...l, [field]: value } : l
              ),
            }
          : c
      )
    );
  };

  // --- SAVE CHAPTER + LEVEL ---
  const saveChapter = async (chapter) => {
    if (!chapter.customId) {
      setMessage("Please provide a custom Chapter ID before saving!");
      return;
    }
    const chapterId = chapter.customId;

    await setDoc(doc(db, "chapters", chapterId), {
      storytext: chapter.storytext,
      totalxp: Number(chapter.totalxp),
      selectedLanguage: chapter.selectedLanguage,
    });

    for (const level of chapter.levels) {
      if (!level.customId) {
        setMessage("Please provide a custom Level ID for all levels!");
        return;
      }
      const levelId = level.customId;

      let answerObj = {};
      let blocksObj = {};
      try {
        answerObj = JSON.parse(levelJsonInputs[level.id]?.answer || "{}");
        blocksObj = JSON.parse(levelJsonInputs[level.id]?.languageBlocks || "{}");
      } catch (err) {
        setMessage(`Invalid JSON in level ${levelId}: ${err.message}`);
        return;
      }

      await setDoc(doc(db, "chapters", chapterId, "levels", levelId), {
        description: level.description,
        questionText: level.questionText,
        type: level.type,
        xpReward: Number(level.xpReward),
        answer: answerObj,
        languageBlocks: blocksObj,
      });
    }

    setMessage("Chapter & levels saved successfully!");
    fetchChapters();
  };

  // --- DELETE LEVEL ---
  const deleteLevel = async (chapterId, levelId) => {
    await deleteDoc(doc(db, "chapters", chapterId, "levels", levelId));
    fetchChapters();
  };

  // --- DELETE CHAPTER INCLUDING LEVELS ---
  const deleteChapter = async (chapterId) => {
    const levelsSnap = await getDocs(collection(db, "chapters", chapterId, "levels"));
    for (const l of levelsSnap.docs) {
      await deleteDoc(doc(db, "chapters", chapterId, "levels", l.id));
    }
    await deleteDoc(doc(db, "chapters", chapterId));
    fetchChapters();
  };

  // --- SAVE BADGE ---
  const saveBadge = async (badge) => {
    if (!badge.customId) {
      setMessage("Please provide a custom Badge ID before saving!");
      return;
    }
    const badgeId = badge.customId;

    await setDoc(doc(db, "badges", badgeId), {
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
    });

    setMessage("Badge saved successfully!");
    fetchBadges();
  };

  const deleteBadge = async (badgeId) => {
    await deleteDoc(doc(db, "badges", badgeId));
    fetchBadges();
  };

  useEffect(() => {
    fetchUsers();
    fetchBadges();
    fetchChapters();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold mb-6">Admin Dashboard</h1>
        <ul>
          <li
            className={`p-2 cursor-pointer ${activeSection === "users" && "bg-gray-700"}`}
            onClick={() => setActiveSection("users")}
          >
            <FaUsers className="inline mr-2" /> Users
          </li>
          <li
            className={`p-2 cursor-pointer ${activeSection === "badges" && "bg-gray-700"}`}
            onClick={() => setActiveSection("badges")}
          >
            <FaAward className="inline mr-2" /> Badges
          </li>
          <li
            className={`p-2 cursor-pointer ${activeSection === "chapters" && "bg-gray-700"}`}
            onClick={() => setActiveSection("chapters")}
          >
            <FaBook className="inline mr-2" /> Chapters
          </li>
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        {message && <div className="bg-green-200 p-2 rounded mb-4">{message}</div>}

        {/* Users Section */}
        {activeSection === "users" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Users (Read-only)</h2>
            <table className="w-full table-auto border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-2 py-1">Username</th>
                  <th className="border px-2 py-1">Email</th>
                  <th className="border px-2 py-1">Role</th>
                  <th className="border px-2 py-1">Total XP</th>
                  <th className="border px-2 py-1">Mana</th>
                  <th className="border px-2 py-1">Current Chapter</th>
                  <th className="border px-2 py-1">Rank</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="border px-2 py-1">{u.username}</td>
                    <td className="border px-2 py-1">{u.email}</td>
                    <td className="border px-2 py-1">{u.role}</td>
                    <td className="border px-2 py-1">{u.total_xp}</td>
                    <td className="border px-2 py-1">{u.mana}</td>
                    <td className="border px-2 py-1">{u.current_chapter}</td>
                    <td className="border px-2 py-1">{u.rank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Badges Section */}
        {activeSection === "badges" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Badges</h2>
            <button
              className="bg-green-500 text-white px-3 py-1 rounded mb-4"
              onClick={() =>
                setBadges((prev) => [
                  ...prev,
                  { id: "temp-" + Date.now(), customId: "", name: "", description: "", iconUrl: "" },
                ])
              }
            >
              + Add New Badge
            </button>

            {badges.map((badge) => (
              <div key={badge.id} className="border p-4 mb-4 rounded bg-white">
                <input
                  className="border p-1 mr-2 w-32"
                  placeholder="Custom Badge ID"
                  value={badge.customId || ""}
                  onChange={(e) =>
                    setBadges((prev) =>
                      prev.map((b) => (b.id === badge.id ? { ...b, customId: e.target.value } : b))
                    )
                  }
                />
                <input
                  className="border p-1 mr-2 w-64"
                  placeholder="Badge Name"
                  value={badge.name}
                  onChange={(e) =>
                    setBadges((prev) =>
                      prev.map((b) => (b.id === badge.id ? { ...b, name: e.target.value } : b))
                    )
                  }
                />
                <input
                  className="border p-1 mr-2 w-96"
                  placeholder="Description"
                  value={badge.description}
                  onChange={(e) =>
                    setBadges((prev) =>
                      prev.map((b) => (b.id === badge.id ? { ...b, description: e.target.value } : b))
                    )
                  }
                />
                <input
                  className="border p-1 mr-2 w-64"
                  placeholder="Icon URL"
                  value={badge.iconUrl}
                  onChange={(e) =>
                    setBadges((prev) =>
                      prev.map((b) => (b.id === badge.id ? { ...b, iconUrl: e.target.value } : b))
                    )
                  }
                />
                <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => saveBadge(badge)}>
                  Save Badge
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded ml-2"
                  onClick={() => deleteBadge(badge.customId || badge.id)}
                >
                  Delete Badge
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Chapters Section */}
        {activeSection === "chapters" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Chapters</h2>
            <button
              className="bg-green-500 text-white px-3 py-1 rounded mb-4"
              onClick={() =>
                setChapterForms((prev) => [
                  ...prev,
                  { id: "temp-" + Date.now(), customId: "", storytext: "", totalxp: 0, selectedLanguage: [], levels: [] },
                ])
              }
            >
              + Add New Chapter
            </button>

            {chapterForms.map((chapter) => (
              <div key={chapter.id} className="border p-4 mb-4 rounded bg-white">
                <input
                  className="border p-1 mr-2 w-32"
                  placeholder="Custom Chapter ID"
                  value={chapter.customId || ""}
                  onChange={(e) => handleChapterChange(chapter.id, "customId", e.target.value)}
                />
                <input
                  className="border p-1 mr-2 w-64"
                  placeholder="Story Text"
                  value={chapter.storytext}
                  onChange={(e) => handleChapterChange(chapter.id, "storytext", e.target.value)}
                />
                <input
                  className="border p-1 mr-2 w-32"
                  placeholder="Total XP"
                  type="number"
                  value={chapter.totalxp}
                  onChange={(e) => handleChapterChange(chapter.id, "totalxp", e.target.value)}
                />
                <input
                  className="border p-1 mr-2 w-64"
                  placeholder="Languages (comma)"
                  value={chapter.selectedLanguage.join(",")}
                  onChange={(e) =>
                    handleChapterChange(chapter.id, "selectedLanguage", e.target.value.split(","))
                  }
                />
                <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => saveChapter(chapter)}>
                  Save Chapter
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded ml-2"
                  onClick={() => deleteChapter(chapter.customId || chapter.id)}
                >
                  Delete Chapter
                </button>

                <div className="mt-2">
                  <h4 className="font-bold mb-2">Levels</h4>
                  <button
                    className="bg-green-300 px-2 py-1 rounded mb-2"
                    onClick={() =>
                      handleChapterChange(chapter.id, "levels", [
                        ...chapter.levels,
                        { id: "temp-" + Date.now(), customId: "", description: "", questionText: "", type: "", xpReward: 0, answer: {}, languageBlocks: {} },
                      ])
                    }
                  >
                    + Add Level
                  </button>

                  {chapter.levels.map((level) => (
                    <div key={level.id} className="border p-2 mb-2 rounded bg-gray-50">
                      <input
                        className="border p-1 mr-2 w-32"
                        placeholder="Custom Level ID"
                        value={level.customId || ""}
                        onChange={(e) => handleLevelChange(chapter.id, level.id, "customId", e.target.value)}
                      />
                      <input
                        className="border p-1 mr-2 w-64"
                        placeholder="Level Description"
                        value={level.description}
                        onChange={(e) => handleLevelChange(chapter.id, level.id, "description", e.target.value)}
                      />
                      <input
                        className="border p-1 mr-2 w-64"
                        placeholder="Question Text"
                        value={level.questionText}
                        onChange={(e) => handleLevelChange(chapter.id, level.id, "questionText", e.target.value)}
                      />
                      <input
                        className="border p-1 mr-2 w-32"
                        placeholder="XP"
                        type="number"
                        value={level.xpReward}
                        onChange={(e) => handleLevelChange(chapter.id, level.id, "xpReward", e.target.value)}
                      />
                      <input
                        className="border p-1 mr-2 w-64"
                        placeholder="Type"
                        value={level.type}
                        onChange={(e) => handleLevelChange(chapter.id, level.id, "type", e.target.value)}
                      />

                      {/* JSON inputs for Answer & Language Blocks */}
                      <textarea
                        className="border p-1 mr-2 w-full mb-1"
                        placeholder="Answer JSON"
                        value={levelJsonInputs[level.id]?.answer || "{}"}
                        onChange={(e) =>
                          setLevelJsonInputs((prev) => ({
                            ...prev,
                            [level.id]: { ...prev[level.id], answer: e.target.value },
                          }))
                        }
                      />
                      <textarea
                        className="border p-1 mr-2 w-full mb-1"
                        placeholder="Language Blocks JSON"
                        value={levelJsonInputs[level.id]?.languageBlocks || "{}"}
                        onChange={(e) =>
                          setLevelJsonInputs((prev) => ({
                            ...prev,
                            [level.id]: { ...prev[level.id], languageBlocks: e.target.value },
                          }))
                        }
                      />

                      <button
                        className="bg-red-400 px-2 py-1 rounded ml-2"
                        onClick={() => deleteLevel(chapter.customId || chapter.id, level.id)}
                      >
                        Delete Level
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}





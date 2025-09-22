// routes/userProgress.js
const express = require("express");
const router = express.Router();

// POST /api/user-progress/init
router.post("/init", async (req, res) => {
    try {
        const { uid } = req.body;
        if (!uid) return res.status(400).json({ error: "UID is required" });

        const db = req.app.get("db"); // Firestore instance injected in app
        const userRef = db.collection("users").doc(uid);
        const docSnap = await userRef.get();

        // If user doc doesn't exist, return error
        if (!docSnap.exists) {
            return res.status(404).json({ error: "User not found in Firestore" });
        }

        const userData = docSnap.data();

        // If progress already exists, return it
        if (userData.progress && Object.keys(userData.progress).length > 0) {
            return res.status(200).json({ message: "Progress already initialized", data: userData.progress });
        }

        // Initialize progress
        const initialProgress = {
            currentChapter: 1,
            completedLevels: [],
            completedMCQs: [],
            mana: 100,
            rank: "Novice",
            total_xp: 0,
            hintsUsed: 0
        };

        // Update user document with initial progress
        await userRef.update({ progress: initialProgress });

        res.status(200).json({ message: "User progress initialized", data: initialProgress });

    } catch (err) {
        console.error("Init error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/update-level", async (req, res) => {
    try {
        const { uid, chapter, level, xpReward } = req.body;

        if (!uid || !chapter || !level || xpReward === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const db = req.app.get("db"); // Firestore instance

        const userRef = db.collection("users").doc(uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userSnap.data();

        // Ensure progress object exists
        const currentProgress = userData.progress || {
            currentChapter: 1,
            completedLevels: [],
            completedMCQs: [],
            mana: 100,
            rank: "Novice",
            total_xp: 0,
            hintsUsed: 0
        };

        // Update completed levels - use Set to avoid duplicates
        const completedLevelsSet = new Set(currentProgress.completedLevels || []);
        completedLevelsSet.add(level); // This adds the level ID like "L01"
        const completedLevels = Array.from(completedLevelsSet);

        // Update XP
        const total_xp = (currentProgress.total_xp || 0) + xpReward;

        // Update user progress object
        const progress = {
            ...currentProgress,
            completedLevels,
            total_xp,
        };

        await userRef.update({ progress });

        return res.status(200).json({ message: "Level updated", data: progress });
    } catch (err) {
        console.error("Error updating level:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/user-progress/:uid
router.get("/:uid", async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.status(400).json({ error: "UID is required" });
        }

        const db = req.app.get("db");
        const userRef = db.collection("users").doc(uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userSnap.data();
        const progress = userData.progress || {
            currentChapter: 1,
            completedLevels: [],
            completedMCQs: [],
            mana: 100,
            rank: "Novice",
            total_xp: 0,
            hintsUsed: 0
        };

        return res.status(200).json({ data: progress });
    } catch (err) {
        console.error("Error fetching user progress:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;



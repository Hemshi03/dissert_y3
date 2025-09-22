const express = require("express");
const router = express.Router();

/**
 * ==========================
 *  CHAPTER ROUTES
 * ==========================
 */

// GET all chapters
router.get("/", async (req, res) => {
    try {
        const db = req.app.get("db");
        const snapshot = await db.collection("chapters").get();
        const chapters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(chapters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single chapter
router.get("/:chapterId", async (req, res) => {
    try {
        const db = req.app.get("db");
        const doc = await db.collection("chapters").doc(req.params.chapterId).get();
        if (!doc.exists) return res.status(404).json({ error: "Chapter not found" });
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE chapter
router.post("/", async (req, res) => {
    try {
        const db = req.app.get("db");
        const data = req.body;

        const docRef = await db.collection("chapters").add({
            ...data,
            updatedAt: new Date().toISOString(),
        });

        res.status(201).json({ id: docRef.id, ...data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE chapter
router.put("/:chapterId", async (req, res) => {
    try {
        const db = req.app.get("db");
        const data = req.body;

        await db.collection("chapters").doc(req.params.chapterId).update({
            ...data,
            updatedAt: new Date().toISOString(),
        });

        res.json({ id: req.params.chapterId, ...data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE chapter
router.delete("/:chapterId", async (req, res) => {
    try {
        const db = req.app.get("db");
        await db.collection("chapters").doc(req.params.chapterId).delete();
        res.json({ success: true, message: `Chapter ${req.params.chapterId} deleted` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * ==========================
 *  LEVEL ROUTES (subcollection)
 * ==========================
 */

// GET all levels in a chapter
router.get("/:chapterId/levels", async (req, res) => {
    try {
        const db = req.app.get("db");
        const snapshot = await db
            .collection("chapters")
            .doc(req.params.chapterId)
            .collection("levels")
            .get();

        const levels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(levels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single level
router.get("/:chapterId/levels/:levelId", async (req, res) => {
    try {
        const db = req.app.get("db");
        const doc = await db
            .collection("chapters")
            .doc(req.params.chapterId)
            .collection("levels")
            .doc(req.params.levelId)
            .get();

        if (!doc.exists) return res.status(404).json({ error: "Level not found" });
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE level
router.post("/:chapterId/levels", async (req, res) => {
    try {
        const db = req.app.get("db");
        const data = req.body;

        const docRef = await db
            .collection("chapters")
            .doc(req.params.chapterId)
            .collection("levels")
            .add({
                ...data,
                updatedAt: new Date().toISOString(),
            });

        res.status(201).json({ id: docRef.id, ...data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE level
router.put("/:chapterId/levels/:levelId", async (req, res) => {
    try {
        const db = req.app.get("db");
        const data = req.body;

        await db
            .collection("chapters")
            .doc(req.params.chapterId)
            .collection("levels")
            .doc(req.params.levelId)
            .update({
                ...data,
                updatedAt: new Date().toISOString(),
            });

        res.json({ id: req.params.levelId, ...data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE level
router.delete("/:chapterId/levels/:levelId", async (req, res) => {
    try {
        const db = req.app.get("db");
        await db
            .collection("chapters")
            .doc(req.params.chapterId)
            .collection("levels")
            .doc(req.params.levelId)
            .delete();

        res.json({ success: true, message: `Level ${req.params.levelId} deleted` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

// routes/track.js
let lastTrack = null; // in-memory store

const express = require("express");
const router = express.Router();

// GET last played track
router.get("/", (req, res) => {
    res.json(lastTrack || {});
});

// POST save/update last played track
router.post("/", (req, res) => {
    const { id, seek, isPlaying } = req.body;
    if (!id) {
        return res.status(400).json({ error: "id is required" });
    }
    lastTrack = { id, seek: seek || 0, isPlaying: !!isPlaying };
    res.json({ success: true, lastTrack });
});

module.exports = router;

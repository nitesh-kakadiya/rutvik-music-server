// controllers/trackController.js

// Temporary in-memory (later replace with DB)
let lastTrack = null;

// GET last played track
exports.getLastTrack = (req, res) => {
    res.json(lastTrack || {});
};

// POST save last played track
exports.saveLastTrack = (req, res) => {
    const { id, seek, isPlaying } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Track id is required" });
    }

    lastTrack = { id, seek: seek || 0, isPlaying: !!isPlaying };
    res.json({ success: true, lastTrack });
};

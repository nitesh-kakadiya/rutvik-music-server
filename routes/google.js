// backend/routes/google.js
const express = require("express");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const router = express.Router();

const TOKEN_PATH = path.join(__dirname, "../token.json");

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    `${process.env.BACKEND_URL}/google/oauth2callback`
);

// 🔹 Load token from file if available
if (fs.existsSync(TOKEN_PATH)) {
    try {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
        oAuth2Client.setCredentials(token);
        console.log("✅ Loaded saved Google token");
    } catch (err) {
        console.error("❌ Failed to load token.json", err);
    }
}

// 🔹 Generate login URL
router.get("/login", (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/drive.readonly"],
        prompt: "consent",
    });
    res.redirect(authUrl);
});

// 🔹 OAuth callback
router.get("/oauth2callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing code");

    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        console.log("✅ Token saved to", TOKEN_PATH);

        res.send("✅ Google Drive connected! You can now return to your app.");
    } catch (err) {
        console.error("OAuth error:", err);
        res.status(500).send("Authentication failed");
    }
});

// 🔹 List songs from Google Drive
router.get("/songs", async (req, res) => {
    try {
        const drive = google.drive({ version: "v3", auth: oAuth2Client });

        let query = "mimeType='audio/mpeg'";
        if (process.env.FOLDER_ID) {
            query += ` and '${process.env.FOLDER_ID}' in parents`;
        }

        const response = await drive.files.list({
            q: query,
            fields: "files(id, name)",
            pageSize: 50,
        });

        const songs = response.data.files.map((file) => {
            const [title, artist] = file.name.split(" - ");
            return {
                id: file.id,
                title: title || file.name,
                artist: artist || "Unknown Artist",
                url: `https://drive.google.com/uc?export=download&id=${file.id}`,
            };
        });

        res.json(songs);
    } catch (err) {
        console.error("Error fetching songs:", err.message);
        res.status(500).json({ error: "Failed to fetch songs" });
    }
});

module.exports = router;

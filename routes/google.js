// routes/google.js
const express = require("express");
const { google } = require("googleapis");

const router = express.Router();

const CLIENT_ID =
    "227987761311-v7tkugsgqrrha2sas85rfq2ioo3aa951.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:5000/google/oauth2callback"; // ✅ matches app.js mount

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

// 🔹 Replace this with your real Nitesh folder ID from Google Drive
const FOLDER_ID = "1p1lPiKU5vbfI4AnSbvc2IDmlctovF0f4";

// Step 1 → Login
router.get("/login", (req, res) => {
    const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];
    const url = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
    });
    res.redirect(url);
});

// Step 2 → Callback
router.get("/oauth2callback", async (req, res) => {
    try {
        const code = req.query.code;
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        res.send("✅ Google Login Successful. Now you can call /google/songs");
    } catch (err) {
        res.status(500).send("Auth Error: " + err.message);
    }
});

// Step 3 → Fetch Songs (only from Nitesh folder)
router.get("/songs", async (req, res) => {
    try {
        const drive = google.drive({ version: "v3", auth: oAuth2Client });
        const response = await drive.files.list({
            q: `'${FOLDER_ID}' in parents and mimeType='audio/mpeg'`, // filter by folder
            fields: "files(id, name, webContentLink)",
        });
        res.json(response.data.files);
    } catch (err) {
        res.status(500).send("Drive Error: " + err.message);
    }
});

module.exports = router;

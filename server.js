const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const songsPath = path.join(__dirname, "songs"); // Base directory for songs

// Serve static files from the "public" folder
app.use(express.static("public"));

// Route to get songs from a specified folder
app.get("/songs/:folder", (req, res) => {
    const folderName = req.params.folder;

    // Sanitize and construct the full folder path
    const folderPath = path.join(songsPath, path.normalize(folderName));

    // Prevent path traversal attacks
    if (!folderPath.startsWith(songsPath)) {
        return res.status(400).json({ error: "Invalid folder path" });
    }

    // Read the contents of the folder
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            if (err.code === "ENOENT") {
                return res.status(404).json({ error: "Folder not found" });
            }
            return res.status(500).json({ error: "Failed to read folder" });
        }

        // Filter MP3 files
        const songs = files.filter(file => file.toLowerCase().endsWith(".mp3"));

        // Return the list of songs as JSON
        res.json({ files: songs });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

router.get('/download/:filename', async (req, res) => {
    const { filename } = req.params;
    const candidates = [
        path.join(__dirname, '../images', filename),
        path.join(__dirname, '../logos', filename),
        path.join(__dirname, '../uploads', filename)
    ];

    let foundPath = null;
    for (const p of candidates) {
        try {
            await fs.access(p);
            foundPath = p;
            break;
        } catch {
            // continue checking next directory
        }
    }

    if (!foundPath) {
        if (!res.headersSent) {
            return res.status(404).json({ message: 'File not found' });
        }
        return;
    }

    res.download(foundPath, (err) => {
        if (err && !res.headersSent) {
            console.error('Download error:', err);
            res.status(500).json({ message: 'File download failed' });
        }
    });
});

module.exports = router;

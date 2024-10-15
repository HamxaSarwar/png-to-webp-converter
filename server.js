const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/convert', upload.single('pngFile'), async (req, res) => {
    if (!req.file) {
        return res.json({ success: false, error: 'No file uploaded' });
    }

    const { width, height, quality, fit, strip } = req.body;
    const pngPath = req.file.path;
    const webpPath = path.join('public', 'converted', `${Date.now()}.webp`);

    try {
        let sharpInstance = sharp(pngPath);

        if (width && height) {
            sharpInstance = sharpInstance.resize({
                width: parseInt(width),
                height: parseInt(height),
                fit: fit || 'cover'
            });
        }

        if (strip === 'true') {
            sharpInstance = sharpInstance.removeAlpha();
        }

        await sharpInstance
            .webp({ quality: parseInt(quality) || 75 })
            .toFile(webpPath);

        // Get file sizes
        const pngSize = (await fs.stat(pngPath)).size;
        const webpSize = (await fs.stat(webpPath)).size;

        res.json({
            success: true,
            webpUrl: '/converted/' + path.basename(webpPath),
            pngSize: pngSize,
            webpSize: webpSize
        });
    } catch (error) {
        console.error('Conversion error:', error);
        res.json({ success: false, error: 'WebP conversion failed' });
    } finally {
        // Clean up the uploaded PNG file
        fs.unlink(pngPath).catch(err => console.error('Error deleting PNG file:', err));
    }
});

// Route to serve converted images
app.get('/converted/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'converted', req.params.filename);
    res.sendFile(filePath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
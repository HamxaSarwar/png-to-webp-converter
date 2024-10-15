const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

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

        res.json({ success: true, webpUrl: '/converted/' + path.basename(webpPath) });
    } catch (error) {
        console.error('Conversion error:', error);
        res.json({ success: false, error: 'WebP conversion failed' });
    } finally {
        fs.unlink(pngPath, () => {});
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
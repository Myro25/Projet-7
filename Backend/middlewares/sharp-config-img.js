const fs = require('fs');
const imageMagick = require('imagemagick');

// Configuration du middleware pour multer
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');

// Middleware de redimensionnement d'image
const resizeImage = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: 'Erreur de téléchargement de fichier' });
        } else if (err) {
            return res.status(500).json({ message: 'Erreur interne du serveur' });
        }

        // Vérifie si une image a été téléchargée
        if (!req.file) {
            return res.status(400).json({ message: 'Veuillez télécharger une image' });
        }

        // Redimensionne l'image avec ImageMagick
        const imagePath = req.file.path;
        const outputPath = `${imagePath}-resized`;
        const targetWidth = 800; // Modifier selon vos besoins

        imageMagick.resize({
            srcPath: imagePath,
            dstPath: outputPath,
            width: targetWidth
        }, function (err, stdout, stderr) {
            if (err) {
                console.error('Erreur lors du redimensionnement de l\'image :', err);
                return res.status(500).json({ message: 'Erreur lors du redimensionnement de l\'image' });
            }
            req.file.path = outputPath; // Met à jour le chemin de l'image avec le chemin redimensionné
            next();
        });
    });
};

module.exports = resizeImage;

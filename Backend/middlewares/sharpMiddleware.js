const sharp = require('sharp');

const resizeImage = (req, res, next) => {
    // Vérifie si une image a été téléchargée dans la requête
    if (!req.file) {
        return next(); // Passe au middleware suivant s'il n'y a pas d'image
    }

    // Redimensionne l'image téléchargée
    sharp(req.file.path)
        .resize(200, 200) // Redimensionne l'image à 200x200 pixels
        .toFile(`uploads/resized-${req.file.filename}`, (err, info) => {
            if (err) {
                return next(err); // Passe l'erreur au middleware d'erreur
            }
            // Stocke le chemin de l'image redimensionnée dans la requête
            req.resizedImagePath = `uploads/resized-${req.file.filename}`;
            next(); // Passe au middleware suivant
        });
};

module.exports = resizeImage;

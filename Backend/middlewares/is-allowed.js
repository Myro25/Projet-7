// is-allowed.js

const isAllowed = (req, res, next) => {
    // Exemple de logique de vérification d'autorisation :
    if (req.auth) { // Si l'utilisateur a un token valide (c'est-à-dire qu'il est authentifié)
        next(); // Passez à la prochaine middleware
    } else {
        return res.status(403).json({ message: "Accès non autorisé" }); // Renvoyer une erreur d'accès interdit
    }
};

module.exports = isAllowed;

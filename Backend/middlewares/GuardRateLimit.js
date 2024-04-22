const rateLimit = require("express-rate-limit");

// Définit un taux de limitation des requêtes
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // Fenêtre de temps de 5 minutes en millisecondes
    max: 3 // Nombre maximal de requêtes autorisées dans la fenêtre de temps
});

// Exporte le middleware de limitation des taux
module.exports = limiter;

let passwordValidator = require('password-validator');

// Crée un schéma de validation de mot de passe
let schema = new passwordValidator();

// Ajoute des propriétés au schéma
schema
    .is().min(8)                                    // Longueur minimale de 8 caractères
    .is().max(100)                                  // Longueur maximale de 100 caractères
    .has().uppercase()                              // Doit contenir des lettres majuscules
    .has().lowercase()                              // Doit contenir des lettres minuscules
    .has().digits(2)                                // Doit contenir au moins 2 chiffres
    .has().not().spaces()                           // Ne doit pas contenir d'espaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Liste noire de valeurs interdites

// Exporte un middleware de validation de mot de passe
module.exports = (req, res, next) => {
    if (schema.validate(req.body.password)) {
        next(); // Passe à la prochaine étape si le mot de passe est valide
    } else {
        // Renvoie une erreur si le mot de passe ne satisfait pas les critères de validation
        return res.status(404).json({ error: `Le mot de passe n'est pas assez fort ${schema.validate('req.body.password', { list: true })}` });
    }
}

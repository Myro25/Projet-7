const Book = require('../models/modelBook');

const isAvailableId = async (req, res, next) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });
        if (book) {
            // L'identifiant du livre existe déjà dans la base de données
            next();
        } else {
            // L'identifiant du livre n'existe pas dans la base de données
            return res.status(404).json({ message: 'Livre non trouvé' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = isAvailableId;

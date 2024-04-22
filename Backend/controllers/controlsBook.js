const Book = require('../models/modelBook'); // Importe le modèle de livre
const sharpMiddleware = require('../middlewares/sharpMiddleware'); // Importe ton middleware Sharp
// Utilise FileSystem pour gérer les fichiers
const fs = require('fs');

// Récupère tous les livres
exports.getAllBooks = async (req, res, next) => {
    try {
        const books = await Book.find(); // Recherche tous les livres dans la base de données
        return res.status(200).json(books); // Renvoie les livres trouvés en tant que réponse
    } catch (error) {
        return res.status(400).json(error); // Renvoie une erreur si la recherche échoue
    }
}

// Récupère un livre par son ID
exports.getBookById = async (req, res, next) => {
    try {
        const book = await Book.findOne({ _id: req.params.id }); // Recherche un livre par son ID dans la base de données
        return res.status(200).json(book); // Renvoie le livre trouvé en tant que réponse
    } catch (error) {
        return res.status(400).json(error); // Renvoie une erreur si la recherche échoue
    }
}

// Récupère les meilleurs livres (triés par note moyenne)
exports.getBestBooks = async (req, res, next) => {
    try {
        const bestBooks = await Book.find().sort({ averageRating: -1 }).limit(3); // Recherche les 3 meilleurs livres
        return res.status(200).json(bestBooks); // Renvoie les livres trouvés en tant que réponse
    } catch (error) {
        return res.status(404).json(error); // Renvoie une erreur si la recherche échoue
    }
}

// Crée un nouveau livre
exports.createNewBook = async (req, res, next) => {
    // Parse les données du livre reçu dans la requête
    const receivedBookObject = JSON.parse(req.body.book);
    const nextYear = new Date().getFullYear() + 1;

    // Vérifie la longueur des champs du livre
    if (receivedBookObject.title.length >= 100 || receivedBookObject.author.length >= 50 || receivedBookObject.genre.length >= 50) {
        return res.status(400).json({ message: "Texte trop long. Veuillez raccourcir" });
    }
    // Vérifie si l'année est valide
    if (receivedBookObject.year > nextYear) {
        return res.status(400).json({ message: "Veuillez renseigner une année à 4 chiffres" });
    }

    try {
        // Utilise ton middleware Sharp pour traiter l'image avant de l'enregistrer
        await sharpMiddleware(req, res, async () => {
            // Si tout va bien avec le middleware Sharp, tu peux continuer à traiter la création du livre
            const bookToCreate = new Book({
                ...receivedBookObject,
                userId: req.auth.userId, // Ajoute l'ID de l'utilisateur actuel comme propriétaire du livre
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // Définit l'URL de l'image du livre
            });
            await bookToCreate.save(); // Enregistre le livre dans la base de données
            return res.status(201).json({ message: 'Livre ajouté avec succès' }); // Renvoie un message de succès
        });
    } catch (error) {
        return res.status(400).json(error); // Renvoie une erreur si la création du livre échoue
    }
}

// Calcule la note moyenne d'un livre
const calcAverage = (book) => {
    const grades = book.ratings.map(ratings => ratings.grade); // Récupère les notes du livre
    const result = grades.reduce((accumulator, currentValue) => accumulator + currentValue) / grades.length; // Calcule la moyenne
    return result.toFixed(1); // Retourne la moyenne arrondie à 1 décimale
}

// Ajoute une nouvelle note à un livre
exports.addNewGrade = async (req, res, next) => {
    try {
        // Vérifie si la note est valide
        if (req.body.rating > 5 || req.body.rating < 0) {
            return res.status(400).json({ message: 'Note maximale dépassée' });
        }
        // Recherche le livre à noter
        const bookRateToUpdate = await Book.findOne({ _id: req.params.id, "ratings.userId": { $nin: req.auth.userId } });
        if (bookRateToUpdate) {
            // Ajoute la note au livre et met à jour la note moyenne
            bookRateToUpdate.ratings.push({ userId: req.auth.userId, grade: req.body.rating });
            bookRateToUpdate.averageRating = calcAverage(bookRateToUpdate);
            await bookRateToUpdate.save(); // Enregistre les modifications dans la base de données
            return res.status(201).json(bookRateToUpdate); // Renvoie le livre mis à jour
        } else {
            return res.status(403).json({ message: 'Vote impossible' }); // Renvoie une erreur si le vote est impossible
        }
    } catch (error) {
        return res.status(400).json(error); // Renvoie une erreur si l'ajout de la note échoue
    }
}

// Supprime une image de livre
const deleteBookImg = async (book) => {
    const fileNameToDelete = book.imageUrl.split('images/')[1]; // Récupère le nom du fichier image à supprimer
    await fs.unlink(`./images/${fileNameToDelete}`, (error) => {
        if (error) {
            console.log(error, fileNameToDelete); // Affiche une erreur si la suppression échoue
        }
    });
}

// Met à jour un livre
exports.updateBook = async (req, res, next) => {
    try {
        const nextYear = new Date().getFullYear() + 1;
        const bookToUpdate = await Book.findOne({ _id: req.params.id }); // Recherche le livre à mettre à jour
        let jsonBookForUpdate = req.body;
        if (req.file != undefined) {
            // Vérifie s'il y a une nouvelle image à associer au livre
            jsonBookForUpdate = JSON.parse(req.body.book);
            await deleteBookImg(bookToUpdate); // Supprime l'ancienne image du livre
            jsonBookForUpdate.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`; // Met à jour l'URL de l'image
        }
        // Vérifie la longueur des champs du livre
        if (jsonBookForUpdate.title.length >= 100 || jsonBookForUpdate.author.length >= 50 || jsonBookForUpdate.genre.length >= 50) {
            return res.status(400).json({ message: "Texte trop long. Veuillez raccourcir" })
        }
        // Vérifie si l'année est valide
        if (jsonBookForUpdate.year > nextYear) {
            return res.status(400).json({ message: "Veuillez renseigner une année à 4 chiffres" })
        }
        jsonBookForUpdate.userId = req.auth.userId; // Met à jour l'ID de l'utilisateur
        await Book.updateOne({ _id: req.params.id }, { ...jsonBookForUpdate, _id: req.params.id }); // Met à jour le livre dans la base de données
        return res.status(200).json({ message: 'Livre modifié avec succès' }); // Renvoie un message de succès
    } catch (error) {
        return res.status(400).json(error); // Renvoie une erreur si la mise à jour du livre échoue
    }
}

// Supprime un livre
exports.deleteBook = async (req, res, next) => {
    try {
        const bookToDelete = await Book.findOne({ _id: req.params.id }); // Recherche le livre à supprimer
        await deleteBookImg(bookToDelete); // Supprime l'image associée au livre
        await Book.deleteOne({ _id: req.params.id }); // Supprime le livre de la base de données
        return res.status(204).json({ message: 'Livre supprimé avec succès' }); // Renvoie un message de succès
    } catch (error) {
        return res.status(404).json(error); // Renvoie une erreur si la suppression du livre échoue
    }
}

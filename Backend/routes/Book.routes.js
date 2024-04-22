const express = require('express');

//importe les fichiers avec les fonctions pour les routes
const GuardMulter = require('../middlewares/GuardMulter');
const bookCtrls = require('../controllers/controlsBook');
const GuardAuth = require('../middlewares/GuardAuth');


const router = express.Router();

// ROUTES ici
router.get('/', bookCtrls.getAllBooks);
router.get('/bestrating', bookCtrls.getBestBooks);
router.get('/:id', bookCtrls.getBookById);
router.post('/', GuardAuth, GuardMulter, bookCtrls.createNewBook);
router.post('/:id/rating', GuardAuth, bookCtrls.addNewGrade);
router.put('/:id', GuardAuth, GuardMulter, bookCtrls.updateBook);
router.delete('/:id', GuardAuth, bookCtrls.deleteBook);

module.exports = router;
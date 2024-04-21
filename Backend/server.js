/* Import des modules nécessaires */
const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config({ encoding: "latin1" });

// Définition de l'option strictQuery à false
mongoose.set('strictQuery', false);

/* Connection BDD mongoose */
mongoose
    .connect(process.env.DBCONNECT, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    // Démarrage serveur
    .then(() =>
        app.listen(process.env.SERVER_PORT, () => {
            console.log(
                `This server is running on port ${process.env.SERVER_PORT}. Enjoy !`
            );
        })
    )
    // Arrêt du serveur si la connexion est impossible
    .catch(() => console.log("Server connection failed !"));

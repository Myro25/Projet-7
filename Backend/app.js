/* Import des modules necessaires */
const express = require("express");

const bookRoutes = require("./routes/Book.routes");
const userRoutes = require("./routes/user.routes");

const path = require("path");

// Import du middleware Sharp
const resizeImage = require("./middlewares/sharpMiddleware");

/* Initialisation de l'API */
const app = express();

app.use(express.urlencoded({ extended: true }))
app.use(express.json());

/* Mise en place reponses headers */
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, x-access-token, role, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
});

/* RateLimit */
const rateLimit = require("express-rate-limit");

app.use(
    rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 100,
        message:
            "Vous avez effectué plus de 100 requêtes dans une limite de 10 minutes!",
        headers: true,
    })
);

// Utilisation du middleware Sharp
app.use(resizeImage);

/* Mise en place du routage */

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/auth", userRoutes);
app.use("/api/books", bookRoutes);

module.exports = app;

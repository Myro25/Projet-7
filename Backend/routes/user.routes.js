/* Import des modules necessaires */
const express = require("express");
const router = express.Router();

const userCtrl = require("../controllers/user.controller");

const limiter = require("../middlewares/GuardRateLimit");

const GuardPasswordValidator = require("../middlewares/GuardPasswordValidator");

/* Routage User */
router.post("/signup", GuardPasswordValidator, userCtrl.signup);
router.post("/login", limiter, userCtrl.login);

module.exports = router;




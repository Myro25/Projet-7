const jsonWebToken = require('jsonwebtoken');

const addTokenAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jsonWebToken.verify(token, process.env.SECRET_KEY);
        const userId = decodedToken.userId;
        req.auth = { userId };
        next();
    } catch (error) {
        let errorMessage = "Authentication failed";
        if (error.name === "JsonWebTokenError") {
            errorMessage = "Invalid token";
        } else if (error.name === "TokenExpiredError") {
            errorMessage = "Token expired";
        }
        return res.status(401).json({ error: errorMessage });
    }
}

module.exports = addTokenAuth;

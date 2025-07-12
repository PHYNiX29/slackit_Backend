import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

export function authenticateToken(req, res, next) {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(accessToken, "yoursecretkeygoeshere" , (err, user) => {
        if (err) {
            // console.log(req.user);
            return res.status(403).json({ error: 'Token expired or invalid' });
        }
        // console.log(req.user);
        req.user = user;
        next();
    });
}
//prcess
export function generateJwtToken(payload) {
    return jwt.sign(payload, "yoursecretkeygoeshere", { expiresIn: '2h' });
}

export function generateRefreshToken(payload) {
    return jwt.sign(payload, "yoursecretkeygoeshere", { expiresIn: '3h' });
}

export function authenticateRefreshToken(req, res, next) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(refreshToken, "yoursecretkeygoeshere", (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token expired or invalid' });
        }
        req.user = user;
        next();
    });
}

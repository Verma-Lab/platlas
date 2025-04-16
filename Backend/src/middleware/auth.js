// backend/src/middleware/auth.js

import firestore from '../services/ai/db/firestore.js';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.userId) {
            return res.status(401).json({ error: 'Invalid token structure' });
        }

        const user = await firestore.getUser(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = {
            id: decoded.userId,
            ...user
        };
        next();
    } catch (error) {
        console.error('Auth error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        // Since tokens never expire now, this branch is less relevant:
        // if (error.name === 'TokenExpiredError') {
        //     return res.status(401).json({ error: 'Token expired' });
        // }
        res.status(500).json({ error: 'Authentication error' });
    }
};

export const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

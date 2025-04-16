// backend/src/routes/aiRoutes.js

import express from 'express';
import multer from 'multer';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import chatService from '../services/ai/chat/chatService.js';
import documentService from '../services/ai/storage/documents.js';
import firestore from '../services/ai/db/firestore.js';
import jwt from 'jsonwebtoken';


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


// Add this to aiRoutes.js
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        // Check if user already exists
        const existingUser = await firestore.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new user
        const user = await firestore.createUser({
            email,
            password, // Password will now be stored correctly
            name,
            role: 'admin' // For testing, make all users admin
        });

        // Generate token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await firestore.getUserByEmail(email);
      console.log('USER', user);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
// Chat routes
// In your aiRoutes.js
// backend/src/routes/aiRoutes.js
// router.post('/chat/message', authMiddleware, async (req, res) => {
//     try {
//         console.log('Received chat message request');
//         const { message, conversationId, model, database } = req.body;
        
//         if (!message) {
//             return res.status(400).json({ error: 'Message is required' });
//         }

//         console.log('Processing message for user:', req.user.id);
//         // const response = await chatService.processMessage(req.user.id, message);
//         const response = await chatService.processMessage(
//             req.user.id,
//             message,
//             conversationId,
//             model,      // New parameter
//             database    // New parameter
//         );
//         console.log('Message processed successfully');
        
//         return res.status(200).json({
//             message: response.message,
//             context: response.context,
//             conversationId: response.conversationId

//         });
//     } catch (error) {
//         console.error('Chat message error:', error);
//         res.status(500).json({ 
//             error: error.message,
//             details: process.env.NODE_ENV === 'development' ? error.stack : undefined
//         });
//     }
// });
router.post('/chat/message', authMiddleware, async (req, res) => {
    try {
        console.log('Received chat message request');
        const { message, conversationId, model, database } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Processing message for user:', req.user.id);
        const response = await chatService.processMessage(
            req.user.id,
            message,
            conversationId,
            model,
            database
        );
        console.log('Message processed successfully');
        
        // Send the entire response object
        return res.status(200).json(response);
    } catch (error) {
        console.error('Chat message error:', error);
        res.status(500).json({ 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
router.get('/chat/history', authMiddleware, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        console.log('calling chat service');
        const history = await chatService.getChatHistory(req.user.id, limit);
        console.log("HISTORY");
        console.log(history);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/documents/upload', 
    authMiddleware,
    upload.single('file'),
    async (req, res) => {
        try {
            const { database } = req.body;
            console.log('SOURCE', database, req)
            if (!database) {
                return res.status(400).json({ error: 'Source type is required' });
            }

            const document = await documentService.uploadDocument(
                req.file,
                req.user.id,
                { database }
            );

            res.status(200).json(document);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/documents', authMiddleware, async (req, res) => {  // Removed adminMiddleware for testing
    try {
        const documents = await firestore.getAllDocuments(req.user.id);
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/documents/:id', authMiddleware, async (req, res) => {  // Removed adminMiddleware for testing
    try {
        await documentService.deleteDocument(req.params.id, req.user.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User routes
router.get('/user/profile', authMiddleware, async (req, res) => {
    try {
        const user = await firestore.getUser(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



export default router;
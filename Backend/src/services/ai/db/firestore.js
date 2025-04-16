// backend/src/services/db/firestore.js

import { Firestore } from '@google-cloud/firestore';
import dotenv from 'dotenv';
dotenv.config();

class FirestoreService {
    constructor() {
        const credentials = {
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
            client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY
        };

        this.db = new Firestore({
            ...credentials,
            ignoreUndefinedProperties: true,
            preferRest: true
        });
    }

    // User Management
    async createUser(userData) {
        const userRef = this.db.collection('users').doc();
        const user = {
            email: userData.email,
            password: userData.password, // Password is now stored
            name: userData.name,
            role: userData.role || 'user', // 'admin' or 'user'
            usage: {
                messageCount: 0,
            },
            createdAt: Firestore.FieldValue.serverTimestamp()
        };
        await userRef.set(user);
        return { id: userRef.id, ...user };
    }

    async getUser(userId) {
        const doc = await this.db.collection('users').doc(userId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }

    async getUserByEmail(email) {
        const snapshot = await this.db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();
        return !snapshot.empty ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null;
    }

    // Chat Messages
    // FirestoreService.saveChatMessage
async saveChatMessage(messageData) {
    const messageRef = this.db.collection('chat_messages').doc();
    // Use the provided conversationId or default to "default"
    const conversationId = messageData.conversationId || "default";
    const message = {
        userId: messageData.userId,
        conversationId, // <-- new field
        content: messageData.content,
        role: messageData.role, // 'user' or 'assistant'
        context: messageData.context || null,
        model: messageData.model || 'default',      // Add model
        database: messageData.database || 'default', 
        createdAt: Firestore.FieldValue.serverTimestamp()
    };
    await messageRef.set(message);

    // Update user's message count
    await this.db.collection('users').doc(messageData.userId).update({
        'usage.messageCount': Firestore.FieldValue.increment(1)
    });

    return { id: messageRef.id, ...message };
}


    async getUserChatHistory(userId, limit = 50) {
        console.log('reteriving')
        const snapshot = await this.db.collection('chat_messages')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        console.log(snapshot)
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
        }));
    }

    // Document Management (Admin Only)
    async createDocument(documentData, adminId, collectionName = 'documents') {
        const admin = await this.getUser(adminId);

        // const docRef = this.db.collection('documents').doc();
        const userRef = this.db.collection(collectionName).doc();

        const document = {
            name: documentData.name,
            type: documentData.type,
            size: documentData.size,
            url: documentData.url,
            uploadedBy: adminId,
            status: 'active',
            vectorized: false,
            createdAt: Firestore.FieldValue.serverTimestamp()
        };

        await userRef.set(document);
        return { id: userRef.id, ...document };
    }

    async getAllDocuments(adminId) {
        const admin = await this.getUser(adminId);

        const snapshot = await this.db.collection('documents')
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
        }));
    }

    async deleteDocument(documentId, adminId) {
        await this.db.collection('documents').doc(documentId).update({
            status: 'deleted',
            deletedAt: Firestore.FieldValue.serverTimestamp()
        });
    }

    async testConnection() {
        try {
            const testRef = this.db.collection('test').doc('connection-test');
            await testRef.set({ timestamp: Firestore.FieldValue.serverTimestamp() });
            await testRef.delete();
            return true;
        } catch (error) {
            console.error('Firestore connection test failed:', error);
            return false;
        }
    }
}

export default new FirestoreService();

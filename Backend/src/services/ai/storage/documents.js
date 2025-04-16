// backend/src/services/storage/documents.js

import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import firestore from '../db/firestore.js';
import vectorStorage from './vectors.js';
import geminiService from '../AI/gemini.js';
import { createRequire } from 'module';
import Papa from 'papaparse';  // Add this import at the top

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

class DocumentService {
    constructor() {
        this.storage = new Storage({
            keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
        });
        this.bucketName = process.env.GOOGLE_CLOUD_BUCKET;
        this.bucket = this.storage.bucket(this.bucketName);
    }

    getCollectionName(database) {
        const prefix = database.toLowerCase();
        return {
            documents: `documents_${prefix}`,
            vectors: `document_vectors_${prefix}`
        };
    }
    async verifyAdmin(userId) {
        const user = await firestore.getUser(userId);
        if (!user || user.role !== 'admin') {
            throw new Error('Unauthorized: Admin access required');
        }
        return user;
    }

    async uploadDocument(file, adminId, metadata = {}) {
        try {
            console.log('Starting document upload with metadata:', JSON.stringify(metadata));
            const database = metadata.database ? metadata.database.toLowerCase() : 'default';
            console.log('Source type for document:', database);
            
            const collectionName = (database === 'platlas') ? 'document_platlas' : 'documents';
            console.log('Using collection:', collectionName);

            const fileName = `documents/${uuidv4()}-${file.originalname}`;
            console.log('Generated filename:', fileName);

            const blob = this.bucket.file(fileName);
            
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                    metadata: {
                        originalName: file.originalname,
                        uploadedBy: adminId || 'anonymous',
                        database, // Include sourceType in storage metadata
                        ...metadata
                    }
                }
            });

            return new Promise((resolve, reject) => {
                blobStream.on('error', (error) => {
                    console.error('Blob Stream Error:', error);
                    reject(error);
                });

                blobStream.on('finish', async () => {
                    try {
                        const [url] = await blob.getSignedUrl({
                            action: 'read',
                            expires: Date.now() + 3600000
                        });

                        // Include sourceType in document metadata
                        const document = await firestore.createDocument({
                            name: file.originalname,
                            type: file.mimetype,
                            size: file.size,
                            url,
                            fileName,
                            database, // Add sourceType here
                            metadata: {
                                ...metadata,
                                database // And here
                            }
                        }, adminId || 'anonymous', collectionName);

                        if (file.mimetype.includes('text') || 
    file.mimetype.includes('pdf') || 
    file.mimetype.includes('csv')) {
    await this.processDocumentVectors(document.id, file.buffer, file.mimetype, database);
    const updatedDoc = await firestore.db.collection(collectionName).doc(document.id).get();
    resolve({ status: 200, data: { id: updatedDoc.id, ...updatedDoc.data() } });
    return;
}

                        resolve({ status: 200, data: document });
                    } catch (error) {
                        console.error('Document processing error:', error);
                        reject(error);
                    }
                });

                blobStream.end(file.buffer);
            });

        } catch (error) {
            console.error('Document upload error:', error);
            throw new Error(`Failed to upload document: ${error.message}`);
        }
    }

    async processDocumentVectors(documentId, buffer, mimetype, database) {
        try {
            console.log('Processing document vectors with sourceType:', database);
            let text;
            if (mimetype === 'application/pdf') {
                console.log('Processing PDF document...');
                const pdfData = await pdfParse(buffer);
                text = pdfData.text;
                console.log('PDF text extraction successful');
                console.log('PDF text length:', text.length);
            } 
            else if (mimetype === 'text/csv' || mimetype === 'application/csv') {
                console.log('Processing CSV document...');
                const csvText = buffer.toString('utf-8');
                
                // Parse CSV with PapaParse
                const parsedCsv = Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true
                });
    
                // Convert CSV data to text format
                text = parsedCsv.data.map(row => {
                    return Object.entries(row)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                }).join('\n');
    
                console.log('CSV parsing successful');
                console.log('Processed CSV rows:', parsedCsv.data.length);
            }
            else if (mimetype.includes('text')) {
                text = buffer.toString('utf-8');
            }

            if (!text) {
                throw new Error('No text content could be extracted from document');
            }

            console.log('Starting embedding generation...');
            const embeddings = await geminiService.generateEmbeddings(text);
            console.log('Embeddings generated successfully');

            // Pass sourceType to vector storage
            console.log('Storing vectors with sourceType:', database);
            await vectorStorage.storeVectors([embeddings], { 
                documentId, 
                text,
                database // Make sure to pass sourceType here
            });

            const collectionName = (database === 'platlas') ? 'document_platlas' : 'documents';
            await firestore.db.collection(collectionName).doc(documentId).update({
                vectorized: true,
                vectorizedAt: new Date()
            });
            console.log('Document marked as vectorized');
        } catch (error) {
            console.error('Document vectorization error:', error);
            const collectionName = (database === 'platlas') ? 'document_platlas' : 'documents';
            await firestore.db.collection(collectionName).doc(documentId).update({
                vectorized: false,
                vectorError: error.message
            });
        }
    }

    async deleteDocument(documentId, adminId) {
        try {
            // Verify admin status
            // await this.verifyAdmin(adminId);

            // Get document info
            const doc = await firestore.db.collection('documents').doc(documentId).get();
            if (!doc.exists) {
                throw new Error('Document not found');
            }

            const { fileName } = doc.data();

            // Delete from Cloud Storage
            await this.bucket.file(fileName).delete();

            // Delete vectors
            await vectorStorage.deleteVectorsByDocument(documentId);

            // Mark document as deleted in Firestore
            await firestore.deleteDocument(documentId, adminId);

        } catch (error) {
            console.error('Document deletion error:', error);
            throw new Error(`Failed to delete document: ${error.message}`);
        }
    }

    async getSignedUrl(fileName, adminId) {
        try {
            // await this.verifyAdmin(adminId);

            const [url] = await this.bucket.file(fileName).getSignedUrl({
                action: 'read',
                expires: Date.now() + 3600000 // 1 hour
            });
            
            return url;
        } catch (error) {
            console.error('URL generation error:', error);
            throw new Error('Failed to generate signed URL');
        }
    }
}

export default new DocumentService();
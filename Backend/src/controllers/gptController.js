import RAGService from '../services/RagService.js';
import { ARGONNE_ACCESS_TOKEN } from '../config/constants.js';

// Initialize RAG service as a singleton
let ragService = null;

async function initializeRAGService() {
    if (!ragService) {
        const accessToken = ARGONNE_ACCESS_TOKEN;
        if (!accessToken) {
            throw new Error('ARGONNE_ACCESS_TOKEN environment variable is required');
        }
        
        ragService = new RAGService(accessToken);
        await ragService.initialize();
        console.log('RAG service initialized successfully');
    }
    return ragService;
}

export async function askGPT(req, res) {
    try {
        const { question } = req.query;
        
        if (!question) {
            return res.status(400).json({ 
                error: 'Question parameter is required' 
            });
        }

        // Get or initialize RAG service
        const rag = await initializeRAGService();
        
        // Query the RAG service
        const response = await rag.queryRAG(question);
        
        res.json({
            question: response.question,
            answer: response.answer,
            relevantDocuments: response.relevantDocuments
        });

    } catch (error) {
        console.error('Error in askGPT controller:', error);
        
        // Handle specific error types
        if (error.message.includes('ARGONNE_ACCESS_TOKEN')) {
            return res.status(500).json({
                error: 'Server configuration error: Missing access token'
            });
        }
        
        if (error.message.includes('Access token expired')) {
            return res.status(401).json({
                error: 'Access token expired. Please update the token.'
            });
        }

        res.status(500).json({ 
            error: 'An error occurred while processing your request'
        });
    }
}
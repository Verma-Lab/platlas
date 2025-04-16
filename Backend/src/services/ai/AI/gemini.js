// backend/src/services/ai/gemini.js

import { GoogleGenerativeAI } from '@google/generative-ai';
import { TextProcessor } from './TextProcessor.js';

class GeminiService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        this.embeddingModel = this.genAI.getGenerativeModel({ model: 'embedding-001' });
    }

    async generateResponse(prompt, context = [], options = {}) {
        console.log(prompt,context, options )
        try {
            const chat = this.model.startChat({
                generationConfig: {
                    maxOutputTokens: options.maxTokens || 1000,
                    temperature: options.temperature || 0.7,
                    topP: 0.8,
                    topK: 40
                }
            });

            const history = context.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));

            // Add history to chat
            for (const msg of history) {
                await chat.sendMessage(msg.parts[0].text);
            }

            // Send the current prompt
            const result = await chat.sendMessage(prompt);
            const responseText = result.response.text();

            return {
                content: responseText,
                tokens: result.response.tokens || 0,
                finishReason: result.response.finishReason
            };
        } catch (error) {
            console.error('Response generation error:', error);
            throw new Error(`Failed to generate response: ${error.message}`);
        }
    }

    async generateEmbeddings(text) {
        try {
            if (!text) {
                throw new Error('No text provided for embedding generation');
            }

            // Check text size
            const textBytes = new TextEncoder().encode(text).length;
            
            if (textBytes <= 8000) {
                const result = await this.embeddingModel.embedContent({
                    content: { parts: [{ text }] }
                });

                if (!result?.embedding?.values) {
                    throw new Error('Invalid embedding format received from model');
                }

                return result.embedding.values.map(val => Number(val));
            }
            
            // For large text, use chunked processing
            const { embedding } = await TextProcessor.processLargeText(text, this);
            return embedding;
            
        } catch (error) {
            console.error('Embedding generation error:', error);
            throw new Error(`Failed to generate embeddings: ${error.message}`);
        }
    }

    async generateSingleEmbedding(text) {
        const result = await this.embeddingModel.embedContent({
            content: { parts: [{ text }] }
        });

        if (!result?.embedding?.values) {
            throw new Error('Invalid embedding format received from model');
        }

        return result.embedding.values.map(val => Number(val));
    }

    getTimeAgo(createdAt) {
        const msgDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
        const now = new Date();
        const diffMs = now - msgDate;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    }
}

export default new GeminiService();
// backend/src/services/ai/TextProcessor.js

class TextProcessor {
    static async processLargeText(text, geminiService) {
        // Constants for text processing
        const MAX_CHUNK_SIZE = 7500; // Leave buffer for tokens
        const MIN_CHUNK_SIZE = 1000;
        const OVERLAP_SIZE = 200;

        // Preprocessing: Clean and normalize text
        const cleanedText = this.preprocessText(text);
        
        // Split into manageable chunks
        const chunks = this.createSmartChunks(cleanedText, MAX_CHUNK_SIZE, MIN_CHUNK_SIZE, OVERLAP_SIZE);
        console.log(`Split text into ${chunks.length} chunks`);

        // Generate embeddings for each chunk
        const chunkEmbeddings = await Promise.all(
            chunks.map(chunk => geminiService.generateSingleEmbedding(chunk))
        );

        // Combine embeddings with weighted average
        const combinedEmbedding = this.combineEmbeddings(chunkEmbeddings, chunks);

        return {
            embedding: combinedEmbedding,
            chunkCount: chunks.length
        };
    }

    static preprocessText(text) {
        return text
            .replace(/\s+/g, ' ')  // Normalize whitespace
            .replace(/[^\w\s.,?!-]/g, '') // Remove special characters
            .trim();
    }

    static createSmartChunks(text, maxSize, minSize, overlapSize) {
        const chunks = [];
        let startIndex = 0;

        while (startIndex < text.length) {
            // Calculate the potential end of this chunk
            let endIndex = startIndex + maxSize;
            
            if (endIndex >= text.length) {
                // If this is the last chunk
                chunks.push(text.slice(startIndex));
                break;
            }

            // Find the nearest sentence boundary
            const sentenceEnd = this.findNearestSentenceBoundary(
                text, 
                Math.max(endIndex - 100, startIndex + minSize), 
                Math.min(endIndex + 100, text.length)
            );

            // Add the chunk
            chunks.push(text.slice(startIndex, sentenceEnd));

            // Move the start index, accounting for overlap
            startIndex = Math.max(sentenceEnd - overlapSize, startIndex + minSize);
        }

        return chunks;
    }

    static findNearestSentenceBoundary(text, start, end) {
        const segment = text.slice(start, end);
        const sentences = segment.match(/[^.!?]+[.!?]+/g) || [segment];
        
        let boundaryIndex = start;
        let currentLength = 0;
        
        for (const sentence of sentences) {
            currentLength += sentence.length;
            if (currentLength >= (end - start) / 2) {
                boundaryIndex = start + currentLength;
                break;
            }
        }
        
        return boundaryIndex;
    }

    static combineEmbeddings(embeddings, chunks) {
        const dimension = embeddings[0].length;
        const weights = chunks.map(chunk => Math.sqrt(chunk.length)); // Square root of chunk length as weight
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

        // Initialize combined embedding
        const combined = new Array(dimension).fill(0);

        // Weighted sum of embeddings
        for (let i = 0; i < embeddings.length; i++) {
            const weight = weights[i] / totalWeight;
            for (let j = 0; j < dimension; j++) {
                combined[j] += embeddings[i][j] * weight;
            }
        }

        // Normalize the combined embedding
        const magnitude = Math.sqrt(combined.reduce((sum, val) => sum + val * val, 0));
        return combined.map(val => val / magnitude);
    }

    static truncateContext(context, maxTokens = 3000) {
        let totalLength = 0;
        const truncatedContext = [];
        const avgTokensPerChar = 1.3; // Approximate ratio

        // Start from most recent context
        for (const doc of context.reverse()) {
            const estimatedTokens = Math.ceil(doc.length * avgTokensPerChar);
            
            if (totalLength + estimatedTokens > maxTokens) {
                // If adding this would exceed limit, create a summary
                const summary = `[Content truncated: ${context.length - truncatedContext.length} more documents]`;
                truncatedContext.unshift(summary);
                break;
            }

            truncatedContext.unshift(doc);
            totalLength += estimatedTokens;
        }

        return truncatedContext;
    }


    static summarizeRelevantDocs(docs, maxTokens = 2000) {
        let totalTokens = 0;
        const summaries = [];
        const avgTokensPerChar = 1.3; // Approximate tokens per character

        for (const doc of docs) {
            const estimatedTokens = Math.ceil(doc.metadata.text.length * avgTokensPerChar);
            
            if (totalTokens + estimatedTokens > maxTokens) {
                // If we would exceed the token limit, stop adding documents
                break;
            }

            // Add a summarized version of the document
            summaries.push({
                text: doc.metadata.text,
                similarity: doc.similarity.toFixed(2),
                documentId: doc.metadata.documentId
            });
            
            totalTokens += estimatedTokens;
        }

        return summaries;
    }
}

export { TextProcessor };
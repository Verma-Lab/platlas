import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { MANIFEST_PATH } from '../config/constants.js';

// const MANIFEST_PATH = process.env.MANIFEST_PATH;
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

class RAGService {
    constructor(accessToken) {
        if (!accessToken) {
            throw new Error('Access token is required');
        }
        this.accessToken = accessToken;
        this.documents = [];
        this.embeddings = [];
    }

    async initialize() {
        try {
            // Load and parse the CSV data
            const csvContent = await fs.readFile(MANIFEST_PATH, 'utf-8');
            const parsedData = Papa.parse(csvContent, {
                header: true,
                skipEmptyLines: true
            });

            // Process each row into documents
            this.documents = parsedData.data.map(row => ({
                id: row.Trait,
                content: this.createDocumentContent(row),
                metadata: {
                    trait: row.Trait,
                    category: row.Category,
                    population: row.Population,
                    traitType: row['Trait type'],
                    nStudies: row.Studies
                }
            }));

            // Generate embeddings for all documents
            await this.generateEmbeddings();
            
            console.log('RAG service initialized successfully');
        } catch (error) {
            console.error('Error initializing RAG service:', error);
            throw error;
        }
    }

    createDocumentContent(row) {
        return `
            Trait ID: ${row.Trait}
            Description: ${row.Description}
            Category: ${row.Category}
            Population: ${row.Population}
            Trait Type: ${row['Trait type']}
            Number of Studies: ${row.Studies}
            Total Sample Size: ${row['N sumstats']}
            Cases: ${row['N Cases']}
            Controls: ${row['N Controls']}
        `.trim();
    }

    async generateEmbeddings() {
        try {
            const baseURL = 'https://data-portal-dev.cels.anl.gov/resource_server/sophia/infinity/v1';
            
            // Generate embeddings in batches
            for (let i = 0; i < this.documents.length; i += 10) {
                const batch = this.documents.slice(i, i + 10);
                
                // Format request similar to OpenAI's API structure
                const response = await fetch(`${baseURL}/embeddings`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'nvidia/NV-Embed-v2',
                        input: batch.map(doc => doc.content),
                        encoding_format: "float"
                    })
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(`Embedding generation failed: ${response.status} ${response.statusText}\n${errorData}`);
                }

                const embedResults = await response.json();
                
                // Check if the response matches the expected format
                if (!embedResults.data || !Array.isArray(embedResults.data)) {
                    throw new Error('Unexpected response format from embedding service');
                }
                
                this.embeddings.push(...embedResults.data.map(item => item.embedding));
            }
            
            console.log(`Successfully generated embeddings for ${this.documents.length} documents`);
        } catch (error) {
            console.error('Error generating embeddings:', error);
            throw error;
        }
    }

    async queryRAG(userQuestion) {
        try {
            // 1. Generate embedding for the question
            const questionEmbedding = await this.getQuestionEmbedding(userQuestion);
            
            // 2. Find most relevant documents
            const relevantDocs = await this.findRelevantDocuments(questionEmbedding);
            
            // 3. Generate context from relevant documents
            const context = this.generateContext(relevantDocs);
            
            // 4. Generate answer using Argonne's LLM endpoint
            const answer = await this.generateAnswer(userQuestion, context);
            
            return {
                question: userQuestion,
                answer: answer,
                relevantDocuments: relevantDocs.map(doc => doc.metadata)
            };
        } catch (error) {
            console.error('Error in RAG query:', error);
            throw error;
        }
    }

    async getQuestionEmbedding(question) {
        const baseURL = 'https://data-portal-dev.cels.anl.gov/resource_server/sophia/infinity/v1';
        
        const response = await fetch(`${baseURL}/embeddings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'nvidia/NV-Embed-v2',
                input: [question],
                encoding_format: "float"
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Question embedding failed: ${response.status} ${response.statusText}\n${errorData}`);
        }

        const result = await response.json();
        
        if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
            throw new Error('Unexpected response format from embedding service');
        }
        
        return result.data[0].embedding;
    }

    async findRelevantDocuments(questionEmbedding, topK = 3) {
        // Compute cosine similarity between question and all documents
        const similarities = this.embeddings.map((docEmbedding, index) => ({
            similarity: this.cosineSimilarity(questionEmbedding, docEmbedding),
            document: this.documents[index]
        }));

        // Sort by similarity and return top K documents
        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK)
            .map(item => item.document);
    }

    cosineSimilarity(embedding1, embedding2) {
        const dotProduct = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0);
        const norm1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0));
        const norm2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (norm1 * norm2);
    }

    generateContext(relevantDocs) {
        return relevantDocs
            .map(doc => doc.content)
            .join('\n\n');
    }

    async generateAnswer(question, context) {
        const llmEndpoint = 'https://data-portal-dev.cels.anl.gov/resource_server/sophia/vllm/v1/chat/completions';
        
        const response = await fetch(llmEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'meta-llama/Meta-Llama-3-70B-Instruct',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that answers questions about genetic phenotype data. Use the provided context to answer questions accurately.'
                    },
                    {
                        role: 'user',
                        content: `Context:\n${context}\n\nQuestion: ${question}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const result = await response.json();
        return result.choices[0].message.content;
    }
}

export default RAGService;


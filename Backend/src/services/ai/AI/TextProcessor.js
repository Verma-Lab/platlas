// textProcessor.js
export class TextProcessor {
    // 1) Adjust chunking (example: target ~500 "tokens" by words)
    static splitIntoChunksByWords(text, maxBytes = 7000) {
      const normalized = text.replace(/\s+/g, ' ').trim();
      const words = normalized.split(' ');
      const encoder = new TextEncoder();
    
      const chunks = [];
      let currentWords = [];
      let currentSize = 0;
    
      for (const word of words) {
        // Test adding this word
        const testChunk = currentWords.length
          ? currentWords.join(' ') + ' ' + word
          : word;
    
        const byteLen = encoder.encode(testChunk).length;
    
        if (byteLen > maxBytes && currentWords.length > 0) {
          // Current chunk is full, push it
          chunks.push(currentWords.join(' '));
          // Start new chunk with the current word
          currentWords = [word];
        } else if (byteLen > maxBytes) {
          // Single word bigger than maxBytes (rare, but can happen if extremely long word)
          // We'll just push that word alone, or handle some fallback
          chunks.push(word);
          currentWords = [];
        } else {
          // Accumulate
          currentWords = testChunk.split(' ');
        }
      }
    
      // Last chunk if leftover
      if (currentWords.length > 0) {
        chunks.push(currentWords.join(' '));
      }
    
      return chunks;
    }
    
  
    // 2) Weighted average approach
    static async processLargeText(text, geminiService) {
      try {
        const chunks = this.splitIntoChunksByWords(text);
        console.log(`Split text into ${chunks.length} chunks`);
        
        const embeddings = await Promise.all(chunks.map(async (chunk, index) => {
          try {
            const embedding = await geminiService.generateSingleEmbedding(chunk);
            return { embedding, chunk, index, success: true };
          } catch (error) {
            console.error(`Error generating embedding for chunk ${index}:`, error);
            return { embedding: null, chunk, index, success: false };
          }
        }));
        
        const successfulEmbeddings = embeddings.filter(e => e.success);
        if (successfulEmbeddings.length === 0) {
          throw new Error('Failed to generate any valid embeddings');
        }
        
        // Weighted average
        const embeddingLength = successfulEmbeddings[0].embedding.length;
        const averageEmbedding = new Array(embeddingLength).fill(0);
  
        // Compute byte sizes as weights
        let totalBytes = 0;
        const chunkByteSizes = successfulEmbeddings.map(({ chunk }) =>
          new TextEncoder().encode(chunk).length
        );
        totalBytes = chunkByteSizes.reduce((acc, val) => acc + val, 0);
  
        successfulEmbeddings.forEach(({ embedding }, idx) => {
          const size = chunkByteSizes[idx];
          embedding.forEach((value, i) => {
            averageEmbedding[i] += value * (size / totalBytes);
          });
        });
        
        return {
          embedding: averageEmbedding,
          chunks: successfulEmbeddings.map(e => ({
            text: e.chunk,
            index: e.index
          })),
          totalChunks: chunks.length,
          successfulChunks: successfulEmbeddings.length
        };
      } catch (error) {
        console.error('Error processing large text:', error);
        throw error;
      }
    }
  }
  
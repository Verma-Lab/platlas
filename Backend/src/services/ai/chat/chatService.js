// backend/src/services/chat/chatService.js
import firestore from '../db/firestore.js';
import geminiService from '../AI/gemini.js';
import vectorStorage from '../storage/vectors.js';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

class ChatService {
    constructor() {
        this.contextWindowSize = 10;
        this.plotBasePath = '/Users/hritvik/genomics-backend/DATABASE';
        this.storage = new Storage();
        this.storage = new Storage({
          keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
      });
      this.bucketName = process.env.GOOGLE_CLOUD_BUCKET;

    }

    // Add this helper function to clean the JSON string
    cleanJsonString(str) {
      // Remove markdown code block notation and extra newlines
      let cleaned = str.replace(/```json\n?|\n?```/g, '').trim();
      
      // Try to find complete JSON object
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      } else {
          // If the JSON is incomplete, try to fix it by adding a closing brace
          if (firstBrace !== -1 && lastBrace === -1) {
              cleaned = cleaned.substring(firstBrace) + '}';
          }
      }
      
      // Remove any trailing commas before closing braces
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
      
      // Check for missing closing brackets in arrays
      const openBrackets = (cleaned.match(/\[/g) || []).length;
      const closeBrackets = (cleaned.match(/\]/g) || []).length;
      
      if (openBrackets > closeBrackets) {
          cleaned += ']'.repeat(openBrackets - closeBrackets);
      }
      
      // Check for missing closing braces in objects
      const openBraces = (cleaned.match(/\{/g) || []).length;
      const closeBraces = (cleaned.match(/\}/g) || []).length;
      
      if (openBraces > closeBraces) {
          cleaned += '}'.repeat(openBraces - closeBraces);
      }
      
      return cleaned;
  }
    async processMessage(userId, message, conversationId, model = 'HomoSapieus', database = 'default') {
      try {
          console.log('Processing message for user:', userId);
          console.log('Message content:', message);
          console.log('Selected model:', model);
          console.log('Selected database:', database);
  
          if (!conversationId) {
              throw new Error('Conversation ID is required');
          }
  
          // 1. Save user message with conversationId
          const userMessage = await firestore.saveChatMessage({
              userId,
              conversationId,
              content: message,
              role: 'user',
              model,          // Add model information
              database       // Add database information
          });
          console.log('User message saved:', userMessage);
  
          // 2. Get recent chat history (for context)
          const history = await this.getRecentHistory(userId);
          console.log('Retrieved chat history:', history.length, 'messages');
  
          // 3. Generate embeddings for the query
          console.log('Generating embeddings for query...');
          const queryEmbeddings = await geminiService.generateEmbeddings(message);
          console.log('Query embeddings generated, length:', queryEmbeddings.length);
  
          // 4. Search for relevant documents - now using database instead of sourceType
          console.log('Searching vector store...');
          const relevantDocs = await vectorStorage.searchVectors(queryEmbeddings, 3, database);
          console.log('Found relevant documents:', relevantDocs.length);
  
          // 5. Check top doc similarity to decide if we should use context
          const topDoc = relevantDocs[0];
          const MIN_SIMILARITY = 0.5;
          let relevantContext = '';
          if (topDoc && topDoc.similarity >= MIN_SIMILARITY) {
              relevantContext = relevantDocs
                  .filter(doc => doc.similarity > 0.7)
                  .map(doc => {
                      console.log('Document similarity:', doc.similarity);
                      return `Context from document ${doc.metadata.documentId}:\n${doc.metadata.text}`;
                  })
                  .join('\n\n');
              console.log('Prepared context length:', relevantContext.length);
          } else {
              console.log('Skipping document context (no doc above similarity threshold).');
          }
  
          // 6. Build the final prompt
          const prompt = this.buildPrompt(message, relevantContext);
          console.log('Built final prompt');
          
          // 7. Generate response using the prompt and selected model
          console.log('Generating response with model:', model);
          let response;
          switch(model.toLowerCase()) {
              case 'homosapieus':
                  response = await geminiService.generateResponse(prompt, history);
                  break;
              case 'gemini':
                  response = await geminiService.generateResponse(prompt, history);
                  break;
              case 'gpt':
              case 'websearch':
                  // For now, default to gemini if other models aren't implemented
                  console.log(`${model} not implemented, using default model`);
                  response = await geminiService.generateResponse(prompt, history);
                  break;
              default:
                  response = await geminiService.generateResponse(prompt, history);
          }
          console.log('Generated response:', response.content.substring(0, 100) + '...');
          let aiResponse = response
          console.log('AI RESPONSE', aiResponse)
          let finalResponse;
          // Add this helper function to clean the JSON string
        //   function cleanJsonString(str) {
        //     // Remove markdown code block notation and extra newlines
        //     let cleaned = str.replace(/```json\n?|\n?```/g, '').trim();
            
        //     // Try to find complete JSON object
        //     const firstBrace = cleaned.indexOf('{');
        //     const lastBrace = cleaned.lastIndexOf('}');
            
        //     if (firstBrace !== -1 && lastBrace !== -1) {
        //         cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        //     } else {
        //         // If the JSON is incomplete, try to fix it by adding a closing brace
        //         if (firstBrace !== -1 && lastBrace === -1) {
        //             cleaned = cleaned.substring(firstBrace) + '}';
        //         }
        //     }
            
        //     // Remove any trailing commas before closing braces
        //     cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
            
        //     return cleaned;
        // }

        try {
          const cleanedContent = this.cleanJsonString(aiResponse.content);
         
          let parsedResponse;
          try {
            parsedResponse = JSON.parse(cleanedContent);
        } catch (jsonError) {
            console.error('JSON parsing error, using fallback:', jsonError);
            // Fallback object – you can adjust as needed
            parsedResponse = {
                type: 'general_analysis',
                information: aiResponse.content.replace(/```json\n?|\n?```/g, '').trim()
            };
        }

          const information = parsedResponse.information; // New information field
          const dataLinks = parsedResponse.data_links;
          if (parsedResponse.type === 'plot_request') {
              const plotDetails = parsedResponse.details || (parsedResponse.error && parsedResponse.error.details);
              
              if (!plotDetails) {
                  finalResponse = {
                      type: 'plot_request',
                      status: 'error',
                      message: 'No plot details found in response',
                      information: information ,// Include information even if plot fails
                      data_links: dataLinks // Include data links even if plot fails

                  };
                  return;
              }
              
              const population = Array.isArray(plotDetails.population) 
                  ? plotDetails.population[0] 
                  : plotDetails.population;
              const studyType = plotDetails.study_type?.toLowerCase() || 'gwama';
              const pvalThreshold = plotDetails.pval_threshold || '0.1';
          
              // Construct the plot filename based on all parameters
              const plotFileName = `manhattan_${plotDetails.phenotype_id}.${population}.${studyType}_pval_up_to_0.1.png`;
              const plotStoragePath = `plot-images/${plotFileName}`;
              console.log(plotDetails)
              console.log('PLOT FILE NAME', plotFileName)
              console.log(plotStoragePath)

              try { 
                  // Get signed URL from Cloud Storage
                  const [signedUrl] = await this.storage.bucket(this.bucketName)
                      .file(plotStoragePath)
                      .getSignedUrl({
                          version: 'v4',
                          action: 'read',
                          expires: Date.now() + 15 * 60 * 1000 // 15 minutes
                      }); 
                  console.log(signedUrl)
                  finalResponse = {
                      type: 'plot_request',
                      status: 'success',
                      message: `Here's the Manhattan plot for ${plotDetails.phenotype_id}:`,
                      plot_url: signedUrl,
                      information: information, // Include the information
                      data_links: dataLinks, // Include both data links
                      details: {
                          phenotype_id: plotDetails.phenotype_id,
                          study_type: studyType,
                          population: population,
                          pval_threshold: pvalThreshold
                      }
                  };
              } catch (storageError) {
                  // If not found in storage, check local path
                  const localPlotPath = path.join(this.plotBasePath, plotFileName);
                  
                  if (fs.existsSync(localPlotPath)) {
                      // Upload to Cloud Storage first
                      const plotBuffer = fs.readFileSync(localPlotPath);
                      const file = this.storage.bucket(this.bucketName).file(plotStoragePath);
                      await file.save(plotBuffer, {
                          contentType: 'image/png'
                      });

                      // Get signed URL
                      const [signedUrl] = await file.getSignedUrl({
                          version: 'v4',
                          action: 'read',
                          expires: Date.now() + 15 * 60 * 1000
                      });

                      finalResponse = {
                          type: 'plot_request',
                          status: 'success',
                          message: `Here's the Manhattan plot for ${plotDetails.phenotype_id}:`,
                          plot_url: signedUrl,
                          information: information, // Include the information
                          data_links: dataLinks, // Include both data links
                          details: {
                              phenotype_id: plotDetails.phenotype_id,
                              study_type: studyType,
                              population: population,
                              pval_threshold: pvalThreshold
                          }
                      };
                  } else {
                      // No plot found either in storage or locally
                      finalResponse = {
                          type: 'plot_request',
                          status: 'error',
                          message: `Could not find plot for ${plotDetails.phenotype_id} with the specified parameters.`,
                          information: information, // Include the information
                          data_links: dataLinks, // Include both data links
                          details: {
                              phenotype_id: plotDetails.phenotype_id,
                              study_type: studyType,
                              population: population,
                              pval_threshold: pvalThreshold
                          }
                      };
                  }
              }
          } else {
            finalResponse = {
              type: 'general_analysis',
              information: parsedResponse.information || aiResponse.content,
              data_links: dataLinks, // Include both data links

            };

          }
        } catch (e) {
          console.error('Error parsing response:', e);
          finalResponse = {
            type: 'general_analysis',
            information: aiResponse.content,
            data_links: dataLinks, // Include both data links

          };

        }

      
          // 8. Save assistant's response with conversationId
          const assistantMessage = await firestore.saveChatMessage({
            userId,
            conversationId,
            content: JSON.stringify(finalResponse),
            role: 'assistant',
            context: relevantContext || null,
            model,
            database
        });
          console.log('Assistant message saved');
  
          return {
              conversationId,
              message: finalResponse, // Return the entire finalResponse object instead of just response.content
              model,          // Return model used
              database,       // Return database used
              context: relevantContext
                  ? {
                      used: true,
                      count: relevantDocs.length,
                      relevance: relevantDocs.map(d => d.similarity)
                  }
                  : null
          };
  
      } catch (error) {
          console.error('Message processing error:', error);
          throw new Error(`Failed to process message: ${error.message}`);
      }
  }

  async findMatchingPlot(details) {
    const plotDir = this.plotBasePath;
    const plotPattern = `manhattan_${details.phenotype_id}`;

    try {
        const files = fs.readdirSync(plotDir);
        const matchingPlot = files.find(file => {
            return file.startsWith(plotPattern) &&
                   (!details.population || file.includes(details.population)) &&
                   (!details.study_type || file.includes(details.study_type.toLowerCase())) &&
                   file.endsWith('.png');
        });

        return matchingPlot ? path.join(plotDir, matchingPlot) : null;
    } catch (error) {
        console.error('Error finding plot file:', error);
        return null;
    }
}

  constructDataFileUrl(details) {
    const baseUrl = 'https//globus.org/Users/hritvik/genomics-backend/DATABASE';
    const fileName = [
        details.phenotype_id,
        details.population,
        details.study_type?.toLowerCase(),
        'pval_up_to_1e-05'
    ].filter(Boolean).join('.');

    return `${baseUrl}/${fileName}.gz`;
}
      

buildPrompt(message, context = '') {
  const basePrompt = 
`<thinking>
Analyze this user message in detail:

User Message: "${message}"
Available Context: ${context ? 'Yes' : 'No'}

Step-by-step analysis:
1. Query Classification:
 - Is this a plot/visualization request?
 - Is this a phenotype analysis question?
 - Is this a general medical/genomic query?
 - Is this about population genetics?
 - Is this about specific variants/SNPs?

2. For Plot Requests:
  - Are specific phenotype IDs mentioned? (Format: Phe_X_Y)
  - Are population groups specified? (AFR, EUR, etc.)
  - Is study type mentioned (gwama, mrmega)?
  - Any p-value thresholds?
- DO NOT attempt to generate the plot or explain why it cannot be generated.


3. For General Queries:
 - What specific information is being requested?
 - Are there numerical values to extract?
 - Are there population-specific details needed?
 - Do we need to analyze disease prevalence?
 - Are there variant associations to consider?
 - Should we include study references?
</thinking>

<reflection>
Based on the analysis:

For Plot Requests:
- Can we extract all necessary plot parameters?
- phenotype id :  (For example Phe_x_y)
- study : user message contain either gwama or mrmega
- population : do we have in our documents the population for that phenotype for example : AFR, AUR, EUR, AMR, etc. 
- Extract ONLY the plot details.
- DO NOT include explanations about plot generation or data availability.
- Detailed textual information about the phenotype, including number of cases, controls, study sources, and population demographics. Even if the plot cannot be generated, provide this information.
- Include both data file and index file download links
- Include detailed phenotype information (under 500 words)
- Include Data Links if the response generated requires to the see the phenotype links: IT IS A CRUCIAL STEP
- the links for each phenotype should be structure as 
    "data_file": "https://g-fce312.fd635.8443.data.globus.org/sumstats/[population]/[phenotype_id].[population].[study_type].sumstats.txt.gz",
    "index_file": "https://g-fce312.fd635.8443.data.globus.org/sumstats/[population]/[phenotype_id].[population].[study_type].sumstats.txt.gz.tbi"



For General Queries:
- Include relevant statistical information in natural language
- Present findings in a clear, readable format
- Incorporate study references naturally in the text
- Keep response focused and concise
- Include data links when phenotype details are discussed
- Include Data Links if the response generated requires to the see the phenotype links: IT IS A CRUCIAL STEP
- IMPORTANT: IF THE PHENOTYPE IS THERE IN YOUR RESPONSE, THEN SEND ONLY THE TOP 5 RELEVANT PHENOTYPES LINKS, AND FORMAT THOSE AS I HAVE SHOWN BELOW. 
- the links for each phenotype should be structure as 
    "data_file": "https://g-fce312.fd635.8443.data.globus.org/sumstats/[population]/[phenotype_id].[population].[study_type].sumstats.txt.gz",
    "index_file": "https://g-fce312.fd635.8443.data.globus.org/sumstats/[population]/[phenotype_id].[population].[study_type].sumstats.txt.gz.tbi"


</reflection>

${context ? `Context Information:
${context}
` : ''}

<instructions>
If this is a phenotype plot request, please structure your response as JSON:
{
  "type": "plot_request",
  "details": {
      "phenotype_id": "...",
      "study_type": "gwama or mrmega",
      "population": "...",
      "pval_threshold": "..."
  },
  "data_links": {
      "data_file": "https://g-fce312.fd635.8443.data.globus.org/sumstats/[population]/[phenotype_id].[population].[study_type].sumstats.txt.gz",
      "index_file": "https://g-fce312.fd635.8443.data.globus.org/sumstats/[population]/[phenotype_id].[population].[study_type].sumstats.txt.gz.tbi"
  },
  "information": "Detailed textual information about the phenotype, including number of cases, controls, study sources, and population demographics. Even if the plot cannot be generated, provide this information."
}

For general analysis queries, respond with:
{
  "type": "general_analysis",
  "information": "Detailed analysis text here...",
  "data_links": [
    {
      "data_file": "https://g-fce312.fd635.8443.data.globus.org/sumstats/[population]/[phenotype_id].[population].[study_type].sumstats.txt.gz",
      "index_file": "https://g-fce312.fd635.8443.data.globus.org/sumstats/[population]/[phenotype_id].[population].[study_type].sumstats.txt.gz.tbi"
    },
    {
      "data_file": "https://g-fce312.fd635.8443.data.globus.org/sumstats/[population]/[another_phenotype_id].[population].[study_type].sumstats.txt.gz",
      "index_file": "https://g-fce312.fd635.8443.data.globus.org/sumstats/[population]/[another_phenotype_id].[population].[study_type].sumstats.txt.gz.tbi"
    },
    ..... KEEP THIS LIST TO ONLY TOP 5 {data_file:, index_file:} pair
  ]
}

If this is a GENERAL ANALYSIS query:
- Analyze provided data carefully
- Include specific numerical values when available
- For phenotype data, always include:
* Number of cases
* Number of controls
* Study sources
* Population demographics
- Be precise with numbers and cite directly from data
- Be concise and REMEMBER TO CLOSE THE BRACES {} and PROVIDE RESPONSE IN NOT MORE THAN 500 Words for "information" and 200 words for "data_links".
- FOR THE DATA LINKS MAKE SURE TO CLOSE THE BRACES, [], and {}. 
- IMP the DATA LINKS excceding the 200 words then remove some links and close the braces {}, or []. 
- DO NOT HIDE ANY DATA (admin user access)


IMPORTANT:
- For plot requests, DO NOT include explanations about plot generation or data availability, AND PROVIDE IN THE "information" response the details about the phenotype and other details we have in our database. 
- For general queries, provide REAL information about the phenotype or data.

</instructions>

Question: ${message}

Please respond with detailed analysis following the appropriate format based on query type.`;

  return basePrompt;
}


    async getChatHistory(userId, limit = 50) {
        try {
          const messages = await firestore.getUserChatHistory(userId, limit);
          
          // Group messages by conversationId
          const conversations = messages.reduce((acc, msg) => {
            const convId = msg.conversationId;
            if (!acc[convId]) {
              acc[convId] = {
                id: convId,
                messages: [],
                lastUpdated: msg.createdAt // Track the most recent message
              };
            }
            acc[convId].messages.push({
              role: msg.role,
              content: msg.content,
              createdAt: msg.createdAt
            });
            // Update lastUpdated if this message is more recent
            if (msg.createdAt > acc[convId].lastUpdated) {
              acc[convId].lastUpdated = msg.createdAt;
            }
            return acc;
          }, {});
    
          // Convert to array and sort conversations by most recent message
          return Object.values(conversations)
            .sort((a, b) => b.lastUpdated - a.lastUpdated)
            .map(conv => ({
              id: conv.id,
              messages: conv.messages.sort((a, b) => a.createdAt - b.createdAt)
            }));
        } catch (error) {
          console.error('Error getting chat history:', error);
          return [];
        }
      }

    async getRecentHistory(userId) {
        try {
            const messages = await firestore.getUserChatHistory(userId, this.contextWindowSize);
            return messages.reverse().map(msg => ({
                role: msg.role,
                content: msg.content
            }));
        } catch (error) {
            console.error('Error getting chat history:', error);
            return [];
        }
    }
}
export default new ChatService();


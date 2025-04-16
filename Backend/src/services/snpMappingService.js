// src/services/snpMappingService.js
import { promises as fs } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import logger from '../utils/logger.js';
import { SNP_MAPPING } from '../config/constants.js';

const execAsync = promisify(exec);
const SNP_FILE_PATH = SNP_MAPPING
// 0|platlas-backend  | Found 0 rows for SNP 1:63667:C:T

class SNPMappingService {
    async searchSNPs(searchTerm) {
        try {
            // Verify files exist
            await fs.access(SNP_FILE_PATH);
            await fs.access(`${SNP_FILE_PATH}.tbi`);

            // Basic tabix query for chromosome 1
            const command = `tabix ${SNP_FILE_PATH} 1 | head -n 50`;
            const { stdout } = await execAsync(command);
            

            
            if (!stdout.trim()) {
                return { results: [] };
            }

            const lines = stdout.split('\n').filter(Boolean);
            
            // Map the results to the expected format
            const results = lines.map(line => {
                const fields = line.split('\t');
                // console.log("fields",fields)
                return {
                    type: 'snp',
                    rsId: fields[14],  // We'll fix the actual rsId
                    internalId: fields[2] || 'unknown',
                    chromosome: fields[0] || '1',
                    position: parseInt(fields[1]) || 0,
                    gene: fields[5],
                    consequence: fields[8] || 'unknown'
                };
            });
            // console.log(results)
            return { results };

        } catch (error) {
            logger.error('Error searching SNPs:', error);
            if (error.message.includes('No regions in query')) {
                return { results: [] };
            }
            return { results: [] };
        }
    }
}

export const snpMappingService = new SNPMappingService();
// File: src/services/gwasService.js
import { promises as fs } from 'fs';
import { join } from 'path';
import { gunzipSync } from 'zlib';
import { promisify } from 'util';
import { exec } from 'child_process';
const execAsync = promisify(exec);
import { GWAS_FILES_PATH, TOP_HITS_PATH, BASE_PREFIX, LEAD_MRMEGA_PATH, COMBINED_SNP_INFO } from '../config/constants.js';
import { error as _error, warn } from '../utils/logger.js';
import { loadPhenotypeMapping } from './phenotypeService.js';  // Change to named import
import { parse } from 'csv-parse/sync';
import { createReadStream } from 'fs';
import { createGunzip } from 'zlib';
import { createInterface } from 'readline';
import { spawn } from 'child_process';
import readline from 'readline';


const COLUMNS = {
  ID: 0,
  CHR: 1,
  POS: 2,
  REF: 3,
  ALT: 4,
  BETA: 5,
  SE: 6,
  P: 7,
  LOG10P: 8,
  SE_LDSC: 9,
  P_LDSC: 10,
  LOG10P_LDSC: 11,
  AAF: 12,
  AAF_CASE: 13,
  AAC: 14,
  AAC_CASE: 15,
  N: 16,
  N_CASE: 17,
  N_STUDY: 18,
  EFFECT: 19,
  P_HETERO: 20
};

function parseScientificNotation(value) {
    if (value === 'NA' || value === '' || value === null || value === undefined) return null;
  
    // Check if value is in scientific notation with a large negative exponent
    const match = String(value).match(/^(\d+\.?\d*)e-(\d+)$/i);
    if (match) {
      const exponent = parseInt(match[2]);
      if (exponent > 308) {
        // Return the original string for extremely small values to preserve precision
        return String(value).toLowerCase(); // Ensure consistent format (e.g., "5.55e-445")
      }
      return parseFloat(value); // Safe to parse as a number if within JS limits
    }
  
    // Handle non-scientific notation values
    return parseFloat(value);
  }

function parseNA(value, parser = parseFloat) {
  if (value === 'NA' || value === '') return null;
  return parser(value);
}

async function fetchTabixData(chrom, filePath) {
  return new Promise((resolve, reject) => {
    const tabixProcess = spawn('tabix', [filePath, chrom.toString()]);
    const rl = readline.createInterface({
      input: tabixProcess.stdout,
      crlfDelay: Infinity
    });

    const data = [];
    let errorOutput = '';

    // Collect stderr for debugging
    tabixProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`tabix stderr for chr ${chrom}: ${data}`);
    });

    // Handle process errors (e.g., tabix not found)
    tabixProcess.on('error', (error) => {
      reject(new Error(`Failed to spawn tabix: ${error.message}`));
    });

    // Handle process exit
    tabixProcess.on('exit', (code, signal) => {
      if (code === null) {
        console.error(`tabix for chr ${chrom} terminated with signal: ${signal}`);
        reject(new Error(`tabix process terminated unexpectedly with signal ${signal}. stderr: ${errorOutput || 'none'}`));
      } else if (code !== 0) {
        console.error(`tabix for chr ${chrom} exited with code ${code}`);
        reject(new Error(`tabix exited with code ${code}. stderr: ${errorOutput || 'none'}`));
      } else {
        resolve(data);
      }
    });

    rl.on('line', (line) => {
      const fields = line.split('\t');
      const pval = parseScientificNotation(fields[COLUMNS.P]);
      if (pval !== null) {
        data.push({
          id: fields[COLUMNS.ID].replace('#ID: ', ''),
          chr: parseInt(fields[COLUMNS.CHR]),
          pos: parseInt(fields[COLUMNS.POS]),
          ref: fields[COLUMNS.REF],
          alt: fields[COLUMNS.ALT],
          beta: parseFloat(fields[COLUMNS.BETA]),
          se: parseFloat(fields[COLUMNS.SE]),
          p: pval,
          p_string: fields[COLUMNS.P],
          log10p: parseFloat(fields[COLUMNS.LOG10P]),
          se_ldsc: parseNA(fields[COLUMNS.SE_LDSC]),
          p_ldsc: parseScientificNotation(fields[COLUMNS.P_LDSC]),
          log10p_ldsc: parseNA(fields[COLUMNS.LOG10P_LDSC]),
          aaf: parseNA(fields[COLUMNS.AAF]),
          aaf_case: parseNA(fields[COLUMNS.AAF_CASE]),
          aac: parseNA(fields[COLUMNS.AAC]),
          aac_case: parseNA(fields[COLUMNS.AAC_CASE]),
          n: parseNA(fields[COLUMNS.N], parseInt),
          n_case: parseNA(fields[COLUMNS.N_CASE], parseInt),
          n_study: parseInt(fields[COLUMNS.N_STUDY]),
          effect: fields[COLUMNS.EFFECT],
          p_hetero: parseNA(fields[COLUMNS.P_HETERO])
        });
      }
    });

    rl.on('error', (error) => {
      reject(new Error(`Readline error for chr ${chrom}: ${error.message}`));
    });
  });
}

// async function fetchTabixData(chrom, filePath) {
//   try {
//     const { stdout } = await execAsync(`tabix ${filePath} ${chrom}`);
//     return stdout.split('\n')
//       .filter(line => line.trim())
//       .map(line => {
//         const fields = line.split('\t');
//         const pval = parseScientificNotation(fields[COLUMNS.P]);
        
//         if (pval !== null) {
//           return {
//             id: fields[COLUMNS.ID].replace('#ID: ', ''),
//             chr: parseInt(fields[COLUMNS.CHR]),
//             pos: parseInt(fields[COLUMNS.POS]),
//             ref: fields[COLUMNS.REF],
//             alt: fields[COLUMNS.ALT],
//             beta: parseFloat(fields[COLUMNS.BETA]),
//             se: parseFloat(fields[COLUMNS.SE]),
//             p: pval,
//             log10p: parseFloat(fields[COLUMNS.LOG10P]),
//             se_ldsc: parseNA(fields[COLUMNS.SE_LDSC]),
//             p_ldsc: parseScientificNotation(fields[COLUMNS.P_LDSC]),
//             log10p_ldsc: parseNA(fields[COLUMNS.LOG10P_LDSC]),
//             aaf: parseNA(fields[COLUMNS.AAF]),
//             aaf_case: parseNA(fields[COLUMNS.AAF_CASE]),
//             aac: parseNA(fields[COLUMNS.AAC]),
//             aac_case: parseNA(fields[COLUMNS.AAC_CASE]),
//             n: parseNA(fields[COLUMNS.N], parseInt),
//             n_case: parseNA(fields[COLUMNS.N_CASE], parseInt),
//             n_study: parseInt(fields[COLUMNS.N_STUDY]),
//             effect: fields[COLUMNS.EFFECT],
//             p_hetero: parseNA(fields[COLUMNS.P_HETERO])
//           };
//         }
//         return null;
//       })
//       .filter(result => result !== null);
//   } catch (error) {
//     if (error.message.includes('No regions in query')) {
//       return [];
//     }
//     console.error(`Error in fetchTabixData for chromosome ${chrom}: ${error.message}`);
//     throw error;
//   }
// }

/**
 * Checks if a GWAS file exists for the given phenoId, cohort, and study.
 * @param {string} phenoId - Phenotype ID
 * @param {string} cohort - Cohort ID (e.g., EUR, ALL)
 * @param {string} study - Study type (gwama or mrmega)
 * @returns {boolean} - True if the file exists, false otherwise
 */
export async function findFiles(phenoId, cohort, study) {
    const filename = `${phenoId}.${cohort}.${study}_pval_up_to_1e-05.gz`;
    const filePath = join(GWAS_FILES_PATH, filename);
    
    info(`Checking file path: ${filePath}`);
    
    try {
        await fs.access(filePath);
        info(`✓ File found: ${filename}`);
        return { exists: true, filename, path: filePath };
    } catch (err) {
        info(`✗ File not found: ${filename}`);
        return { exists: false, filename: null, error: err.message };
    }
}

// File: src/services/gwasService.js


// export async function queryGWASData(phenoId, cohortId, study, minPval = null, maxPval = null) {
//     try {
//       if (!['gwama', 'mrmega'].includes(study.toLowerCase())) {
//         return { error: 'Invalid study type.', status: 500 };
//       }
  
//       const gz_file = `${phenoId}.${cohortId}.${study}_pval_up_to_1e-05.gz`;
//       const filePath = join(GWAS_FILES_PATH, gz_file);
  
//       await fs.access(filePath);
//       await fs.access(`${filePath}.tbi`);
  
//       const results = {};
      
//       // If no range is specified, set default to show very significant results (-log10(p) >= 100)
//       if (minPval === null || maxPval === null) {
//         console.log('No p-value range specified, using default threshold of -log10(p) >= 100');
        
//         // Set maxPval to 1e-100 (anything more significant than this will be included)
//         // minPval can be set to 0 (or a very small number) to capture all significant results
//         minPval = 0;         // Smallest possible p-value
//         maxPval = 1e-100;    // Threshold for -log10(p) = 100
        
//         console.log(`Setting initial view to p-value range: ${minPval} to ${maxPval}`);
//         console.log(`Corresponding to -log10(p) range: ∞ to 100`);
//       }
      
//       // Fetch data within the determined range
//       console.log(`Fetching data with p-value range: ${minPval} to ${maxPval}`);
      
//       const promises = [];
//       for (let chrom = 1; chrom <= 22; chrom++) {
//         promises.push(
//           fetchTabixData(chrom, filePath)
//             .then(chromData => {
//               // Filter based on the p-value range
//               const filteredData = chromData.filter(row => {
//                 const p = parseFloat(row.p);
//                 return p >= minPval && p <= maxPval;
//               });
  
//               if (filteredData.length > 0) {
//                 results[chrom] = filteredData;
//               }
//             })
//             .catch(error => {
//               console.error(`Error processing chromosome ${chrom}: ${error.message}`);
//               results[chrom] = [];
//             })
//         );
//       }
  
//       await Promise.all(promises);
  
//       // Count total data points
//       const totalRows = Object.values(results).reduce((acc, chromData) => acc + chromData.length, 0);
//       console.log(`Returning ${totalRows} data points for p-value range: ${minPval} to ${maxPval}`);
      
//       if (totalRows === 0) {
//         return { 
//           error: 'No data found in the specified p-value range', 
//           status: 404,
//           pValueRange: {
//             maxPValue: maxPval,
//             minPValue: minPval
//           }
//         };
//       }
  
//       // Always return the p-value range with the data
//       return {
//         data: results,
//         status: 200,
//         pValueRange: {
//           maxPValue: maxPval,
//           minPValue: minPval
//         }
//       };
//     } catch (error) {
//       console.error(`Error querying GWAS data: ${error.message}`);
//       return { error: error.message, status: 500 };
//     }
// }
// Helper function to compare p-values, including string representations
const comparePValues = (p1, p2, operator) => {
  // Handle null or invalid cases
  if (p1 === null || p2 === null) {
    if (operator === '===') return p1 === p2;
    return false;
  }

  // If both are strings (extremely small p-values)
  if (typeof p1 === 'string' && typeof p2 === 'string') {
    const exp1 = parseInt(p1.match(/e-(\d+)/i)?.[1] || 0);
    const exp2 = parseInt(p2.match(/e-(\d+)/i)?.[1] || 0);
    const mant1 = parseFloat(p1.match(/^(\d+\.?\d*)/)?.[1] || 1);
    const mant2 = parseFloat(p2.match(/^(\d+\.?\d*)/)?.[1] || 1);

    if (exp1 === exp2) {
      if (operator === '<') return mant1 < mant2;
      if (operator === '<=') return mant1 <= mant2;
      if (operator === '>') return mant1 > mant2;
      if (operator === '>=') return mant1 >= mant2;
      if (operator === '===') return mant1 === mant2;
    }
    // Higher exponent means smaller p-value
    if (operator === '<') return exp1 > exp2;
    if (operator === '<=') return exp1 >= exp2;
    if (operator === '>') return exp1 < exp2;
    if (operator === '>=') return exp1 <= exp2;
    if (operator === '===') return exp1 === exp2 && mant1 === mant2;
  }

  // If p1 is a string (extremely small) and p2 is a number
  if (typeof p1 === 'string') {
    if (operator === '<' || operator === '<=') return true; // String p-value is smaller
    if (operator === '>' || operator === '>=') return false;
    if (operator === '===') return false;
  }

  // If p2 is a string (extremely small) and p1 is a number
  if (typeof p2 === 'string') {
    if (operator === '<' || operator === '<=') return false; // Number is larger
    if (operator === '>' || operator === '>=') return true;
    if (operator === '===') return false;
  }

  // Both are numbers
  if (operator === '<') return p1 < p2;
  if (operator === '<=') return p1 <= p2;
  if (operator === '>') return p1 > p2;
  if (operator === '>=') return p1 >= p2;
  if (operator === '===') return p1 === p2;

  return false;
};


// export async function queryGWASData(phenoId, cohortId, study, minPval = null, maxPval = null) {
//     try {
//         if (!['gwama', 'mrmega'].includes(study.toLowerCase())) {
//             return { error: 'Invalid study type.', status: 500 };
//         }

//         const gz_file = `${phenoId}.${cohortId}.${study}_pval_up_to_1e-05.gz`;
//         const filePath = join(GWAS_FILES_PATH, gz_file);

//         await fs.access(filePath);
//         await fs.access(`${filePath}.tbi`);

//         const results = {};

//         // Step 1: Load all data first to find appropriate default values
//         const allChromData = {};
//         let globalMaxLog10p = 0;
        
//         // First pass: collect data and find maximum log10p
//         const dataPromises = [];
//         for (let chrom = 1; chrom <= 22; chrom++) {
//             dataPromises.push(
//                 fetchTabixData(chrom, filePath)
//                     .then(chromData => {
//                         if (chromData.length > 0) {
//                             allChromData[chrom] = chromData;
                            
//                             // Find max -log10p for this chromosome
//                             const maxLog10p = chromData.reduce((max, row) => 
//                                 Math.max(max, Number(row.log10p) || 0), 0);
                            
//                             globalMaxLog10p = Math.max(globalMaxLog10p, maxLog10p);
//                             console.log(`Chromosome ${chrom}: Max -log10(p) found = ${maxLog10p}`);
//                         }
//                     })
//                     .catch(error => {
//                         console.error(`Error processing chromosome ${chrom}: ${error.message}`);
//                         allChromData[chrom] = [];
//                     })
//             );
//         }
        
//         await Promise.all(dataPromises);
        
//         // Determine appropriate defaults based on the data
//         let effectiveMinPval;
//         if (minPval !== null) {
//             effectiveMinPval = minPval;
//         } else {
//             if (globalMaxLog10p >= 400) {
//                 effectiveMinPval = 400; // Use 100 for datasets with very significant values
//             }
//             else if (globalMaxLog10p >= 300) {
//                 effectiveMinPval = 300; // Use 100 for datasets with very significant values
//             }
//             // Adaptive default based on data
//             else if (globalMaxLog10p >= 200) {
//                 effectiveMinPval = 200; // Use 100 for datasets with very significant values
//             } 
//             else if (globalMaxLog10p >= 100) {
//                 effectiveMinPval = 100; // Use 100 for datasets with very significant values
//             }
//             else if (globalMaxLog10p >= 20) {
//                 effectiveMinPval = 20;  // Use 20 for moderately significant datasets
//             } else if (globalMaxLog10p >= 8) {
//                 effectiveMinPval = 8;   // Genome-wide significance threshold
//             } else {
//                 effectiveMinPval = 5;   // Minimum meaningful threshold
//             }
//         }
        
//         const effectiveMaxPval = maxPval !== null ? maxPval : Infinity;

//         console.log(`Fetching data with -log10(p) range: ${effectiveMinPval} to ${effectiveMaxPval}`);
        
//         // Second pass: filter data based on determined thresholds
//         for (let chrom = 1; chrom <= 22; chrom++) {
//             const chromData = allChromData[chrom] || [];
            
//             // Filter directly using log10p field
//             const filteredData = chromData.filter(row => {
//                 const log10p = Number(row.log10p) || 0;
//                 return log10p >= effectiveMinPval && 
//                        (effectiveMaxPval === Infinity || log10p <= effectiveMaxPval);
//             });

//             if (filteredData.length > 0) {
//                 console.log(`Chromosome ${chrom}: Found ${filteredData.length} rows with -log10(p) >= ${effectiveMinPval}`);
//                 results[chrom] = filteredData;
//             }
//         }

//         const totalRows = Object.values(results).reduce((acc, chromData) => acc + chromData.length, 0);
//         console.log(`Returning ${totalRows} data points with -log10(p) range: ${effectiveMinPval} to ${effectiveMaxPval}`);

//         if (totalRows === 0) {
//             return {
//                 error: 'No data found in the specified -log10(p) range',
//                 status: 404,
//                 pValueRange: {
//                     maxLog10P: effectiveMaxPval,
//                     minLog10P: effectiveMinPval
//                 }
//             };
//         }

//         return {
//             data: results,
//             status: 200,
//             pValueRange: {
//                 maxLog10P: effectiveMaxPval,
//                 minLog10P: effectiveMinPval
//             }
//         };
//     } catch (error) {
//         console.error(`Error querying GWAS data: ${error.message}`);
//         return { error: error.message, status: 500 };
//     }
// }
export async function queryGWASData(phenoId, cohortId, study, minPval = null, maxPval = null) {
    try {
        if (!['gwama', 'mrmega'].includes(study.toLowerCase())) {
            return { error: 'Invalid study type.', status: 500 };
        }

        const gz_file = `${phenoId}.${cohortId}.${study}_pval_up_to_1e-05.gz`;
        const filePath = join(GWAS_FILES_PATH, gz_file);

        await fs.access(filePath);
        await fs.access(`${filePath}.tbi`);

        const results = {};
        const allChromData = {};
        let globalMaxLog10p = 0;

        // First pass: collect data and find maximum log10p (already parallel)
        const dataPromises = [];
        for (let chrom = 1; chrom <= 22; chrom++) {
            dataPromises.push(
                fetchTabixData(chrom, filePath)
                    .then(chromData => {
                        if (chromData.length > 0) {
                            allChromData[chrom] = chromData;
                            const maxLog10p = chromData.reduce((max, row) => 
                                Math.max(max, Number(row.log10p) || 0), 0);
                            globalMaxLog10p = Math.max(globalMaxLog10p, maxLog10p);
                            console.log(`Chromosome ${chrom}: Max -log10(p) found = ${maxLog10p}`);
                        }
                    })
                    .catch(error => {
                        console.error(`Error processing chromosome ${chrom}: ${error.message}`);
                        allChromData[chrom] = [];
                    })
            );
        }
        
        await Promise.all(dataPromises);

        // Determine appropriate defaults based on the data
        let effectiveMinPval;
        if (minPval !== null) {
            effectiveMinPval = minPval;
        } else {
            if (globalMaxLog10p >= 400) {
                effectiveMinPval = 400;
            } else if (globalMaxLog10p >= 300) {
                effectiveMinPval = 300;
            } else if (globalMaxLog10p >= 200) {
                effectiveMinPval = 200;
            } else if (globalMaxLog10p >= 100) {
                effectiveMinPval = 100;
            } else if (globalMaxLog10p >= 20) {
                effectiveMinPval = 20;
            } else if (globalMaxLog10p >= 8) {
                effectiveMinPval = 8;
            } else {
                effectiveMinPval = 5;
            }
        }
        
        const effectiveMaxPval = maxPval !== null ? maxPval : Infinity;

        console.log(`Fetching data with -log10(p) range: ${effectiveMinPval} to ${effectiveMaxPval}`);

        // Second pass: filter data in parallel instead of sequentially
        const filterPromises = [];
        for (let chrom = 1; chrom <= 22; chrom++) {
            filterPromises.push(
                Promise.resolve().then(() => {
                    const chromData = allChromData[chrom] || [];
                    const filteredData = chromData.filter(row => {
                        const log10p = Number(row.log10p) || 0;
                        return log10p >= effectiveMinPval && 
                               (effectiveMaxPval === Infinity || log10p <= effectiveMaxPval);
                    });

                    if (filteredData.length > 0) {
                        console.log(`Chromosome ${chrom}: Found ${filteredData.length} rows with -log10(p) >= ${effectiveMinPval}`);
                        results[chrom] = filteredData;
                    }
                })
            );
        }

        await Promise.all(filterPromises);

        const totalRows = Object.values(results).reduce((acc, chromData) => acc + chromData.length, 0);
        console.log(`Returning ${totalRows} data points with -log10(p) range: ${effectiveMinPval} to ${effectiveMaxPval}`);

        if (totalRows === 0) {
            return {
                error: 'No data found in the specified -log10(p) range',
                status: 404,
                pValueRange: {
                    maxLog10P: effectiveMaxPval,
                    minLog10P: effectiveMinPval
                }
            };
        }

        return {
            data: results,
            status: 200,
            pValueRange: {
                maxLog10P: effectiveMaxPval,
                minLog10P: effectiveMinPval
            }
        };
    } catch (error) {
        console.error(`Error querying GWAS data: ${error.message}`);
        return { error: error.message, status: 500 };
    }
}
function checkPvalThreshold(pval, threshold) {
    switch (threshold) {
        case '1e-06_to_0.0001':
            return true;
        case '0.0001':
            return pval <= 0.0001;
        case '0.1':
            return true;
        default:
            return pval <= parseFloat(threshold);
    }
}


// export async function getGWASStats() {
//     try {
//         const mapping = await loadPhenotypeMapping();
        
//         // Calculate stats
//         const stats = {
//             uniquePhenotypes: Object.keys(mapping).length,
//             totalSnps: Math.max(...Object.values(mapping).map(p => p.nSnp || 0)),
//             totalPopulation: Math.max(...Object.values(mapping).map(p => p.nCases || 0))
//         };
        
//         // Debug log the first few entries and final stats
//         console.log('Sample entries:', 
//             Object.entries(mapping)
//                 .slice(0, 3)
//                 .map(([k, v]) => `${k}: SNPs=${v.nSnp}, Cases=${v.nCases}`)
//         );
//         console.log('Final stats:', stats);
        
//         return stats;
//     } catch (error) {
//         console.error('Error getting GWAS stats:', error);
//         throw error;
//     }
// }
export async function getGWASStats() {
    try {
        // const COMBINED_SNP_INFO = '/Users/hritvik/Downloads/combined_SNPs.csv';
        const mapping = await loadPhenotypeMapping();
        // console.log("MAPPING", mapping)
        // Read and parse the combined SNP info file
        const snpFileContent = await fs.readFile(COMBINED_SNP_INFO, 'utf-8');
        const snpRecords = parse(snpFileContent, {
            columns: ['phenotype', 'cohort', 'analysis_type', 'snp_number'],
            skip_empty_lines: true,
            trim: true
        });

        const totalMappedSnps = Object.values(mapping).reduce((sum, phenotype) => {
            return sum + (phenotype.nSnp || 0);
        }, 0);
        
        // Calculate stats from combined SNP info
        const stats = {
            uniquePhenotypes: new Set(snpRecords.map(record => record.phenotype)).size,
            snpStats: {
                gwama: totalMappedSnps,
                mrmega: snpRecords
                    .filter(record => record.analysis_type === 'mrmega')
                    .reduce((sum, record) => sum + parseInt(record.snp_number), 0)
            },
            totalPopulation: Math.max(...Object.values(mapping).map(p => p.nAll || 0))
        };
        
        console.log('GWAS Stats:', {
            'Unique Phenotypes': stats.uniquePhenotypes,
            'GWAMA Total SNPs': totalMappedSnps,
            'MR-MEGA Total SNPs': stats.snpStats.mrmega,
            'Total Population': stats.totalPopulation
        });
        
        return stats;
    } catch (error) {
        console.error('Error getting GWAS stats:', error);
        throw error;
    }
}

export async function getSearchableGWASMetadata() {
    try {
        const mapping = await loadPhenotypeMapping();
        const searchableData = [];
        
        for (const [phenotype, data] of Object.entries(mapping)) {
            if (!data.populations) {
                console.warn(`No populations found for phenotype ${phenotype}`);
                continue;
            }
            
            for (const population of data.populations) {
                searchableData.push({
                    phenotype,
                    traitDescription: data.traitDescription,
                    category: data.category,
                    population: population.trim(),
                    nAll: data.nAll,
                    nCases: data.nCases,
                    nSnp: data.nSnp
                });
            }
        }
        
        return searchableData;
    } catch (error) {
        console.error('Error getting searchable GWAS metadata:', error);
        throw error;
    }
}


export async function getLeadVariants() {
    try {
        const content = await fs.readFile(LEAD_MRMEGA_PATH, 'utf-8');
        
        // Parse CSV with proper handling of quoted fields
        const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });
        
        return records.map(record => ({
            trait: {
                name: record.Trait || '',
                description: record.Description || '',
                type: record['Trait Type'] || ''  // Added trait type
            },
            category: record.Category || '',
            cohort: record.Population || '',
            lead_snp: {
                count: parseInt(record.LEAD_SNP) || 0,
                rsid: record.rsID || '-',
                position: {
                    chromosome: record.Chromosome || '',
                    position: parseInt(record.Position) || 0,
                    from: parseInt(record.From) || 0,    // Added from position
                    to: parseInt(record.To) || 0         // Added to position
                },
                reference: record.Reference || '',       // Added reference allele
                alternate: record.Alternate || '',       // Added alternate allele
                log10p: parseFloat(record.Log10P) || 0
            },
            n_total: parseInt(record.N.replace(/[",]/g, '')),
            n_study: parseInt(record['N Study']) || 0,
            pop_manifest: record.pop_manifest || '',     // Added population manifest
            pop_gwas_page: record.pop_gwas_page || '',  // Added population GWAS page
            studies: record.studies || '',              // Added studies
            analysis: record.analysis || ''             // Added analysis
        }));

    } catch (error) {
        _error(`Error getting lead variants: ${error.message}`);
        throw error;
    }
}

// export async function queryGWASData(cohort, pheno) {
//     try {
//         const gz_file = `${BASE_PREFIX}AGR.${pheno}.${cohort}.GIA_pval_up_to_0.0001.gz`;
        
//         const filePath = join(GWAS_FILES_PATH, gz_file);

//         // Check if file exists
//         try {
//             await fs.access(filePath);
//         } catch {
//             throw new Error('GWAS data files not found');
//         }

//         const results = {};
//         for (let chrom = 1; chrom <= 22; chrom++) {
//             const chromData = await fetchTabixData(chrom, '0.0001', filePath);
//             if (chromData.length > 0) {
//                 results[chrom] = chromData;
//             }
//         }

//         return results;
//     } catch (error) {
//         _error(`Error querying GWAS data: ${error.message}`);
//         throw error;
//     }
// }

// export async function getTopResults(cohort, pheno) {
//     try {
//         const pval_threshold = '0.0001';
//         const topHitsFilename = `${BASE_PREFIX}AGR.${pheno}.${cohort}.GIA_pval_up_to_${pval_threshold}.gz_top_hits_top_hits.txt`;
        
//         // Try primary path first
//         let filePath = join(TOP_HITS_PATH, topHitsFilename);
//         try {
//             await fs.access(filePath);
//         } catch {
//             // Try fallback path
//             filePath = join(GWAS_FILES_PATH, topHitsFilename);
//             try {
//                 await fs.access(filePath);
//             } catch {
//                 throw new Error('Top hits file not found');
//             }
//         }

//         const content = await fs.readFile(filePath, 'utf-8');
//         const lines = content.split('\n');
//         if (lines.length === 0) {
//             throw new Error('Top hits file is empty');
//         }

//         const header = lines[0].split('\t');
//         const results = [];

//         for (const line of lines.slice(1)) {
//             if (line.trim()) {
//                 const fields = line.split('\t');
//                 try {
//                     results.push({
//                         SNP_ID: fields[header.indexOf('SNP_ID')],
//                         chrom: fields[header.indexOf('chrom')],
//                         pos: parseInt(fields[header.indexOf('pos')]),
//                         ref: fields[header.indexOf('ref')],
//                         alt: fields[header.indexOf('alt')],
//                         ea: fields[header.indexOf('ea')],
//                         af: fields[header.indexOf('af')] !== 'NA' ? 
//                             parseFloat(fields[header.indexOf('af')]) : null,
//                         pval: fields[header.indexOf('pval')] !== 'NA' ? 
//                             parseFloat(fields[header.indexOf('pval')]) : null,
//                         or: fields[header.indexOf('or')] !== 'NA' ? 
//                             parseFloat(fields[header.indexOf('or')]) : null,
//                         ci: fields[header.indexOf('ci')]
//                     });
//                 } catch (e) {
//                     warn(`Error processing row: ${e.message}`);
//                 }
//             }
//         }

//         return results;
//     } catch (error) {
//         _error(`Error getting top results: ${error.message}`);
//         throw error;
//     }
// }


// export async function getGWASMetadata() {
//     try {
//         const phenoMapping = await loadPhenotypeMapping();
//         const files = await fs.readdir(GWAS_FILES_PATH);
//         const pattern = /Phe_([^.]+)\.([^.]+)\.gwama_pval_up_to_0\.1/;
//         const metadata = [];

//         for (const filename of files) {
//             if (filename.endsWith('gwama_pval_up_to_0.1.gz')) {
//                 const match = filename.match(pattern);
//                 if (match) {
//                     const [_, pheno_id, cohort_id] = match;
//                     const filePath = join(GWAS_FILES_PATH, filename);
//                     const fileContent = await fs.readFile(filePath);
//                     const unzipped = gunzipSync(fileContent).toString();
//                     const lines = unzipped.split('\n');
                    
//                     // Get header and first data line for sample size
//                     const header = lines[0].split('\t');
//                     const uniqueSnps = new Set();
//                     let numSamples = null;

//                     // Process each line after header
//                     for (const line of lines.slice(1)) {
//                         if (line.trim()) {
//                             const fields = line.split('\t');
//                             uniqueSnps.add(fields[0]);  // ID is first column
//                             if (numSamples === null && fields[16]) {  // N is at index 16
//                                 numSamples = parseInt(fields[16]);
//                             }
//                         }
//                     }

//                     metadata.push({
//                         phenotype_id: pheno_id,
//                         phenotype_name: phenoMapping[pheno_id] || '',
//                         cohort: cohort_id,
//                         num_snps: uniqueSnps.size,
//                         num_samples: numSamples
//                     });
//                 }
//             }
//         }
//         console.log('META')
//         console.log(metadata)
//         return metadata;
//     } catch (error) {
//         error(`Error getting GWAS metadata: ${error.message}`);
//         throw error;
//     }
// }

// File: src/services/gwasService.js

export async function getTopResults(cohortId, phenoId, study) {
    try {
        const gz_file = `${phenoId}.${cohortId}.${study}_pval_up_to_1e-05.gz`;
        const filePath = join(GWAS_FILES_PATH, gz_file);
        
        // Check if file exists first
        try {
            await fs.access(filePath);
        } catch (error) {
            return { error: `Top results file not found: ${gz_file}`, status: 500 };
        }

        const results = [];
        
        // Wrap file reading in try-catch
        try {
            const fileStream = createReadStream(filePath);
            const gunzip = createGunzip();
            
            const rl = createInterface({
                input: fileStream.pipe(gunzip),
                crlfDelay: Infinity
            });

            let isFirstLine = true;
            let headers = [];

            for await (const line of rl) {
                if (isFirstLine) {
                    headers = line.trim().split(/\s+/);
                    isFirstLine = false;
                    continue;
                }

                if (line.trim()) {
                    const fields = line.trim().split(/\s+/);
                    try {
                        const row = {};
                        headers.forEach((header, index) => {
                            const value = fields[index];
                            if (value === 'NA') {
                                row[header] = null;
                            } else if (['POS', 'N_STUDY', 'N_CASE'].includes(header)) {
                                row[header] = parseInt(value);
                            } else if (['BETA', 'SE', 'P', 'LOG10P', 'AAF', 'AAF_CASE'].includes(header)) {
                                row[header] = parseFloat(value);
                            } else {
                                row[header] = value;
                            }
                        });
                        results.push(row);
                    } catch (e) {
                        console.warn(`Error processing row: ${e.message}`);
                    }
                }
            }

            // Handle case where we successfully read the file but found no data
            if (results.length === 0) {
                return { error: 'No data found in file', status: 500 };
            }
            // console.log('SENDING TOP RESULTS')
            // console.log(results)
            return { data: results, status: 200 };

        } catch (error) {
            return { error: `Error reading file: ${error.message}`, status: 500 };
        }
    } catch (error) {
        console.error(`Error getting top results: ${error.message}`);
        return { error: error.message, status: 500 };
    }
}
// export async function getTopResults(cohortId, phenoId, study) {
//     try {

//         const gz_file = `${phenoId}.${cohortId}.${study}_pval_up_to_1e-05.gz`;
//         const filePath = join(GWAS_FILES_PATH, gz_file);
        
//         const results = [];
//         const fileStream = createReadStream(filePath);
//         const gunzip = createGunzip();
//         const rl = createInterface({
//             input: fileStream.pipe(gunzip),
//             crlfDelay: Infinity
//         });

//         let isFirstLine = true;
//         let headers = [];

//         for await (const line of rl) {
//             if (isFirstLine) {
//                 headers = line.trim().split(/\s+/);
//                 isFirstLine = false;
//                 continue;
//             }

//             if (line.trim()) {
//                 const fields = line.trim().split(/\s+/);
//                 try {
//                     const row = {};
//                     headers.forEach((header, index) => {
//                         const value = fields[index];
//                         if (value === 'NA') {
//                             row[header] = null;
//                         } else if (['POS', 'N_STUDY', 'N_CASE'].includes(header)) {
//                             row[header] = parseInt(value);
//                         } else if (['BETA', 'SE', 'P', 'LOG10P', 'AAF', 'AAF_CASE'].includes(header)) {
//                             row[header] = parseFloat(value);
//                         } else {
//                             row[header] = value;
//                         }
//                     });
//                     results.push(row);
//                 } catch (e) {
//                     console.warn(`Error processing row: ${e.message}`);
//                 }
//             }
//         }
//         // console.log(results)
//         return results;
//     } catch (error) {
//         console.error(`Error getting top results: ${error.message}`);
//         throw error;
//     }
// }


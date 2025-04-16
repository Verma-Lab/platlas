import tabixPkg from '@gmod/tabix';
const { TabixIndexedFile } = tabixPkg;

import genericFilehandlePkg from 'generic-filehandle';
const { RemoteFile } = genericFilehandlePkg;

import { TABIX_BASE_PATH } from '../config/constants.js';
import { error as _error } from '../utils/logger.js';

// Define column indices based on the exact file structure
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
  if (value === 'NA') return null;
  return Number(value);
}


export async function createTabixStream(phenoId, cohort) {
    try {
      const filename = `${phenoId}.${cohort}.gwama_pval_up_to_0.1.gz`;
      const fileUrl = `https://g-fce312.fd635.8443.data.globus.org/tabix/${filename}`;
      const indexUrl = `${fileUrl}.tbi`;
      
      console.log('Accessing file:', fileUrl);
      console.log('Accessing index:', indexUrl);
  
      // Configure RemoteFile with server-specific headers
      const fetchOptions = {
        overrides: {
          headers: {
            'Range': 'bytes=0-',
            'Accept': 'application/x-gzip',
            'Accept-Encoding': 'gzip, deflate, br'
          },
          mode: 'cors'
        }
      };
  
      // Create file handles with proper configuration
      const fileHandle = new RemoteFile(fileUrl, fetchOptions);
      const indexHandle = new RemoteFile(indexUrl, fetchOptions);
  
      // Test file accessibility with retry logic
      console.log('Testing file accessibility...');
      
      async function testFileAccess(handle, name) {
        let retries = 3;
        while (retries > 0) {
          try {
            const stats = await handle.stat();
            console.log(`${name} stats:`, stats);
            return true;
          } catch (err) {
            console.warn(`Attempt ${4-retries} failed for ${name}:`, err);
            retries--;
            if (retries === 0) throw err;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        return false;
      }
  
      await Promise.all([
        testFileAccess(fileHandle, 'Data file'),
        testFileAccess(indexHandle, 'Index file')
      ]);
  
      // Create TabixIndexedFile with optimized options
      const tabixFile = new TabixIndexedFile({
        filehandle: fileHandle,
        tbiFilehandle: indexHandle,
        chunkSizeLimit: 1000000,
        blockSize: 65536, // Optimize for large files
      });
  
      // Verify the tabix file is readable
      const header = await tabixFile.getHeader();
      console.log('Tabix header loaded successfully');
  
      return tabixFile;
    } catch (err) {
      console.error('Detailed error:', err);
      throw new Error(`Failed to create tabix stream: ${err.message}`);
    }
  }
  
  export async function streamTabixData(phenoId, cohort) {
    try {
      const tabixFile = await createTabixStream(phenoId, cohort);
      const results = {};
      let totalVariants = 0;
  
      for (let chrom = 1; chrom <= 22; chrom++) {
        try {
          console.log(`Processing chromosome ${chrom}`);
          const iterator = await tabixFile.getLines(chrom.toString());
          const chromData = [];
          
          for await (const line of iterator) {
            try {
              const fields = line.split('\t');
              
              if (fields.length < Object.keys(COLUMNS).length) {
                console.warn(`Skipping line with insufficient fields: ${line.substring(0, 100)}...`);
                continue;
              }
  
              // Parse fields according to their expected format
              const dataPoint = {
                id: fields[COLUMNS.ID].replace('#ID: ', ''),  // Remove prefix if present
                chr: parseInt(fields[COLUMNS.CHR]),
                pos: parseInt(fields[COLUMNS.POS]),
                ref: fields[COLUMNS.REF],
                alt: fields[COLUMNS.ALT],
                beta: parseFloat(fields[COLUMNS.BETA]),
                se: parseFloat(fields[COLUMNS.SE]),
                p: parseScientificNotation(fields[COLUMNS.P]),
                log10p: parseFloat(fields[COLUMNS.LOG10P]),
                se_ldsc: parseFloat(fields[COLUMNS.SE_LDSC]),
                p_ldsc: parseScientificNotation(fields[COLUMNS.P_LDSC]),
                log10p_ldsc: parseFloat(fields[COLUMNS.LOG10P_LDSC]),
                aaf: parseNA(fields[COLUMNS.AAF]),
                aaf_case: parseNA(fields[COLUMNS.AAF_CASE]),
                aac: parseNA(fields[COLUMNS.AAC]),
                aac_case: parseNA(fields[COLUMNS.AAC_CASE]),
                n: parseNA(fields[COLUMNS.N], parseInt),
                n_case: parseNA(fields[COLUMNS.N_CASE], parseInt),
                n_study: parseInt(fields[COLUMNS.N_STUDY]),
                effect: fields[COLUMNS.EFFECT],
                p_hetero: parseFloat(fields[COLUMNS.P_HETERO])
              };
  
              // Validate essential numeric fields
              const essentialFields = ['chr', 'pos', 'beta', 'se', 'p'];
              const isValid = essentialFields.every(field => 
                field in dataPoint && 
                dataPoint[field] !== null && 
                !Number.isNaN(dataPoint[field])
              );
  
              if (isValid) {
                chromData.push(dataPoint);
              } else {
                console.warn(`Invalid data point found:`, dataPoint);
              }
            } catch (parseErr) {
              console.warn(`Error parsing line: ${parseErr.message}`);
              continue;
            }
          }
  
          if (chromData.length > 0) {
            results[chrom] = chromData;
            totalVariants += chromData.length;
            console.log(`Found ${chromData.length} variants for chromosome ${chrom}`);
          }
        } catch (err) {
          console.warn(`Error processing chromosome ${chrom}: ${err.message}`);
          continue;
        }
      }
  
      console.log(`Total variants processed: ${totalVariants}`);
  
      if (Object.keys(results).length === 0) {
        throw new Error('No GWAS data found');
      }
  
      return results;
    } catch (err) {
      _error(`Error streaming tabix data: ${err}`);
      throw new Error(`Failed to stream tabix data: ${err.message}`);
    }
  }
// File: src/controllers/gwasController.js
import { 
    queryGWASData as queryGWASDataService,
    getTopResults as getTopResultsService ,
    getLeadVariants as getLeadVariantsService, 
    getSearchableGWASMetadata, 
    getGWASStats
 } from '../services/gwasService.js';
 import { streamTabixData } from '../services/tabixService.js';
 import { error as _error } from '../utils/logger.js';
 
 export async function getGWASMetadata(req, res) {
    try {
        const metadata = await getSearchableGWASMetadata();
        res.json(metadata);
    } catch (error) {
        _error(`Error in getGWASMetadata controller: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
 }
 export async function getGWASStatsRoute(req, res) {
    try {
        const metadata = await getGWASStats();
        console.log('STATS')
        console.log(metadata)
        res.json(metadata);
    } catch (error) {
        _error(`Error in getGWASMetadata controller: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
 } 
 export async function findFiles(req, res) {
    const { phenoId, cohort, study } = req.query;
    if (!phenoId || !cohort || !study) {
        return res.status(400).json({ error: 'phenoId, cohort, and study are required parameters.' });
    }
    try {
        const result = await serviceFindFiles(phenoId, cohort, study);
        res.json(result);
    } catch (error) {
        _error(`Error in findFiles controller: ${error.message}`);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function queryGWASData(req, res) {
    const { phenoId, cohortId, study, minPval, maxPval } = req.query;
    
    if (!phenoId || !cohortId || !study) {
      return res.status(400).json({ 
        error: 'phenoId, cohortId, and study are required parameters' 
      });
    }
  
    try {
      console.log(`Received GWAS data request for ${phenoId}, ${cohortId}, ${study}`);
      console.log(`P-value range parameters: min=${minPval || 'not specified'}, max=${maxPval || 'not specified'}`);
      
      // Parse p-value range (or pass null for auto-detection)
    //   const minPvalParsed = minPval ? parseFloat(minPval) : null;
    //   const maxPvalParsed = maxPval ? parseFloat(maxPval) : null;
      
      // Call the service function
      const result = await queryGWASDataService(
        phenoId, 
        cohortId, 
        study, 
        minPval,  
        maxPval  
      );
      
      // Handle error cases
      if (result.error) {
        console.error(`GWAS data error: ${result.error}`);
        return res.status(result.status).json({ 
          error: result.error,
          pValueRange: result.pValueRange // Include range even in error cases
        });
      }
  
      // Count total data points for logging
      const totalPoints = Object.values(result.data)
        .reduce((sum, chromData) => sum + chromData.length, 0);
      
      console.log(`Returning ${totalPoints} data points in p-value range: ${result.pValueRange.minPValue} to ${result.pValueRange.maxPValue}`);
      
      // Stream the response to handle large datasets
      res.setHeader('Content-Type', 'application/json');
      
      // Start the JSON response
      res.write('{');
      
      // Always include the p-value range
      res.write(`"pValueRange":${JSON.stringify(result.pValueRange)},`);
      
      // Write the data object
      res.write('"data":{');
      
      // Stream each chromosome's data
      let isFirstChrom = true;
      for (const [chrom, chromData] of Object.entries(result.data)) {
        if (chromData.length > 0) {
          if (!isFirstChrom) res.write(',');
          res.write(`"${chrom}":${JSON.stringify(chromData)}`);
          isFirstChrom = false;
        }
      }
      
      // Close the response objects
      res.write('}}');
      res.end();
      
    } catch (error) {
      console.error(`Error in queryGWASData controller: ${error.message}`);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  }

export async function getTopResults(req, res) {
    const { phenoId, cohortId, study } = req.query;
    if (!phenoId || !cohortId || !study) {
        return res.status(400).json({ 
            error: 'phenoId, cohortId, and study are required parameters.' 
        });
    }

    try {
        const result = await getTopResultsService(cohortId, phenoId, study);
        
        if (result.error) {
            console.error('Top Results Error:', result.error);
            return res.status(result.status).json({ error: result.error });
        }

        res.json(result.data);
    } catch (error) {
        console.error(`Error in getTopResults controller: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
}

 export async function getLeadVariants(req, res) {
    try {
        const results = await getLeadVariantsService();
        // console.log(results)
        res.json(results);
    } catch (error) {
        _error(`Error in getLeadVariants controller: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
}
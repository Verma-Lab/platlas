// File: src/routes/index.js
import { Router } from 'express';
const router = Router();
import { getRelatedPhenotypes } from '../controllers/phenotypeController.js';
import { getGWASMetadata, queryGWASData, getTopResults, findFiles, getGWASStatsRoute } from '../controllers/gwasController.js'; // Import findFiles
import { getPhewasData } from '../controllers/phewasController.js';
import { getLeadVariants } from '../controllers/gwasController.js';
import { askGPT } from '../controllers/gptController.js';
import { loadPhenotypeMapping, getPhenotypeStats } from '../services/phenotypeService.js';
import { GWAS_FILES_PATH } from '../config/constants.js';
import { join } from 'path';
import fs from 'fs/promises';
import debug from 'debug';
import logger from '../utils/logger.js';
import { searchSNPs } from '../controllers/snpMappingController.js';
import path from 'path';
import { getSNPAnnotation } from '../services/phenotypeService.js';
const error = debug('app:error');
const info = debug('app:info');
// Phenotype routes
router.get('/getRelatedPhenotypes', getRelatedPhenotypes);

// GWAS routes
router.get('/getGWASMetadata', getGWASMetadata);
router.get('/queryGWASData', queryGWASData);
router.get('/getTopResults', getTopResults);
router.get('/getLeadVariants', getLeadVariants);
router.get('/getGWASStatsRoute', getGWASStatsRoute);
router.get('/searchSNPs', searchSNPs);
router.get('/getManhattanPlot', async (req, res) => {
    const { phenoId, cohortId, study, plotType } = req.query;
    
    try {
        logger.info(`Attempting to fetch Manhattan plot for phenoId: ${phenoId}, cohortId: ${cohortId}, study: ${study}, plotType: ${plotType}`);
        
        if (!phenoId || !cohortId || !study || !plotType) {
            return res.status(400).json({
                error: 'Missing required parameters',
                details: 'phenoId, cohortId, study, and plotType are required'
            });
        }

        // Construct the file name
        const fileName = `${plotType}_${phenoId}.${cohortId}.${study}_pval_up_to_0.1.png`;
        const filePath = path.join('/nfs/platlas_stor/mh_plots', fileName);
        // const filePath = path.join('/Users/hritvik/all-by-all-browser/LPCFiltering/testing_data', fileName);

        
        logger.info(`Looking for Manhattan plot at path: ${filePath}`);

        try {
            // Check if file exists
            await fs.access(filePath);
        } catch (error) {
            logger.error(`File not found at path: ${filePath}`);
            return res.status(404).json({ 
                error: 'Manhattan plot not found',
                details: `File not found: ${fileName}`
            });
        }
        
        // Read the file if it exists
        const fileData = await fs.readFile(filePath);
        
        // Set appropriate headers
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        
        logger.info(`Successfully sending Manhattan plot for ${fileName}`);
        res.send(fileData);
        
    } catch (error) {
        logger.error('Error in getManhattanPlot:', error);
        res.status(500).json({ 
            error: 'Failed to fetch Manhattan plot',
            details: error.message 
        });
    }
});
router.get('/getQQPlot', async (req, res) => {
    const { phenoId, cohortId, study } = req.query;
    
    try {
        logger.info(`Attempting to fetch QQ plot for phenoId: ${phenoId}, cohortId: ${cohortId}, study: ${study}`);
        
        if (!phenoId || !cohortId || !study) {
            return res.status(400).json({
                error: 'Missing required parameters',
                details: 'phenoId, cohortId, and study are required'
            });
        }

        // Construct the file name with the new format
        const fileName = `${phenoId}.${cohortId}.${study}.sumstats.txt.png`;
        const filePath = path.join('/nfs/platlas_stor/qq_plots', fileName);
        
        logger.info(`Looking for QQ plot at path: ${filePath}`);

        try {
            // Check if file exists
            await fs.access(filePath);
        } catch (error) {
            logger.error(`File not found at path: ${filePath}`);
            
            // Try alternative path for different name format if needed
            const altFileName = `${phenoId}.${cohortId}.${study}_pval_up_to_0.1.png`;
            const altFilePath = path.join('/nfs/platlas_stor/tabix', altFileName);
            
            try {
                await fs.access(altFilePath);
                // If alternative file exists, use it
                const fileData = await fs.readFile(altFilePath);
                res.setHeader('Content-Type', 'image/png');
                res.setHeader('Cache-Control', 'public, max-age=3600');
                return res.send(fileData);
            } catch (altError) {
                // If neither file exists, return 404
                return res.status(404).json({ 
                    error: 'QQ plot not found',
                    details: `Files not found: ${fileName} or ${altFileName}`
                });
            }
        }
        
        // Read the file if it exists
        const fileData = await fs.readFile(filePath);
        
        // Set appropriate headers
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        
        logger.info(`Successfully sending QQ plot for ${fileName}`);
        res.send(fileData);
        
    } catch (error) {
        logger.error('Error in getQQPlot:', error);
        res.status(500).json({ 
            error: 'Failed to fetch QQ plot',
            details: error.message 
        });
    }
});

      
// In your Express routes file
router.get('/getPhenotypeStats/:phenoId', async (req, res) => {
    try {
      const { phenoId } = req.params;
      const stats = await getPhenotypeStats(phenoId);
      res.json(stats);
    } catch (err) {
      console.error('Error in getPhenotypeStats endpoint:', err);
      res.status(500).json({ error: err.message });
    }
  });
// PheWAS routes
router.get('/phewas', getPhewasData);

router.get('/askgpt', askGPT);
// router.post('/init-database', initDatabase);

router.get('/getPhenotypeMapping', async (req, res) => {
    try {
        const mapping = await loadPhenotypeMapping();
        res.json(mapping);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function checkFileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}
router.get('/findfiles', async (req, res) => {
    const { phenoId } = req.query;
    
    info(`Checking files for phenotype: ${phenoId}`);
    
    if (!phenoId) {
        return res.status(400).json({ 
            error: 'phenoId is required'
        });
    }
    
    try {
        // Check MR-MEGA availability
        const mrmegaFilename = `${phenoId}.ALL.mrmega_pval_up_to_1e-05.gz`;
        const mrmegaPath = join(GWAS_FILES_PATH, mrmegaFilename);
        const mrmegaAvailable = await checkFileExists(mrmegaPath);
        console.log('MEGA FILES EXIST')
        console.log(mrmegaAvailable)
        // Check GWAMA cohorts
        const possibleCohorts = ['EUR', 'AFR', 'EAS', 'AMR', 'SAS'];
        const gwamaResults = await Promise.all(
            possibleCohorts.map(async cohort => {
                const filename = `${phenoId}.${cohort}.gwama_pval_up_to_1e-05.gz`;
                const filePath = join(GWAS_FILES_PATH, filename);
                const exists = await checkFileExists(filePath);
                return { cohort, exists };
            })
        );
        
        const gwamaCohorts = gwamaResults
            .filter(result => result.exists)
            .map(result => result.cohort);
            
        const gwamaAvailable = gwamaCohorts.length > 0;
        
        return res.json({
            gwamaAvailable,
            mrmegaAvailable,
            gwamaCohorts
        });
        
    } catch (err) {
        error(`Error checking files: ${err.message}`);
        return res.status(500).json({ 
            error: 'Error checking file availability',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});
router.get('/getSNPAnnotation', async (req, res) => {
    console.log('Received request for /api/getSNPAnnotation:', req.query);
    try {
        const { chromosome, position } = req.query;
        if (!chromosome || !position) {
            console.log('Missing chromosome or position');
            return res.status(400).json({ error: 'Chromosome and position are required' });
        }
        console.log('Calling getSNPAnnotation with:', { chromosome, position });
        const annotation = await getSNPAnnotation(chromosome, position);
        console.log('Annotation result:', annotation);
        res.json(annotation || { error: 'SNP not found' });
    } catch (error) {
        console.error('Error in getSNPAnnotation route:', error);
        res.status(500).json({ error: error.message });
    }
});
export default router;

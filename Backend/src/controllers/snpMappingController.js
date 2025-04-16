// src/controllers/snpMappingController.js
import { snpMappingService } from '../services/snpMappingService.js';
import logger from '../utils/logger.js';

export const searchSNPs = async (req, res) => {
    const { term } = req.query;
    
    if (!term) {
        return res.status(400).json({
            error: 'Search term is required'
        });
    }

    try {
        const { results, error, hasMore } = await snpMappingService.searchSNPs(term);
        
        if (error) {
            return res.status(400).json({ error });
        }

        res.json({
            results,
            hasMore,
            count: results.length
        });
    } catch (error) {
        logger.error('Error in searchSNPs:', error);
        res.status(500).json({
            error: 'Failed to search SNPs',
            details: error.message
        });
    }
};
// File: src/controllers/phenotypeController.js
import { getRelatedPhenotypes as getRelatedPhenotypesService } from '../services/phenotypeService.js';
import { error as _error } from '../utils/logger.js';

export async function getRelatedPhenotypes(req, res) {
    try {
        const currentPheno = req.query.phenoId;
        const phenotypes = await getRelatedPhenotypesService(currentPheno);
        res.json(phenotypes);
    } catch (error) {
        _error(`Error in getRelatedPhenotypes controller: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
}
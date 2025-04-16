// File: src/controllers/phewasController.js
import { getPhewasData as getPhewasDataService } from '../services/phewasService.js';
import { error as _error } from '../utils/logger.js';

// File: src/controllers/phewasController.js
export async function getPhewasData(req, res) {
    try {
        const { snp, chromosome, position, study } = req.query;
        
        if (!snp || !chromosome || !position || !study) {
            return res.status(400).json({
                error: 'Missing required parameters: snp, chromosome, position, and study are required'
            });
        }

        const data = await getPhewasDataService(snp, chromosome, position, study);
        
        // Check if data exists and has plot_data
        if (!data || !data.plot_data) {
            return res.status(404).json({
                error: 'No PheWAS data found for the given parameters'
            });
        }

        res.json(data);
    } catch (error) {
        _error('Error in getPhewasData:', error);
        res.status(500).json({
            error: 'Error fetching PheWAS data',
            details: error.message
        });
    }
}
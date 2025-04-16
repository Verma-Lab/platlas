import { Router } from 'express';
const router = Router();
import { getRelatedPhenotypes } from '../controllers/phenotypeController.js';
import { loadPhenotypeMapping } from '../services/phenotypeService.js';
import { getSNPAnnotation } from '../services/phenotypeService.js';
router.get('/getRelatedPhenotypes', getRelatedPhenotypes);

router.get('/getPhenotypeMapping', async (req, res) => {
    try {
        const mapping = await loadPhenotypeMapping();
        res.json(mapping);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Add to your routes file (the one that contains router.get('/getPhenotypeMapping', ...))

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
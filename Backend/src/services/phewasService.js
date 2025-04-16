import sqlite3 from 'better-sqlite3';
import { GWAMA_DB, MRMEGA_DB } from '../config/constants.js';
import { error as _error } from '../utils/logger.js';

export async function getPhewasData(snp, chromosome, position, study) {
    let db = null;
    try {
        const dbPath = study === 'mrmega' 
            ? MRMEGA_DB
            : GWAMA_DB;
        console.log('Using database:', dbPath);
        
        db = new sqlite3(dbPath);
        
        // Use the correct table name based on study
        const tableName = study === 'mrmega' ? 'phewas_snp_data_mrmega' : 'phewas_snp_data';
        
        // First try with just SNP_ID
        const query = `
            SELECT * FROM ${tableName}
            WHERE SNP_ID = ?
        `;
        
        const rows = db.prepare(query).all(snp);
        console.log(`Found ${rows.length} rows for SNP ${snp}`);

        if (rows.length === 0) {
            return {
                message: `No data found for SNP: ${snp} in ${study} database`,
                snp,
                chromosome,
                position,
                study,
                total_phenotypes: 0,
                plot_data: []
            };
        }

        const plot_data = rows.map(row => ({
            SNP_ID: row.SNP_ID,
            phenotype: row.phenotype,
            chromosome: row.chromosome,
            position: row.position,
            ref_allele: row.ref_allele,
            alt_allele: row.alt_allele,
            pvalue: row.pvalue,
            beta: row.beta,
            se: row.se,
            aaf: row.aaf,
            n: row.n,
            n_study: row.n_study,
            study: study
        }));

        return {
            snp,
            chromosome: plot_data[0].chromosome,
            position: plot_data[0].position,
            study,
            total_phenotypes: plot_data.length,
            plot_data
        };

    } catch (error) {
        console.error(`Error in PheWAS query for ${study}:`, error);
        throw error;
    } finally {
        if (db) db.close();
    }
}

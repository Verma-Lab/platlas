// File: src/services/gptService.js
import OpenAI from 'openai';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';
import { LEAD_MRMEGA_PATH } from '../config/constants.js';
import path from 'path';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();
const DB_PATH = path.join(process.cwd(), 'data', 'phenotype.db');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const GWAS_API_BASE = "http://locahost:5001/api"
let db;
let isInitialized = false;
function generateGWASLink(phenoId, cohort, pvalue = 0.1) {
    return `${GWAS_API_BASE}?cohortId=${cohort}&phenoId=${phenoId}&pval=${pvalue}`;
}
// Initialize database
export async function initializeDatabase() {
    if (isInitialized) {
        console.log('Database already initialized');
        return;
    }

    try {
        // Ensure data directory exists
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });

        // Create database connection
        db = new sqlite3.Database(DB_PATH);
        const dbRun = promisify(db.run.bind(db));

        // Check if table exists
        const tableExists = await new Promise((resolve) => {
            db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='phenotype_data'", (err, row) => {
                resolve(!!row);
            });
        });

        if (tableExists) {
            isInitialized = true;
            console.log('Database already exists and has the required table');
            return;
        }

        // Create table
        await dbRun(`
            CREATE TABLE IF NOT EXISTS phenotype_data (
                Trait TEXT,
                Category TEXT,
                Description TEXT,
                Trait_Type TEXT,
                Population TEXT,
                Chromosome TEXT,
                Position INTEGER,
                Reference TEXT,
                Alternate TEXT,
                Log10P REAL,
                N INTEGER,
                N_Study INTEGER,
                rsID TEXT,
                LEAD_SNP INTEGER
            )
        `);

        // Read and parse CSV file
        const content = await fs.readFile(LEAD_MRMEGA_PATH, 'utf-8');
        const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        // Begin transaction
        await dbRun('BEGIN TRANSACTION');

        // Prepare insert statement
        const stmt = db.prepare(`
            INSERT INTO phenotype_data (
                Trait, Category, Description, Trait_Type, Population,
                Chromosome, Position, Reference, Alternate, Log10P,
                N, N_Study, rsID, LEAD_SNP
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // Insert records
        for (const record of records) {
            await new Promise((resolve, reject) => {
                stmt.run([
                    record.Trait,
                    record.Category,
                    record.Description,
                    record['Trait Type'],
                    record.Population,
                    record.Chromosome,
                    parseInt(record.Position) || null,
                    record.Reference,
                    record.Alternate,
                    parseFloat(record.Log10P) || null,
                    parseInt(record.N.replace(/[",]/g, '')) || null,
                    parseInt(record['N Study']) || null,
                    record.rsID,
                    parseInt(record.LEAD_SNP) || null
                ], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }

        await new Promise((resolve) => stmt.finalize(resolve));
        await dbRun('COMMIT');

        // Create indexes
        await dbRun('CREATE INDEX idx_chromosome ON phenotype_data(Chromosome)');
        await dbRun('CREATE INDEX idx_trait ON phenotype_data(Trait)');
        await dbRun('CREATE INDEX idx_category ON phenotype_data(Category)');

        isInitialized = true;
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Generate SQL query using GPT
async function generateSQLQuery(userQuestion) {
    const prompt = `
Given this table schema for phenotype data:
- Trait: phenotype ID
- Category: disease category
- Description: phenotype description
- Population: study population
- Chromosome: chromosome number
- Position: genomic position
- Log10P: statistical significance
- N: sample size
- rsID: variant ID
- LEAD_SNP: number of lead variants

Generate a SQL query to answer this question: "${userQuestion}"
IMPORTANT: Always include:
1. ORDER BY Log10P DESC to get most significant results first
2. LIMIT 5 to get only top 5 results
Return only the SQL query, nothing else.
`;

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a SQL expert. Generate only SQL queries that MUST include 'ORDER BY Log10P DESC LIMIT 5' at the end." },
            { role: "user", content: prompt }
        ],
        temperature: 0.1
    });

    let query = completion.choices[0].message.content.trim();
    
    // Ensure the query has the required ordering and limit
    if (!query.toLowerCase().includes('order by')) {
        query = query.replace(/;?\s*$/, ' ORDER BY Log10P DESC LIMIT 5;');
    } else if (!query.toLowerCase().includes('limit')) {
        query = query.replace(/;?\s*$/, ' LIMIT 5;');
    }

    return query;
}

// Query GPT and database
export async function queryGPT(userQuestion) {
    try {
        if (!isInitialized) {
            await initializeDatabase();
        }

        const sqlQuery = await generateSQLQuery(userQuestion);
        const results = await promisify(db.all.bind(db))(sqlQuery);

        // Generate explanation with GWAS links
        const responsePrompt = `
Given these top 5 most significant genetic associations (highest Log10P values): ${JSON.stringify(results)}
Provide a natural language summary of the findings in response to the question: "${userQuestion}"
Focus on:
1. The most significant associations (highest Log10P values)
2. The traits and categories involved
3. The chromosomal locations

IMPORTANT: For each result discussed:
- If you mention a phenotype ID that starts with "Phe", "QTL", or similar standardized identifiers, mark it with [PHENOTYPE_ID] tags
- If you mention a population cohort (ALL, AFR, EUR, etc.), mark it with [COHORT] tags

Example format: "The phenotype [PHENOTYPE_ID]Phe123[/PHENOTYPE_ID] shows strong association in the [COHORT]AFR[/COHORT] population"

Keep the explanation concise but informative.
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a genetics expert. Explain the most significant findings clearly and concisely. Use [PHENOTYPE_ID] and [COHORT] tags to mark identifiers and populations." },
                { role: "user", content: responsePrompt }
            ]
        });

        // Process the explanation to add GWAS links
        let explanation = completion.choices[0].message.content;
        const phenoMatches = [...explanation.matchAll(/\[PHENOTYPE_ID\](.*?)\[\/PHENOTYPE_ID\]/g)];
        const cohortMatches = [...explanation.matchAll(/\[COHORT\](.*?)\[\/COHORT\]/g)];

        // Create links array
        const links = [];
        for (let i = 0; i < phenoMatches.length; i++) {
            const phenoId = phenoMatches[i][1];
            const cohort = cohortMatches[i] ? cohortMatches[i][1] : 'ALL'; // Default to ALL if no cohort specified
            const link = generateGWASLink(phenoId, cohort);
            links.push({
                phenotype: phenoId,
                cohort: cohort,
                gwasLink: link
            });
        }

        // Clean up the explanation by removing the tags
        explanation = explanation
            .replace(/\[PHENOTYPE_ID\]/g, '')
            .replace(/\[\/PHENOTYPE_ID\]/g, '')
            .replace(/\[COHORT\]/g, '')
            .replace(/\[\/COHORT\]/g, '');

        return {
            question: userQuestion,
            sqlQuery: sqlQuery,
            results: results,
            explanation: explanation,
            gwasLinks: links
        };
    } catch (error) {
        console.error('Error in GPT query:', error);
        throw error;
    }
}
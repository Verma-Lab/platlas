import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

const ALTERNATING_COLORS = [
    '#DC2626', // Dark red
    '#2563EB'  // Blue
];

// Chromosome lengths in base pairs (0-21)
const CHROMOSOME_LENGTHS = [
    248956422, 242193529, 198295559, 190214555, 181538259, 170805979,
    159345973, 145138636, 138394717, 133797422, 135086622, 133275309,
    114364328, 107043718, 101991189, 90338345, 83257441, 80373285,
    58617616, 64444167, 46709983, 50818468
];

export const Manhattan = ({ dyn, stat, threshold, onSNPClick, phenoId, selectedCohort, selectedStudy, filterLimit, filterMinPValue }) => {
    const [leadSNPs, setLeadSNPs] = useState([]);
    const [layout, setLayout] = useState({});
    const baseURL = process.env.FRONTEND_BASE_URL || 'http://localhost:5001/api';
    const GAP = 0.008;
    const CHR_COUNT = CHROMOSOME_LENGTHS.length;
    const GAP_COUNT = CHR_COUNT - 1;

    const totalLength = CHROMOSOME_LENGTHS.reduce((a, b) => a + b, 0);
    const totalScale = 1 + GAP_COUNT * GAP;
    const scaleFactor = 1 / totalScale;

    const chrPositions = [];
    {
        let currentPos = 0;
        for (let i = 0; i < CHR_COUNT; i++) {
            const chrFrac = (CHROMOSOME_LENGTHS[i] / totalLength) * scaleFactor;
            chrPositions.push({
                start: currentPos,
                end: currentPos + chrFrac,
                lengthFrac: chrFrac
            });
            currentPos += chrFrac;
            if (i < CHR_COUNT - 1) {
                currentPos += GAP * scaleFactor;
            }
        }
    }

    const normalizePosition = (chrIndex, pos) => {
        const chrStartPos = chrPositions[chrIndex].start;
        const chrLen = CHROMOSOME_LENGTHS[chrIndex];
        const spacing = chrLen * 0.08;
        const fractionWithinChr = pos / (chrLen + spacing);
        return chrStartPos + fractionWithinChr * chrPositions[chrIndex].lengthFrac;
    };

    const calculateChromosomePositions = () => {
        return chrPositions.map(pos => pos.start + pos.lengthFrac / 2);
    };

    useEffect(() => {
        const fetchLeadSNPs = async () => {
            try {
                // const response = await fetch(`${baseURL}/getLeadVariants`);
                const response = await fetch(`/api/getLeadVariants`);
                if (!response.ok) throw new Error('Failed to fetch lead SNPs');
                const data = await response.json();
                
                const filteredSNPs = data.filter(snp => 
                    snp.trait.name === phenoId && 
                    snp.cohort === selectedCohort
                );
                
                setLeadSNPs(filteredSNPs);
            } catch (error) {
                console.error('Error fetching lead SNPs:', error);
            }
        };
        fetchLeadSNPs();
    }, [phenoId, selectedCohort, baseURL]);

    // Removed transformYValue function as we want direct plotting

    const generateYAxisConfig = (maxValue) => {
        let tickInterval;
        let maxRange;
    
        if (maxValue <= 10) {
            tickInterval = 2;
            maxRange = 8;
        }
        else if (maxValue <= 20) {
            tickInterval = 2;
            maxRange = 20;
        } 
         else if (maxValue <= 28) {
            tickInterval = 4;
            maxRange = 28;
        } else if (maxValue <= 40) {
            tickInterval = 8;
            maxRange = 40;
        } else if (maxValue <= 70) {
            tickInterval = 10;
            maxRange = 70;
        } else {
            tickInterval = 20;
            maxRange = Math.ceil(maxValue / 20) * 20;
        }
    
        const ticks = [];
        for (let i = 0; i <= maxRange; i += tickInterval) {
            ticks.push(i);
        }
    
        return {
            ticks,
            maxRange,
            tickInterval
        };
    };

    useEffect(() => {
        console.log('POINTS')
        console.log(stat, dyn)
        const allYValues = [...stat, ...dyn].flatMap(d => d.y);
        const maxYValue = Math.ceil(Math.max(...allYValues, threshold || 0));
        const maxLeadSNPLog10p = leadSNPs.reduce((max, snp) => 
            Math.max(max, snp.lead_snp?.log10p || 0), 0
        );
        const absoluteMaxY = Math.max(maxYValue, maxLeadSNPLog10p);
        
        const { ticks, maxRange } = generateYAxisConfig(absoluteMaxY);
        const xAxisTicks = calculateChromosomePositions();
        const xAxisLabels = Array.from({length: CHR_COUNT}, (_, i) => (i + 1).toString());
        
        const getImagePath = async () => {
            try {
                const study = selectedStudy === 'mrmega' ? 'mrmega' : 'gwama';
                const plotType = 'manhattan';
                const response = await fetch(
                    // `${baseURL}/getManhattanPlot?phenoId=${phenoId}&cohortId=${selectedCohort}&study=${study}&plotType=${plotType}`
                    `/api/getManhattanPlot?phenoId=${phenoId}&cohortId=${selectedCohort}&study=${study}&plotType=${plotType}`

                );
                if (!response.ok) {
                    throw new Error('Failed to fetch Manhattan plot');
                }
                const blob = await response.blob();
                return URL.createObjectURL(blob);
            } catch (error) {
                console.error('Error fetching Manhattan plot:', error);
                return null;
            }
        };

        // Convert minimum p-value to -log10 scale if it exists
// Convert minimum p-value to -log10 scale if it exists
const minLogPThreshold = filterMinPValue ? -Math.log10(parseFloat(filterMinPValue)) : 0;

const shapes = [];

// Add the significance threshold line if provided
if (threshold) {
    shapes.push({
        type: 'line',
        xref: 'paper',
        yref: 'y',
        x0: 0,
        x1: 1,
        y0: threshold,
        y1: threshold,
        line: {
            color: 'rgb(255, 0, 0)',
            width: 2,
            dash: 'dash'
        }
    });
}

// Add a semi-transparent rectangle to simulate the blur effect
shapes.push({
    type: 'rect',
    xref: 'paper',
    yref: 'y',
    x0: 0,
    x1: 1,
    y0: 0,
    y1: minLogPThreshold,
    fillcolor: 'rgba(200, 200, 200, 0.3)', // Semi-transparent gray to mimic blur
    line: {
        width: 0
    },
    layer: 'below'
});

// Optionally, add a striped pattern on top to match the original image
shapes.push({
    type: 'rect',
    xref: 'paper',
    yref: 'y',
    x0: 0,
    x1: 1,
    y0: 0,
    y1: minLogPThreshold,
    fillcolor: 'rgba(0, 0, 0, 0)', // Transparent fill for the pattern
    line: {
        width: 0
    },
    layer: 'below',
    pattern: {
        shape: '/', // Diagonal stripes
        fillmode: 'overlay',
        size: 10,
        solidity: 0.3, // Adjust solidity to make the stripes less prominent
        fgcolor: 'rgba(120, 120, 120, 0.5)', // Gray stripes
        bgcolor: 'rgba(0, 0, 0, 0)' // Transparent background
    }
});

        (async () => {
            const imageUrl = await getImagePath();
            
            setLayout({
                autosize: true,
                height: 600,
                paper_bgcolor: 'white',
                plot_bgcolor: 'white',
                showlegend: true,
                xaxis: {
                    title: 'Chromosome',
                    titlefont: { size: 14 },
                    tickmode: 'array',
                    tickvals: xAxisTicks,
                    ticktext: xAxisLabels,
                    showgrid: false,
                    zeroline: false,
                    showline: true,
                    linewidth: 1,
                    range: [-0.01, 1.05],
                    fixedrange: true
                },
                yaxis: {
                    title: '-log₁₀(p)',
                    titlefont: { size: 14 },
                    showgrid: false,
                    zeroline: false,
                    showline: true,
                    linewidth: 1,
                    tickmode: 'array',
                    tickvals: ticks,
                    ticktext: ticks.map(String),
                    range: [0, maxRange * 1.05],
                    fixedrange: true
                },
                margin: { l: 60, r: 40, t: 20, b: 40 },
                shapes,
                images: [{
                    source: imageUrl,
                    xref: 'x',
                    yref: 'y',
                    x: -0.0625,
                    y: -(maxRange * 0.07),  // Make it dynamic based on maxRange
                    sizex: 1.225,
                    sizey: maxRange * 1.05,  // Slightly larger to ensure full coverage
                    xanchor: 'left',
                    yanchor: 'bottom',  // Change this from 'top' to 'bottom'
                    sizing: 'stretch',
                    opacity: 1,
                    layer: 'below'
                }]
            });
        })();

        return () => {
            const currentLayout = layout?.images?.[0]?.source;
            if (currentLayout && currentLayout.startsWith('blob:')) {
                URL.revokeObjectURL(currentLayout);
            }
        };
    }, [stat, dyn, threshold, leadSNPs, phenoId, selectedCohort, selectedStudy]);

    const prepareRegularData = () => {
        const regularTraces = [];
        
        for (let chrIndex = 0; chrIndex < CHR_COUNT; chrIndex++) {
            const chrData = [...stat, ...dyn].filter(d => d.chr === (chrIndex + 1));
            
            chrData.forEach(d => {
                regularTraces.push({
                    x: d.pos.map(p => normalizePosition(chrIndex, p)),
                    y: d.y,
                    type: 'scattergl',
                    mode: 'markers',
                    marker: { 
                        color: ALTERNATING_COLORS[chrIndex % 2],
                        size: 3.5,
                        opacity: 1
                    },
                    hoverinfo: 'text',
                    text: d.x.map((xVal, i) => {
                        const snpID = d.SNP_ID && d.SNP_ID[i] ? d.SNP_ID[i] : 'N/A';
                        const posVal = d.pos && d.pos[i] ? d.pos[i] : 'N/A';
                        const originalY = d.y[i];
                        return (
                            `SNP_ID: ${snpID}<br>` +
                            `Chromosome: ${chrIndex + 1}<br>` +
                            `Position: ${posVal.toLocaleString()}<br>` +
                            `-log10 p-value: ${originalY.toFixed(2)}<br>` +
                            `P-value: ${Math.pow(10, -originalY).toExponential(2)}`
                        );
                    }),
                    showlegend: false
                });
            });
        }
    
        return regularTraces;
    };
    const prepareLeadSNPData = () => {
        if (!leadSNPs.length) return null;
    
        console.log('FILTER LIMIT', filterLimit)
        // If filterLimit is '0', return null to show no lead SNPs
        if (filterLimit === "None") return null;
        
        const sortedSNPs = [...leadSNPs].sort((a, b) => 
            parseFloat(b.lead_snp.log10p) - parseFloat(a.lead_snp.log10p)
        );
        
        let filteredSNPs = sortedSNPs;
        if (filterLimit !== 'all') {
            const limit = parseInt(filterLimit);
            filteredSNPs = sortedSNPs.slice(0, limit);
        }
    
        const leadSNPTrace = {
            x: [],
            y: [],
            text: [],
            type: 'scattergl',
            mode: 'markers',
            marker: {
                symbol: 'diamond',
                size: 8,
                color: '#000000',
                line: { color: '#FFFFFF', width: 2 },
                opacity: 1
            },
            hoverinfo: 'text',
            showlegend: false,
            name: `Lead SNPs (${selectedCohort}) - Top ${filterLimit === 'all' ? 'All' : filterLimit}`
        };
    
        filteredSNPs.forEach(snp => {
            const chr = parseInt(snp.lead_snp.position.chromosome, 10) - 1;
            const pos = parseInt(snp.lead_snp.position.position, 10);
            const log10p = parseFloat(snp.lead_snp.log10p);
            
            const normalizedPos = normalizePosition(chr, pos);
            leadSNPTrace.x.push(normalizedPos);
            leadSNPTrace.y.push(log10p);
            leadSNPTrace.text.push(
                `Lead SNP: ${snp.lead_snp.rsid}<br>` +
                `Chromosome: ${chr + 1}<br>` +
                `Position: ${pos.toLocaleString()}<br>` +
                `Log10P: ${log10p.toFixed(2)}<br>` +
                `Population: ${snp.cohort}`
            );
        });
    
        return leadSNPTrace;
    };
    // const prepareLeadSNPData = () => {
    //     if (!leadSNPs.length) return null;
    
    //     const leadSNPTrace = {
    //         x: [],
    //         y: [],
    //         text: [],
    //         type: 'scattergl',
    //         mode: 'markers',
    //         marker: {
    //             symbol: 'diamond',
    //             size: 8,
    //             color: '#000000',
    //             line: { color: '#FFFFFF', width: 2 },
    //             opacity: 1
    //         },
    //         hoverinfo: 'text',
    //         showlegend: false,
    //         name: `Lead SNPs (${selectedCohort})`
    //     };
    
    //     leadSNPs.forEach(snp => {
    //         const chr = parseInt(snp.lead_snp.position.chromosome, 10) - 1;
    //         const pos = parseInt(snp.lead_snp.position.position, 10);
    //         const log10p = parseFloat(snp.lead_snp.log10p);
            
    //         const normalizedPos = normalizePosition(chr, pos);
    //         leadSNPTrace.x.push(normalizedPos);
    //         leadSNPTrace.y.push(log10p);
    //         leadSNPTrace.text.push(
    //             `Lead SNP: ${snp.lead_snp.rsid}<br>` +
    //             `Chromosome: ${chr + 1}<br>` +
    //             `Position: ${pos.toLocaleString()}<br>` +
    //             `Log10P: ${log10p.toFixed(2)}<br>` +
    //             `Population: ${snp.cohort}`
    //         );
    //     });
    
    //     return leadSNPTrace;
    // };

    const extractValue = (textParts, key) => {
        const part = textParts.find((p) => p.startsWith(`${key}:`));
        return part ? part.split(': ')[1] : null;
    };

    const handleClick = (event) => {
        const point = event.points[0];
        if (point && point.text) {
            const textParts = point.text.split('<br>');
            const snpData = {
                SNP_ID: extractValue(textParts, 'SNP_ID') || extractValue(textParts, 'Lead SNP'),
                chromosome: extractValue(textParts, 'Chromosome'),
                position: extractValue(textParts, 'Position')?.replace(/,/g, ''),
                pvalue: extractValue(textParts, 'P-value') || extractValue(textParts, 'Log10P')
            };

            if (snpData.SNP_ID && snpData.chromosome && snpData.position) {
                onSNPClick(snpData);
            }
        }
    };

    const leadSNPTrace = prepareLeadSNPData();
    const regularData = prepareRegularData();
    const allData = leadSNPTrace ? [...regularData, leadSNPTrace] : regularData;

    return (
        <div className="w-full h-[600px]">
            <Plot
                data={allData}
                layout={layout}
                config={{ 
                    responsive: true,
                    displayModeBar: false,
                    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                    displaylogo: false,
                    scrollZoom: false
                }}
                onClick={handleClick}
                style={{ 
                    width: '100%',
                    height: '100%'
                }}
                useResizeHandler={true}
            />
        </div>
    );
};
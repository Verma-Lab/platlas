import React from 'react';
import Plot from 'react-plotly.js';
import { Card } from '../ui/cards';

// Y-Axis Transformation Functions
const transformYValue = (value) => {
  if (value <= 20) return value;
  if (value <= 50) return 20 + (value - 20) / 10;
  return 23 + (value - 50) / 50;
};

const inverseTransformYValue = (displayValue) => {
  if (displayValue <= 20) return displayValue;
  if (displayValue <= 23) return 20 + (displayValue - 20) * 10;
  return 50 + (displayValue - 23) * 50;
};

// Modified Generate Y-Axis Ticks Function
const generateYAxisTicks = (maxValue) => {
  const ticks = [];
  const tickPositions = [];
  let currentValue = 5; // Start at 5

  // Up to 20 (increment by 1)
  while (currentValue <= Math.min(20, maxValue)) {
    ticks.push(currentValue);
    tickPositions.push(transformYValue(currentValue));
    currentValue += 1;
  }

  // From 30 to 50 (increment by 10)
  if (maxValue > 20) {
    currentValue = 30;
    while (currentValue <= Math.min(50, maxValue)) {
      ticks.push(currentValue);
      tickPositions.push(transformYValue(currentValue));
      currentValue += 10;
    }
  }

  // Above 50 (increment by 50)
  if (maxValue > 50) {
    currentValue = 100;
    while (currentValue <= maxValue) {
      ticks.push(currentValue);
      tickPositions.push(transformYValue(currentValue));
      currentValue += 50;
    }
  }

  return { ticks, tickPositions };
};

// Chromosome Colors
const ALTERNATING_COLORS = [
  '#DC2626', // Dark Red
  '#2563EB'  // Blue
];

const BORDER_LINE = -Math.log10(5e-8); // Genome-wide significance threshold

// Chromosome Lengths
const CHROMOSOME_LENGTHS = [
  248956422, 242193529, 198295559, 190214555, 181538259, 170805979,
  159345973, 145138636, 138394717, 133797422, 135086622, 133275309,
  114364328, 107043718, 101991189, 90338345, 83257441, 80373285,
  58617616, 64444167, 46709983, 50818468
];

const CHR_COUNT = CHROMOSOME_LENGTHS.length;  // 22
const GAP = 0.008; // Spacing factor between chromosomes
const GAP_COUNT = CHR_COUNT - 1;

// Compute Total Scale with Gaps
const totalLength = CHROMOSOME_LENGTHS.reduce((a, b) => a + b, 0);
const totalScale = 1 + GAP_COUNT * GAP;
const scaleFactor = 1 / totalScale;

// Calculate Chromosome Positions
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

// Normalize Position Function
function normalizePosition(chrIndex, pos) {
  const { start, lengthFrac } = chrPositions[chrIndex];
  const fractionWithinChr = pos / CHROMOSOME_LENGTHS[chrIndex];
  return start + fractionWithinChr * lengthFrac;
}

// Modified Prepare Traces Function - Removed dummy points generation
function prepareTraces(dyn, stat, topPlot) {
  const traces = [];

  // Check if there's real data
  if ((dyn.length === 0 && stat.length === 0)) {
    return [];
  }

  // Process all chromosomes
  for (let chrIndex = 0; chrIndex < CHR_COUNT; chrIndex++) {
    const chrNumber = chrIndex + 1;
    const color = ALTERNATING_COLORS[chrIndex % ALTERNATING_COLORS.length];
    
    // Add dynamic data points
    const dynChrData = dyn.filter(d => d.chr === chrNumber);
    dynChrData.forEach(d => {
      traces.push({
        x: d.pos.map(p => normalizePosition(chrIndex, p)),
        y: d.y.map(y => transformYValue(y)),
        type: 'scattergl',
        mode: 'markers',
        marker: {
          color: color,
          size: 5,
          opacity: 0.9
        },
        hoverinfo: 'text',
        text: d.x.map((xVal, i) => {
          const snpID = d.SNP_ID && d.SNP_ID[i] ? d.SNP_ID[i] : 'N/A';
          const posVal = d.pos && d.pos[i] ? d.pos[i] : 'N/A';
          const originalY = d.y[i];
          return `SNP_ID: ${snpID}<br>` +
                 `Chromosome: ${chrNumber}<br>` +
                 `Position: ${posVal.toLocaleString()}<br>` +
                 `-log10 p-value: ${originalY.toFixed(2)}<br>` +
                 `P-value: ${Math.pow(10, -originalY).toExponential(2)}`;
        }),
        showlegend: false,
        xaxis: topPlot ? 'x' : 'x2',
        yaxis: topPlot ? 'y' : 'y2'
      });
    });
    
    // Add static data points
    const statChrData = stat.filter(d => d.chr === chrNumber);
    statChrData.forEach(d => {
      traces.push({
        x: d.pos.map(p => normalizePosition(chrIndex, p)),
        y: d.y.map(y => transformYValue(y)),
        type: 'scattergl',
        mode: 'markers',
        marker: {
          color: color,
          size: 4,
          opacity: 0.7
        },
        hoverinfo: 'text',
        text: d.x.map((xVal, i) => {
          const snpID = d.SNP_ID && d.SNP_ID[i] ? d.SNP_ID[i] : 'N/A';
          const posVal = d.pos && d.pos[i] ? d.pos[i] : 'N/A';
          const originalY = d.y[i];
          return `SNP_ID: ${snpID}<br>` +
                 `Chromosome: ${chrNumber}<br>` +
                 `Position: ${posVal.toLocaleString()}<br>` +
                 `-log10 p-value: ${originalY.toFixed(2)}<br>` +
                 `P-value: ${Math.pow(10, -originalY).toExponential(2)}`;
        }),
        showlegend: false,
        xaxis: topPlot ? 'x' : 'x2',
        yaxis: topPlot ? 'y' : 'y2'
      });
    });
  }

  return traces;
}

// Layout Configuration
const HUDSON_LAYOUT = {
  width: 1000,
  height: 750,
  showlegend: false,

  xaxis: {
    domain: [0, 1],
    anchor: 'y',
    title: 'Chromosome',
    showline: false,
    zeroline: false,
    mirror: false,
  },
  yaxis: {
    domain: [0.55, 1],
    anchor: 'x',
    title: '-log10 p-value',
    range: [transformYValue(5), transformYValue(24)], // Transformed range, 5 at bottom
    tickmode: 'array',
    tickvals: [], // Populated dynamically
    ticktext: [], // Populated dynamically
    showline: true,
    zeroline: false,
  },

  xaxis2: {
    domain: [0, 1],
    anchor: 'y2',
    title: 'Chromosome',
    showline: false,
    zeroline: false,
    mirror: false,
  },
  yaxis2: {
    domain: [0, 0.45],
    anchor: 'x2',
    title: '-log10 p-value',
    range: [transformYValue(24), transformYValue(5)], // Reversed, 5 at bottom
    tickmode: 'array',
    tickvals: [], // Populated dynamically
    ticktext: [], // Populated dynamically
    showline: true,
    zeroline: false,
  },
  shapes: [
    {
      type: 'line',
      xref: 'paper',
      x0: 0,
      x1: 1,
      y0: transformYValue(BORDER_LINE),
      y1: transformYValue(BORDER_LINE),
      line: { color: 'red', width: 1, dash: 'dash' },
      yref: 'y'
    },
    {
      type: 'line',
      xref: 'paper',
      x0: 0,
      x1: 1,
      y0: transformYValue(BORDER_LINE),
      y1: transformYValue(BORDER_LINE),
      line: { color: 'red', width: 1, dash: 'dash' },
      yref: 'y2'
    }
  ],
  annotations: []
};

// Cohort Selector Component
const CohortSelector = ({ 
  availableCohorts, 
  selectedCohort, 
  onCohortChange, 
  position 
}) => (
  <div className="flex flex-col space-y-2 p-4 bg-white rounded-lg shadow">
    <span className="text-sm font-medium text-gray-700">
      Select {position} Cohort:
    </span>
    <div className="flex flex-wrap gap-2">
      {availableCohorts.map((cohort) => (
        <button
          key={cohort}
          onClick={() => onCohortChange(cohort)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedCohort === cohort
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {cohort}
        </button>
      ))}
    </div>
  </div>
);

// Updated Hudson Component
export const Hudson = ({
  dynTop, statTop, dynBott, statBott,
  ticksTop, ticksBott,
  selectedTopAncestry,
  selectedBottomAncestry,
  onTopAncestryChange,
  onBottomAncestryChange,
  loadingTop,
  loadingBottom,
  availableCohorts
}) => {
  // Prepare Data for Top and Bottom Plots
  const topData = prepareTraces(dynTop, statTop, true);
  const bottomData = prepareTraces(dynBott, statBott, false);

  // Function to Get Maximum Y-Value
  const getMaxY = (data) => {
    if (!data || data.length === 0) return 10; // Default max if no data
    return Math.max(
      Math.ceil(Math.max(...data.flatMap(trace => 
        Array.isArray(trace.y) ? trace.y : []
      ))),
      10 // Minimum max value for visibility
    );
  };

  const topMaxY = Math.max(getMaxY([...dynTop, ...statTop]), BORDER_LINE + 2);
  const bottomMaxY = Math.max(getMaxY([...dynBott, ...statBott]), BORDER_LINE + 2);

  // Generate Y-Axis Ticks and Positions
  const { ticks: topTicks, tickPositions: topTickPositions } = generateYAxisTicks(topMaxY);
  const { ticks: bottomTicks, tickPositions: bottomTickPositions } = generateYAxisTicks(bottomMaxY);

  // Calculate Maximum Range Based on Transformed Values
  const getMaxRange = (maxY) => {
    return transformYValue(maxY) + 1;
  };

  const topMaxRange = getMaxRange(topMaxY);
  const bottomMaxRange = getMaxRange(bottomMaxY);

  // Generate Chromosome Tick Values and Labels
  const tickvals = chrPositions.map(pos => pos.start + pos.lengthFrac / 2);
  const ticktext = Array.from({ length: CHR_COUNT }, (_, i) => (i + 1).toString());

  // Create annotations for empty plots
  const annotations = [];
  
  if (topData.length === 0 && !loadingTop) {
    annotations.push({
      xref: 'paper',
      yref: 'y',
      x: 0.5,
      y: transformYValue((topMaxY + 5) / 2),
      text: 'No significant data points available for this cohort',
      showarrow: false,
      font: {
        size: 14,
        color: '#6B7280'
      },
      bgcolor: 'rgba(255, 255, 255, 0.8)',
      bordercolor: '#E5E7EB',
      borderwidth: 1,
      borderpad: 4,
      align: 'center'
    });
  }
  
  if (bottomData.length === 0 && !loadingBottom) {
    annotations.push({
      xref: 'paper',
      yref: 'y2',
      x: 0.5,
      y: transformYValue((bottomMaxY + 5) / 2),
      text: 'No significant data points available for this cohort',
      showarrow: false,
      font: {
        size: 14,
        color: '#6B7280'
      },
      bgcolor: 'rgba(255, 255, 255, 0.8)',
      bordercolor: '#E5E7EB',
      borderwidth: 1,
      borderpad: 4,
      align: 'center'
    });
  }

  // Update Layout with Transformed Y-Axis
  const layout = {
    ...HUDSON_LAYOUT,
    xaxis: { 
      ...HUDSON_LAYOUT.xaxis,
      tickvals: tickvals,
      ticktext: ticktext,
    },
    xaxis2: { 
      ...HUDSON_LAYOUT.xaxis2,
      tickvals: tickvals,
      ticktext: ticktext,
    },
    yaxis: {
      ...HUDSON_LAYOUT.yaxis,
      range: [transformYValue(5), topMaxRange], // 5 at bottom, max at top
      tickmode: 'array',
      tickvals: topTickPositions,
      ticktext: topTicks.map(String),
    },
    yaxis2: {
      ...HUDSON_LAYOUT.yaxis2,
      range: [bottomMaxRange, transformYValue(5)], // Max at top, 5 at bottom
      tickmode: 'array',
      tickvals: bottomTickPositions,
      ticktext: bottomTicks.map(String),
    },
    annotations: annotations
  };

  const data = [...topData, ...bottomData];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <CohortSelector
          availableCohorts={availableCohorts}
          selectedCohort={selectedTopAncestry}
          onCohortChange={onTopAncestryChange}
          position="Top"
        />
        <CohortSelector
          availableCohorts={availableCohorts}
          selectedCohort={selectedBottomAncestry}
          onCohortChange={onBottomAncestryChange}
          position="Bottom"
        />
      </div>

      <Card>
        <div className="relative p-4">
          <Plot
            data={data}
            layout={layout}
            config={{ 
              responsive: true,
              displayModeBar: false
            }}
          />
          {(loadingTop || loadingBottom) && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                <span className="text-sm text-gray-600">Loading plots...</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Hudson;
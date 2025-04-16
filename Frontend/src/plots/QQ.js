// import Card from 'react-bootstrap/Card'
// import Image from 'react-bootstrap/Image'

// export const QQ = (props) => {
//   return (
//     <Card style={{alignItems: 'center', width: '100%'}}>
//       <Image src={props.src} fluid/>
//     </Card>
//   )
// }
import React, { useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Plot from 'react-plotly.js';

export const QQ = ({ data }) => {
  if (!data) return <div>Loading...</div>;

  // MAF thresholds matching the screenshot
  const mafThresholds = [
    { min: 0, max: 0.0001, color: '#ff7f0e', label: '0 ≤ MAF < 1e-4' },
    { min: 0.0001, max: 0.0005, color: '#ffa500', label: '1e-4 ≤ MAF < 5e-4' },
    { min: 0.0005, max: 0.02, color: '#a9a9a9', label: '5e-4 ≤ MAF < 0.02' },
    { min: 0.02, max: 0.5, color: '#4169e1', label: '0.02 ≤ MAF < 0.50' }
  ];

  // Calculate GC lambda values
  const calculateGCLambda = (observed, theoretical, percentile) => {
    const idx = Math.floor(observed.length * percentile);
    return (observed[idx] / theoretical[idx]).toFixed(3);
  };

  const lambdaValues = {
    '0.5': calculateGCLambda(data.y, data.x, 0.5),
    '0.1': calculateGCLambda(data.y, data.x, 0.1),
    '0.01': calculateGCLambda(data.y, data.x, 0.01),
    '0.001': calculateGCLambda(data.y, data.x, 0.001)
  };

  // Identity line
  const maxVal = Math.max(...data.x, ...data.y);
  const identityLine = {
    x: [0, maxVal],
    y: [0, maxVal],
    mode: 'lines',
    type: 'scatter',
    line: {
      color: 'black',
      width: 1,
      dash: 'dash'
    },
    showlegend: false,
    hoverinfo: 'none'
  };

  const layout = {
    width: 800,
    height: 800,
    title: '',
    xaxis: {
      title: 'expected -log10(p)',
      range: [0, Math.ceil(maxVal)],
      zeroline: false,
      gridcolor: '#E2E2E2',
      showgrid: true,
    },
    yaxis: {
      title: 'observed -log10(p)',
      range: [0, Math.ceil(maxVal)],
      zeroline: false,
      gridcolor: '#E2E2E2',
      showgrid: true,
    },
    showlegend: true,
    legend: {
      x: 0.05,
      y: 1,
      bgcolor: 'rgba(255,255,255,0.9)',
    },
    annotations: [
      {
        x: 0.05,
        y: -0.15,
        xref: 'paper',
        yref: 'paper',
        text: `GC lambda 0.5: ${lambdaValues['0.5']}<br>GC lambda 0.1: ${lambdaValues['0.1']}<br>GC lambda 0.01: ${lambdaValues['0.01']}<br>GC lambda 0.001: ${lambdaValues['0.001']}<br>(Genomic Control lambda calculated based on the 50th percentile)`,
        showarrow: false,
        font: {
          size: 12
        }
      }
    ],
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    margin: {
      l: 60,
      r: 20,
      b: 100,
      t: 40
    }
  };

  // Create QQ plot with confidence intervals
  const plotData = [identityLine];
  
  // Add confidence interval band
  const n = data.x.length;
  const confidenceLevel = 0.95;
  const ci = Array.from({length: 100}, (_, i) => {
    const x = i * maxVal / 100;
    const df = 1;
    const se = Math.sqrt(x * (1 - x/n));
    return {
      x: x,
      lower: x - se * 1.96,
      upper: x + se * 1.96
    };
  });

  plotData.push({
    x: [...ci.map(p => p.x), ...ci.map(p => p.x).reverse()],
    y: [...ci.map(p => p.upper), ...ci.map(p => p.lower).reverse()],
    fill: 'toself',
    fillcolor: 'rgba(200,200,200,0.2)',
    line: {color: 'transparent'},
    showlegend: false,
    hoverinfo: 'none'
  });

  // Add main scatter points
  plotData.push({
    x: data.x,
    y: data.y,
    mode: 'markers',
    type: 'scatter',
    marker: {
      color: '#4169e1',
      size: 4,
      opacity: 0.6
    },
    showlegend: true,
    name: '0.02 ≤ MAF < 0.50',
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Plot
        data={plotData}
        layout={layout}
        config={{
          displayModeBar: false,
          responsive: true
        }}
      />
    </div>
  );
};
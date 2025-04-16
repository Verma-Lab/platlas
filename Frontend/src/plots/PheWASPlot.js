import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

const baseURL = process.env.FRONTEND_BASE_URL || 'http://localhost:5001/api';

const PheWASPlot = ({ data, selectedSNP }) => {
  const [phenoMapping, setPhenoMapping] = useState({});
  const [categoryColors, setCategoryColors] = useState({});

  useEffect(() => {
    const fetchMapping = async () => {
      try {
        // const response = await fetch(`${baseURL}/getPhenotypeMapping`);
        const response = await fetch(`/api/getPhenotypeMapping`);

        if (!response.ok) throw new Error('Failed to fetch mapping');
        const mapping = await response.json();
        setPhenoMapping(mapping);
      } catch (error) {
        console.error('Error fetching phenotype mapping:', error);
      }
    };
    fetchMapping();
  }, []);

  const plotData = data.plot_data || [];

  if (plotData.length === 0) {
    return <div className="text-center p-4">No PheWAS data available for this SNP</div>;
  }

  // Group data by category and assign colors
  const groupedData = plotData.reduce((acc, item) => {
    const category = phenoMapping[item.phenotype]?.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Create distinct colors for categories
  const colors = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
  ];

  // Assign positions and colors for categories
  let currentX = 0;
  const xPositions = {};
  const categoryPositions = {};
  
  Object.entries(groupedData).forEach(([category, items], categoryIndex) => {
    categoryPositions[category] = {
      center: currentX + (items.length / 2),
      color: colors[categoryIndex % colors.length]
    };
    
    items.forEach((item, index) => {
      xPositions[item.phenotype] = currentX + index;
    });
    
    currentX += items.length + 2; // Add spacing between categories
  });

  // Create scatter plots for each category
  const plotDataFormatted = Object.entries(groupedData).map(([category, items]) => ({
    name: category,
    x: items.map(d => xPositions[d.phenotype]),
    y: items.map(d => -Math.log10(d.pvalue)),
    text: items.map(d => 
      `Category: ${category}<br>` +
      `Phenotype: ${d.phenotype}<br>` +
      `Description: ${phenoMapping[d.phenotype]?.description || 'N/A'}<br>` +
      `P-value: ${d.pvalue.toExponential(2)}`
    ),
    type: 'scatter',
    mode: 'markers',
    marker: {
      size: 8,
      color: categoryPositions[category].color,
      opacity: 0.8
    },
    hoverinfo: 'text',
  }));

  const layout = {
    title: `PheWAS Plot for SNP ${selectedSNP}`,
    xaxis: {
      title: 'Phenotype Categories',
      ticktext: Object.keys(categoryPositions),
      tickvals: Object.entries(categoryPositions).map(([_, pos]) => pos.center),
      tickangle: 45,
      automargin: true,
    },
    yaxis: {
      title: '-log10(p-value)',
      rangemode: 'tozero',
    },
    shapes: Object.values(categoryPositions).map((pos, idx, arr) => {
      if (idx === arr.length - 1) return null;
      return {
        type: 'line',
        x0: pos.center + 1,
        x1: pos.center + 1,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: {
          color: 'rgba(128, 128, 128, 0.2)',
          width: 1,
          dash: 'dot'
        }
      };
    }).filter(Boolean),
    showlegend: false,
    legendgrouptitle: {
      text: 'Categories'
    },
    width: 1000,
    height: 600,
    margin: {
      l: 50,
      r: 50,
      b: 150,
      t: 100,
      pad: 4
    },
    hovermode: 'closest'
  };

  return (
    <div className="w-full h-full">
      <Plot
        data={plotDataFormatted}
        layout={layout}
        config={{
          responsive: true,
          scrollZoom: false,
          displayModeBar: false,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
        }}
        className="w-full h-full"
      />
    </div>
  );
};

export default PheWASPlot;
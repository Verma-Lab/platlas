import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChevronDown, Filter, Activity, BarChart2, Users, Database, Globe, FileText, Binary } from 'lucide-react';
import _ from 'lodash';

const baseURL = 'http://localhost:5001/api' || '/api';

const PhenotypeSummary = () => {
  const [data, setData] = useState([]);
  const [view, setView] = useState('category');
  const [loading, setLoading] = useState(true);

  const getCategoryColor = (category) => {
    const colors = {
      'Anthropometric': '#6366f1',
      'Cardiovascular': '#ef4444',
      'Metabolic': '#22c55e',
      'Neurological': '#f59e0b',
      'Respiratory': '#06b6d4',
      'Infectious Diseases': '#8b5cf6',
      'Other': '#94a3b8'
    };
    return colors[category] || '#94a3b8';
  };

  const getPopulationColor = (pop) => {
    const colors = {
      'EUR': '#3b82f6',
      'EAS': '#22c55e',
      'AFR': '#f59e0b',
      'AMR': '#ef4444',
      'SAS': '#8b5cf6'
    };
    return colors[pop] || '#94a3b8';
  };

  const processData = () => {
    if (!data.length) return [];

    let processedData;
    switch (view) {
      case 'category': {
        const grouped = _.groupBy(data, 'category');
        processedData = Object.entries(grouped).map(([category, items]) => ({
          name: category,
          count: items.length,
          snps: _.sumBy(items, 'nSnp'),
          color: getCategoryColor(category)
        }));
        break;
      }
      case 'population': {
        const popCounts = {};
        data.forEach(item => {
          (Array.isArray(item.populations) ? item.populations : []).forEach(pop => {
            popCounts[pop] = (popCounts[pop] || 0) + 1;
          });
        });
        processedData = Object.entries(popCounts).map(([pop, count]) => ({
          name: pop,
          count,
          color: getPopulationColor(pop)
        }));
        break;
      }
      default:
        processedData = [];
    }

    return _.orderBy(processedData, ['count'], ['desc']);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await fetch(`${baseURL}/getPhenotypeMapping`);
        const response = await fetch(`/api/getPhenotypeMapping`);

        const mappingData = await response.json();
        
        // Transform the data with additional fields
        const transformedData = Object.entries(mappingData).map(([key, value]) => ({
          id: key,
          category: value.category || 'Other',
          populations: value.populations || [],
          traitType: value.traitType || 'Unknown',
          nSnp: value.nSnp || 0,
          nAll: value.nAll || 0,
          nCases: value.nCases || 0,
          nControls: value.nControls || 0,
          lambdaGC: value.lambdaGC || 0,
          studies: value.studies || [],
          traitDescription: value.traitDescription || ''
        }));

        setData(transformedData);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate additional statistics
  const getStats = () => {
    return {
      totalPhenotypes: data.length,
      categories: new Set(data.map(d => d.category)).size,
      totalSNPs: _.sumBy(data, 'nSnp'),
      populations: new Set(data.flatMap(d => d.populations)).size,
      averageSamplesPerStudy: Math.round(_.meanBy(data, 'nAll')),
      totalCases: _.sumBy(data, 'nCases'),
      totalControls: _.sumBy(data, 'nControls'),
      binaryTraits: data.filter(d => d.traitType === 'Binary').length,
      quantitativeTraits: data.filter(d => d.traitType === 'Quantitative').length,
      averageLambdaGC: _.meanBy(data, 'lambdaGC'),
      multiPopulationStudies: data.filter(d => d.populations?.length > 1).length
    };
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Count: {data.count}</p>
          {data.snps && (
            <p className="text-sm text-gray-600">Total SNPs: {data.snps.toLocaleString()}</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = processData();
  const stats = getStats();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Phenotype Distribution</h2>
          <p className="text-sm text-gray-500">Analysis of trait distribution across categories and populations</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="category">By Category</option>
              <option value="population">By Population</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={90}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              barSize={20}
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {/* Study Overview */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-gray-600">Study Overview</p>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.totalPhenotypes}</p>
          <p className="text-xs text-gray-500 mt-1">Total Phenotypes</p>
        </div>

        {/* Sample Statistics */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <p className="text-sm text-gray-600">Sample Statistics</p>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {stats.averageSamplesPerStudy.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Average Samples per Study</p>
        </div>

        {/* Population Coverage */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-violet-600" />
            <p className="text-sm text-gray-600">Population Coverage</p>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {stats.multiPopulationStudies}
          </p>
          <p className="text-xs text-gray-500 mt-1">Multi-Population Studies</p>
        </div>

        {/* SNP Statistics */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Binary className="w-4 h-4 text-amber-600" />
            <p className="text-sm text-gray-600">Variant Statistics</p>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {(stats.totalSNPs / stats.totalPhenotypes).toFixed(0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Average SNPs per Trait</p>
        </div>

        {/* Case/Control Distribution */}
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-rose-600" />
            <p className="text-sm text-gray-600">Case/Control Ratio</p>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {(stats.totalCases / (stats.totalCases + stats.totalControls) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Cases in Binary Traits</p>
        </div>

        {/* Study Quality */}
        <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-4 h-4 text-sky-600" />
            <p className="text-sm text-gray-600">Study Quality</p>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {stats.averageLambdaGC?.toFixed(2) || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Average Lambda GC</p>
        </div>

        {/* Trait Types */}
        <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <p className="text-sm text-gray-600">Trait Types</p>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-xl font-semibold text-gray-900">{stats.binaryTraits}</p>
              <p className="text-xs text-gray-500">Binary</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">{stats.quantitativeTraits}</p>
              <p className="text-xs text-gray-500">Quantitative</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhenotypeSummary;
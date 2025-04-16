import React, { useState } from 'react';
import { Info, ChevronRight, ChevronLeft } from 'lucide-react';

export const TopResults = ({ data, onSNPClick }) => {
  console.log("TopResults received data:", data);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const rowsPerPage = 10;

  const headers = [
    {
      key: '#ID',
      label: 'SNP ID',
      tooltip: 'Variant identifier in format CHR:POS:REF:ALT'
    },
    {
      key: 'CHR',
      label: 'Chr',
      tooltip: 'Chromosome number'
    },
    {
      key: 'POS',
      label: 'Position',
      tooltip: 'Base pair position on the chromosome'
    },
    {
      key: 'REF',
      label: 'Ref',
      tooltip: 'Reference allele'
    },
    // {
    //   key: 'ALT',
    //   label: 'Alt',
    //   tooltip: 'Alternative allele'
    // },
    // {
    //   key: 'BETA',
    //   label: 'Beta',
    //   tooltip: 'Effect size estimate'
    // },
    // {
    //   key: 'SE',
    //   label: 'SE',
    //   tooltip: 'Standard error of the effect size'
    // },
    {
      key: 'P',
      label: 'P-value',
      tooltip: 'Statistical significance'
    },
    // {
    //   key: 'LOG10P',
    //   label: 'Log10(P)',
    //   tooltip: 'Negative log10 of the p-value'
    // },
    {
      key: 'SE_LDSC',
      label: 'SE LDSC',
      tooltip: 'LDSC-adjusted standard error'
    },
    {
      key: 'P_LDSC',
      label: 'P LDSC',
      tooltip: 'LDSC-adjusted p-value'
    },
    // {
    //   key: 'LOG10P_LDSC',
    //   label: 'Log10(P) LDSC',
    //   tooltip: 'LDSC-adjusted negative log10 p-value'
    // },
    // {
    //   key: 'AAF',
    //   label: 'AAF',
    //   tooltip: 'Alternative allele frequency'
    // },
    // {
    //   key: 'AAC',
    //   label: 'AAC',
    //   tooltip: 'Alternative allele count'
    // },
    {
      key: 'N',
      label: 'N Total',
      tooltip: 'Total sample size'
    },
    {
      key: 'N_STUDY',
      label: 'N Studies',
      tooltip: 'Number of studies'
    },
    // {
    //   key: 'EFFECT',
    //   label: 'Effect',
    //   tooltip: 'Direction of effect across studies'
    // },
    // {
    //   key: 'P_HETERO',
    //   label: 'P Hetero',
    //   tooltip: 'Heterogeneity p-value'
    // }
  ];

  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handleSNPClick = (row) => {
    onSNPClick({
      SNP_ID: row['#ID'],
      chromosome: row.CHR,
      position: row.POS,
      pvalue: row.P
    });
  };

  const formatValue = (value, type) => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (type) {
      case 'float4':
        return parseFloat(value).toFixed(4);
      case 'float2':
        return parseFloat(value).toFixed(2);
      case 'exp':
        return parseFloat(value).toExponential(2);
      case 'number':
        return parseInt(value).toLocaleString();
      default:
        return value;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search results..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span>
            Page {currentPage} of {Math.max(1, totalPages)}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map(header => (
                <th 
                  key={header.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center gap-1 group relative">
                    <span>{header.label}</span>
                    <Info 
                      size={14} 
                      className="text-gray-400"
                    />
                    <div className="hidden group-hover:block absolute left-0 transform translate-y-full bottom-0 bg-black text-white text-sm rounded px-2 py-1 w-48 z-10">
                      {header.tooltip}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((row, index) => (
              <tr 
                key={`${row['#ID']}-${index}`}
                className="hover:bg-gray-50 transition-colors"
              >
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                  onClick={() => handleSNPClick(row)}
                >
                  {row['#ID']}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.CHR}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatValue(row.POS, 'number')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.REF}</td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.ALT}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatValue(row.BETA, 'float4')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatValue(row.SE, 'float4')}</td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatValue(row.P, 'exp')}</td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatValue(row.LOG10P, 'float2')}</td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatValue(row.SE_LDSC, 'float4')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatValue(row.P_LDSC, 'exp')}</td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatValue(row.LOG10P_LDSC, 'float2')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatValue(row.AAF, 'float4')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatValue(row.AAC, 'float2')}</td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatValue(row.N, 'number')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.N_STUDY}</td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.EFFECT}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatValue(row.P_HETERO, 'float4')}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-500">
        Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredData.length)} of {filteredData.length} results
      </div>
    </div>
  );
};

export default TopResults;
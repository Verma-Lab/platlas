
import { useLocation } from 'react-router-dom';
import PheWASPlot from '../plots/PheWASPlot';
// import { TopResults } from '../plots/TopResults';
import Spinner from 'react-bootstrap/Spinner';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, BarChart2, Search, Network, Share2, Databasem, ChevronRight, ChevronLeft, Database } from 'lucide-react';
import RelatedPhenotypesSidebar from '../components/RelatedPhenotypesSidebar';
import GenerlaBar from '../components/GeneralNavBar';

const headers = [
  {
    key: 'SNP_ID',
    label: 'SNP ID',
    tooltip: 'Single Nucleotide Polymorphism identifier'
  },
  {
    key: 'phenotype',
    label: 'Phenotype',
    tooltip: 'Observable trait or disease being analyzed'
  },
  {
    key: 'chromosome',
    label: 'Chr',
    tooltip: 'Chromosome number where the SNP is located'
  },
  {
    key: 'position',
    label: 'Position',
    tooltip: 'Base pair position of the SNP on the chromosome'
  },
  {
    key: 'ref',
    label: 'Ref',
    tooltip: 'Reference allele (the original DNA sequence)'
  },
  {
    key: 'alt',
    label: 'Alt',
    tooltip: 'Alternative allele (the variant DNA sequence)'
  },
  {
    key: 'pvalue',
    label: 'P-value',
    tooltip: 'Statistical significance of the association'
  }
];


export const TopResults = ({ data, onSNPClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const rowsPerPage = 10;
  const navigate = useNavigate();

  const headers = [
    {
      key: 'category',
      label: 'Category',
      tooltip: 'Disease or trait category'
    },
    {
      key: 'phenotype',
      label: 'Phenotype',
      tooltip: 'Observable trait or disease being analyzed'
    },
    {
      key: 'chromosome',
      label: 'Chr',
      tooltip: 'Chromosome number where the SNP is located'
    },
    {
      key: 'position',
      label: 'Position',
      tooltip: 'Base pair position of the SNP on the chromosome'
    },
    {
      key: 'ref',
      label: 'Ref',
      tooltip: 'Reference allele (the original DNA sequence)'
    },
    {
      key: 'alt',
      label: 'Alt',
      tooltip: 'Alternative allele (the variant DNA sequence)'
    },
    {
      key: 'pvalue',
      label: 'P-value',
      tooltip: 'Statistical significance of the association'
    }
  ];

  const filteredData = data.filter(item => 
    item.phenotype?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handlePhenotypeClick = (phenotype) => {
    navigate(`/gwas/${phenotype}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search phenotypes..."
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
                      className="text-gray-400 cursor-pointer"
                    />
                    <span className="hidden group-hover:block absolute left-0 transform translate-y-full bottom-0 bg-black text-white text-sm rounded px-2 py-1 w-48 z-10">
                      {header.tooltip}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((row, index) => (
              <tr key={`${row.trait?.category}-${row.phenotype}-${index}`}>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-blue-600">
                    {row.trait?.category || 'Uncategorized'}
                  </span>
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                  onClick={() => handlePhenotypeClick(row.phenotype)}
                >
                  {row.phenotype}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.chromosome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.ref_allele}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.alt_allele}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.pvalue?.toExponential(2) || 'N/A'}
                </td>
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


const AnimatedDNA = () => (
  <div className="absolute right-0 top-0 h-full w-1/4 overflow-hidden opacity-25">
    <svg viewBox="0 0 100 200" className="h-full w-full">
      <path
        d="M30,10 Q50,50 30,90 Q10,130 30,170 Q50,210 30,250"
        stroke="rgba(255,255,255,0.5)"
        fill="none"
        strokeWidth="2"
      >
        <animate
          attributeName="d"
          dur="10s"
          repeatCount="indefinite"
          values="
            M30,10 Q50,50 30,90 Q10,130 30,170 Q50,210 30,250;
            M30,10 Q10,50 30,90 Q50,130 30,170 Q10,210 30,250;
            M30,10 Q50,50 30,90 Q10,130 30,170 Q50,210 30,250"
        />
      </path>
      <path
        d="M70,10 Q50,50 70,90 Q90,130 70,170 Q50,210 70,250"
        stroke="rgba(255,255,255,0.7)"
        fill="none"
        strokeWidth="2"
      >
        <animate
          attributeName="d"
          dur="10s"
          repeatCount="indefinite"
          values="
            M70,10 Q50,50 70,90 Q90,130 70,170 Q50,210 70,250;
            M70,10 Q90,50 70,90 Q50,130 70,170 Q90,210 70,250;
            M70,10 Q50,50 70,90 Q90,130 70,170 Q50,210 70,250"
        />
      </path>
    </svg>
  </div>
);

const StatsCard = ({ phewasData, snpAnnotation }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 -mt-10 mx-4 relative z-10">
      <div className="grid grid-cols-3 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Database className="w-4 h-4" />
            SNP Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                Position
              </span>
              <span className="text-sm font-medium text-gray-700">
                {phewasData.plot_data?.[0]?.position?.toLocaleString() || 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                Chromosome
              </span>
              <span className="text-sm font-medium text-gray-700">
                {phewasData.plot_data?.[0]?.chromosome || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Alleles
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                Reference
              </span>
              <span className="text-sm font-medium text-gray-700">
                {phewasData.plot_data?.[0]?.ref_allele || 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                Alternative
              </span>
              <span className="text-sm font-medium text-gray-700">
                {phewasData.plot_data?.[0]?.alt_allele || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* New Column for Gene and rsID */}
        {/* <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Annotation
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                Gene
              </span>
              <span className="text-sm font-medium text-gray-700">
                {snpAnnotation?.symbol || 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                rsID
              </span>
              <span className="text-sm font-medium text-gray-700">
                {snpAnnotation?.rsid || 'N/A'}
              </span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

const PheWASHeader = ({ selectedSNP, phewasData, onMenuClick, snpAnnotation }) => {
  return (
    <div className="w-full">
      <div 
        className="w-full relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
          borderRadius: '0 0 2rem 2rem'
        }}
      >
        <div className="max-w-7xl mx-auto px-8 py-12 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={onMenuClick}
                className="mr-6 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="flex items-center">
                <BarChart2 className="mr-4 h-10 w-10 text-white" />
                <div>
                  <div className="flex items-center">
                    <h1 className="text-4xl font-bold text-white mb-2 mr-4">
                      PheWAS Analysis Page
                    </h1>
                    <GenerlaBar />
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-100 mr-4">SNP:</span>
                    <span className="bg-white/20 px-4 py-2 rounded-lg text-white font-semibold text-lg mr-4">
                      {selectedSNP}
                    </span>
                    {snpAnnotation && (
                      <>
                        <span className="text-blue-100 mr-4">Gene:</span>
                        <span className="bg-white/20 px-4 py-2 rounded-lg text-white font-semibold text-lg mr-4">
                          {snpAnnotation.symbol || 'N/A'}
                        </span>
                        <span className="text-blue-100 mr-4">rsID:</span>
                        <span className="bg-white/20 px-4 py-2 rounded-lg text-white font-semibold text-lg">
                          {snpAnnotation.rsid || 'N/A'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatedDNA />

        <Network 
          className="absolute left-[10%] top-[20%] opacity-20"
          size={30}
          color="white"
          style={{
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <Share2 
          className="absolute right-[15%] bottom-[30%] opacity-20"
          size={24}
          color="white"
          style={{
            animation: 'float 6s ease-in-out infinite 1s'
          }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto">
        <StatsCard phewasData={phewasData} snpAnnotation={snpAnnotation} />
      </div>
    </div>
  );
};



const baseURL = process.env.FRONTEND_BASE_URL || 'http://localhost:5001/api'

const PheWASPage = () => {
  const location = useLocation();
  const { phewasData, selectedSNP } = location.state || {};
  const [formattedData, setFormattedData] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [snpAnnotation, setSnpAnnotation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDataAndAnnotation = async () => {
      setLoading(true);
      try {
        // Fetch phenotype mappings
        const response = await fetch(`/api/getPhenotypeMapping`);
        if (!response.ok) throw new Error('Failed to fetch phenotype mapping');
        const phenoMapping = await response.json();

        // Format the data with phenotype descriptions
        if (phewasData && phewasData.plot_data) {
          const formatted = phewasData.plot_data.map(item => ({
            trait: {
              name: item.phenotype,
              description: phenoMapping[item.phenotype]?.description || 'No description available',
              category: phenoMapping[item.phenotype]?.category || 'Uncategorized'
            },
            phenotype: item.phenotype,
            chromosome: item.chromosome,
            position: item.position,
            pvalue: item.pvalue,
            ref_allele: item.ref_allele,
            alt_allele: item.alt_allele
          }));
          setFormattedData(formatted);
        }

        // Fetch SNP annotation if we have chromosome and position
        // if (phewasData && phewasData.plot_data && phewasData.plot_data[0]) {
        //   const firstSNP = phewasData.plot_data[0];
        //   const annotationResponse = await fetch(
        //     `/api/getSNPAnnotation?chromosome=${firstSNP.chromosome}&position=${firstSNP.position}`
        //   );
        //   console.log(annotationResponse)
        //   if (annotationResponse.ok) {
        //     const annotationData = await annotationResponse.json();
        //     if (!annotationData.error) {
        //       setSnpAnnotation(annotationData);
        //     }
        //   }
        // }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback formatting without phenotype mapping
        if (phewasData && phewasData.plot_data) {
          const formatted = phewasData.plot_data.map(item => ({
            trait: {
              name: item.phenotype,
              description: 'No description available',
              category: 'Uncategorized'
            },
            phenotype: item.phenotype,
            chromosome: item.chromosome,
            position: item.position,
            pvalue: item.pvalue,
            ref_allele: item.ref_allele,
            alt_allele: item.alt_allele
          }));
          setFormattedData(formatted);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndAnnotation();
  }, [phewasData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!phewasData || !selectedSNP) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-gray-600">
          <h2 className="text-2xl font-semibold mb-2">No PheWAS Data Available</h2>
          <p>Please select a SNP from the GWAS analysis page to view PheWAS results.</p>
        </div>
      </div>
    );
  }

  const handleSNPClick = (snp) => {
    console.log("SNP clicked:", snp);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RelatedPhenotypesSidebar
        currentPhenoId={selectedSNP}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <PheWASHeader 
        selectedSNP={selectedSNP} 
        phewasData={phewasData} 
        onMenuClick={() => setIsSidebarOpen(true)}
        snpAnnotation={snpAnnotation}
      />
      
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="bg-white flex justify-center items-center rounded-lg shadow p-4 mb-6">
            <div className="overflow-hidden max-h-[600px] flex justify-center w-full">
              <PheWASPlot data={phewasData} selectedSNP={selectedSNP} />
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-800">SNP Details</h3>
            <TopResults data={formattedData} onSNPClick={handleSNPClick} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};
export default PheWASPage;
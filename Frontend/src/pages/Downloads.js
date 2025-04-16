import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Network, Share2, Download } from 'lucide-react';
import GenerlaBar from '../components/GeneralNavBar';
import _ from 'lodash';

const baseURL = process.env.FRONTEND_BASE_URL || 'http://localhost:5001/api';
const RESULTS_PER_PAGE = 50;

// Animated DNA component from HomePage
const AnimatedDNA = () => (
  <div className="position-absolute end-0 top-0 h-100 w-25 overflow-hidden opacity-25">
    <svg viewBox="0 0 100 200" className="h-100 w-100">
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

const DownloadsPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [phenotypeMetadata, setPhenotypeMetadata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [displayCount, setDisplayCount] = useState(RESULTS_PER_PAGE);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [selectedPhenotype, setSelectedPhenotype] = useState(null);
  
  // Demo download links
  const demoDownloads = [
    {
      phenotype: 'Phe_250',
      description: 'Heart rate',
      population: 'EUR',
      gwama: {
        gz: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_250.EUR.gwama.sumstats.txt.gz',
        tbi: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_250.EUR.gwama.sumstats.txt.gz.tbi'
      },
      mrmega: {
        gz: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_250.EUR.mrmega.sumstats.txt.gz',
        tbi: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_250.EUR.mrmega.sumstats.txt.gz.tbi'
      }
    },
    {
      phenotype: 'Phe_250_1',
      description: 'Heart rate variability',
      population: 'EUR',
      gwama: {
        gz: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_250_1.EUR.gwama.sumstats.txt.gz',
        tbi: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_250_1.EUR.gwama.sumstats.txt.gz.tbi'
      },
      mrmega: {
        gz: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_250_1.EUR.mrmega.sumstats.txt.gz',
        tbi: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_250_1.EUR.mrmega.sumstats.txt.gz.tbi'
      }
    },
    {
      phenotype: 'Phe_008',
      description: 'Weight',
      population: 'EUR',
      gwama: {
        gz: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_008.EUR.gwama.sumstats.txt.gz',
        tbi: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_008.EUR.gwama.sumstats.txt.gz.tbi'
      },
      mrmega: {
        gz: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_008.EUR.mrmega.sumstats.txt.gz',
        tbi: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_008.EUR.mrmega.sumstats.txt.gz.tbi'
      }
    },
    {
      phenotype: 'Phe_008_5',
      description: 'Body mass index',
      population: 'EUR',
      gwama: {
        gz: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_008_5.EUR.gwama.sumstats.txt.gz',
        tbi: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_008_5.EUR.gwama.sumstats.txt.gz.tbi'
      },
      mrmega: {
        gz: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_008_5.EUR.mrmega.sumstats.txt.gz',
        tbi: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_008_5.EUR.mrmega.sumstats.txt.gz.tbi'
      }
    },
    {
      phenotype: 'Phe_015_1',
      description: 'Blood pressure',
      population: 'EUR',
      gwama: {
        gz: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_015_1.EUR.gwama.sumstats.txt.gz',
        tbi: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_015_1.EUR.gwama.sumstats.txt.gz.tbi'
      },
      mrmega: {
        gz: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_015_1.EUR.mrmega.sumstats.txt.gz',
        tbi: 'https://g-fce312.fd635.8443.data.globus.org/sumstats/EUR/Phe_015_1.EUR.mrmega.sumstats.txt.gz.tbi'
      }
    }
  ];

  // Study selection modal component
  const StudyTypeModal = ({ onClose, item }) => {
    if (!item) return null;
    
    const handleSelectStudy = (studyType) => {
      // Create download URLs based on selected study type
      const baseUrl = `https://g-fce312.fd635.8443.data.globus.org/sumstats/${item.population}/${item.phenotype}.${item.population}.${studyType}.sumstats.txt`;
      const gzUrl = `${baseUrl}.gz`;
      const tbiUrl = `${baseUrl}.gz.tbi`;
      
      // Open the .gz file in a new tab
      window.open(gzUrl, '_blank');
      
      onClose();
    };
    
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Select Study Type</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">
            Select a study type to download summary statistics for:
            <br />
            <span className="font-medium">{item.phenotype}</span>
            {item.traitDescription && (
              <span> - {item.traitDescription}</span>
            )}
          </p>
          
          <div className="grid grid-cols-1 gap-3 mt-4">
            <button
              onClick={() => handleSelectStudy('gwama')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              GWAMA
            </button>
            <button
              onClick={() => handleSelectStudy('mrmega')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              MRMEGA
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mt-4">
            *Two files will be generated for each download: .gz and .gz.tbi
          </div>
        </div>
      </div>
    );
  };

  // Debounced search term updater
  const debouncedSetSearchTerm = useMemo(
    () => _.debounce((value) => setSearchTerm(value), 300),
    []
  );

  // Fetch phenotype metadata on mount
  useEffect(() => {
    const fetchPhenotypeMetadata = async () => {
      try {
        // const response = await fetch(`${baseURL}/getGWASMetadata`);
        const response = await fetch(`/api/getGWASMetadata`);


        if (!response.ok) throw new Error('Failed to fetch metadata');
        const data = await response.json();
        
        const searchableData = _.uniqBy(
          data.map(item => ({
            type: 'phenotype',
            phenotype: item.phenotype,
            traitDescription: item.traitDescription,
            category: item.category,
            population: item.population
          })),
          item => `${item.phenotype}-${item.population}`
        );

        setPhenotypeMetadata(searchableData);
      } catch (err) {
        console.error('Error fetching phenotype metadata:', err);
        // Fallback with sample data if API fails
        setPhenotypeMetadata([
          {
            type: 'phenotype',
            phenotype: 'Phe_008_5',
            traitDescription: 'Body mass index',
            category: 'Anthropometric',
            population: 'EUR'
          },
          {
            type: 'phenotype',
            phenotype: 'Phe_010_2',
            traitDescription: 'Waist circumference',
            category: 'Anthropometric',
            population: 'EUR'
          },
          {
            type: 'phenotype',
            phenotype: 'Phe_015_1',
            traitDescription: 'Blood pressure',
            category: 'Cardiovascular',
            population: 'EAS'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPhenotypeMetadata();
  }, []);

  // Memoized filtered results
  const filteredResults = useMemo(() => {
    if (!searchTerm) return [];
    
    const termLower = searchTerm.toLowerCase();
    
    // Show phenotype results
    const phenoResults = phenotypeMetadata
      .filter(item =>
        item.phenotype.toLowerCase().includes(termLower) ||
        (item.traitDescription && item.traitDescription.toLowerCase().includes(termLower)) ||
        (item.category && item.category.toLowerCase().includes(termLower))
      );

    return phenoResults.slice(0, displayCount);
  }, [phenotypeMetadata, searchTerm, displayCount]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetSearchTerm(value);
    setShowSuggestions(true);
  };

  const handleSelect = useCallback((item) => {
    setSelectedPhenotype(item);
    setShowStudyModal(true);
    setInputValue('');
    setSearchTerm('');
    setShowSuggestions(false);
  }, []);

  const handleScroll = useCallback((e) => {
    const element = e.target;
    if (
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50 &&
      filteredResults.length >= displayCount
    ) {
      setDisplayCount(prev => prev + RESULTS_PER_PAGE);
    }
  }, [filteredResults.length, displayCount]);

  return (
    <div className="relative">
      {/* Gradient Background Header - Matching HomePage style */}
      <div
        className="w-full pb-32 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F33E5 0%, #2563EB 100%)',
          borderRadius: '0 0 2rem 2rem'
        }}
      >
        {/* Header content */}
        <div className="max-w-7xl mx-auto px-4 pt-8 -mb-20">
          {/* Top section with Nav and Logo */}
          <div className="flex justify-between items-start -mt-10">
            {/* Logo and Title Section */}
            <div className="flex items-center -mt-19 cursor-pointer" onClick={() => window.location.href = "/platlas"}>
              <div>
                <img 
                  src="/images/platypushomepage.png"
                  alt="Platypus Logo" 
                  className="h-44 w-28 object-cover mt-2"
                />   
              </div>
              <div>
                <h1 className="text-3xl -ml-4 mt-5 font-bold text-white mb-2">
                  PLATLAS
                </h1>  
                <p className="text-blue-100 -ml-4 -mt-2 opacity-75">
                PLeiotropic ATLAS 
                </p>
              </div>
              <div className="flex-1 flex justify-center ml-10">
              <GenerlaBar />
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* Search Bar */}
        <div className="mb-8 relative">
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search phenotypes to download..."
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                        bg-white shadow-sm focus:outline-none focus:ring-2 
                        focus:ring-blue-500 focus:border-blue-500
                        text-sm placeholder-gray-400"
            />
          </div>
          
          {/* Dropdown suggestions */}
          {showSuggestions && searchTerm && (
            <div 
              className="absolute w-full bg-white border rounded-lg shadow-lg max-h-[172px] overflow-y-auto"
              style={{ zIndex: 9999, top: 'calc(100% + 6px)' }}
              onScroll={handleScroll}
            >
              {filteredResults.length > 0 ? (
                filteredResults.map((item, idx) => (
                  <div
                    key={`${item.phenotype}-${item.population}-${idx}`}
                    className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelect(item)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{item.phenotype}</div>
                        <div className="text-xs text-gray-600">{item.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs px-2 py-0.5 rounded-full text-gray-600">
                          {item.population}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">
                          {item.traitDescription}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-1.5 text-gray-500 text-sm">
                  No matches found
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Featured Downloads Section - No highlighted border */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Featured Downloads</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phenotype</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Population</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GWAMA Downloads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRMEGA Downloads</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {demoDownloads.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.phenotype}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.population}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        <a 
                          href={item.gwama.gz}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Download .gz
                        </a>
                        <a 
                          href={item.gwama.tbi}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Download .gz.tbi
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        <a 
                          href={item.mrmega.gz}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Download .gz
                        </a>
                        <a 
                          href={item.mrmega.tbi}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Download .gz.tbi
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>
              These are example phenotypes. Search above for more phenotypes to download.
              Each phenotype has data available in GWAMA and MRMEGA formats, with both .gz and .gz.tbi files.
            </p>
          </div>
        </section>
      </div>
      
      {/* Style for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
      
      {/* Study Type Selection Modal */}
      {showStudyModal && (
        <StudyTypeModal 
          onClose={() => setShowStudyModal(false)} 
          item={selectedPhenotype} 
        />
      )}
    </div>
  );
};

export default DownloadsPage;
// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import Form from 'react-bootstrap/Form';
// import { useNavigate } from 'react-router-dom';
// import { Search } from 'lucide-react';
// import _ from 'lodash';

// const baseURL = process.env.FRONTEND_BASE_URL || 'http://localhost:5001/api';
// const RESULTS_PER_PAGE = 50;

// export const SearchBar = () => {
//   const [inputValue, setInputValue] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [metadata, setMetadata] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [displayCount, setDisplayCount] = useState(RESULTS_PER_PAGE);
//   const navigate = useNavigate();

//   // Debounced search term updater
//   const debouncedSetSearchTerm = useMemo(
//     () => _.debounce((value) => setSearchTerm(value), 300),
//     []
//   );

//   useEffect(() => {
//     const fetchMetadata = async () => {
//       try {
//         // const response = await fetch(`/api/getGWASMetadata`);
//         const response = await fetch(`${baseURL}/getGWASMetadata`);

//         if (!response.ok) throw new Error('Failed to fetch metadata');
//         const data = await response.json();
        
//         // Process and deduplicate the data
//         const searchableData = _.uniqBy(
//           data.map(item => ({
//             phenotype: item.phenotype,
//             traitDescription: item.traitDescription,
//             category: item.category,
//             population: item.population
//           })),
//           item => `${item.phenotype}-${item.population}`
//         );

//         setMetadata(searchableData);
//       } catch (err) {
//         console.error('Error fetching metadata:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMetadata();
//   }, []);

//   // Memoized filtered results
//   const filteredResults = useMemo(() => {
//     if (!searchTerm) return [];
    
//     const termLower = searchTerm.toLowerCase();
//     return metadata
//       .filter(item =>
//         item.phenotype.toLowerCase().includes(termLower) ||
//         item.traitDescription.toLowerCase().includes(termLower) ||
//         item.category.toLowerCase().includes(termLower)
//       )
//       .slice(0, displayCount);
//   }, [metadata, searchTerm, displayCount]);

//   const handleInputChange = (e) => {
//     const value = e.target.value;
//     setInputValue(value);
//     debouncedSetSearchTerm(value);
//     setShowSuggestions(true);
//   };

//   const handleSelect = useCallback((item) => {
//     setInputValue('');
//     setSearchTerm('');
//     setShowSuggestions(false);
//     navigate(`/gwas/${item.phenotype}`, { state: { population: item.population } });
//   }, [navigate]);

//   const handleScroll = useCallback((e) => {
//     const element = e.target;
//     if (
//       element.scrollHeight - element.scrollTop <= element.clientHeight + 50 &&
//       filteredResults.length >= displayCount
//     ) {
//       setDisplayCount(prev => prev + RESULTS_PER_PAGE);
//     }
//   }, [filteredResults.length, displayCount]);

//   if (loading) {
//     return <div className="w-full text-center">Loading...</div>;
//   }

//   return (
//     <div className="relative w-full mb-8">
//       <div className="relative flex items-center">
//         <Search className="absolute left-3 h-5 w-5 text-gray-400 pointer-events-none" />
//         <input
//           type="text"
//           placeholder="Search phenotypes..."
//           value={inputValue}
//           onChange={handleInputChange}
//           onFocus={() => setShowSuggestions(true)}
//           className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
//                     bg-white shadow-sm focus:outline-none focus:ring-2 
//                     focus:ring-blue-500 focus:border-blue-500
//                     text-sm placeholder-gray-400"
//         />
//       </div>
      
//       {showSuggestions && searchTerm && (
//         <div 
//           className="absolute w-full bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto"
//           style={{
//             zIndex: 9999,
//             top: 'calc(100% + 4px)',
//           }}
//           onScroll={handleScroll}
//         >
//           {filteredResults.map((item, idx) => (
//             <div
//               key={`${item.phenotype}-${item.population}-${idx}`}
//               className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer flex justify-between"
//               onClick={() => handleSelect(item)}
//             >
//               <div>
//                 <div className="font-medium text-gray-900">{item.phenotype}</div>
//                 <div className="text-xs text-gray-600">{item.category}</div>
//               </div>
//               <div className="text-right">
//                 <div className="text-xs px-2 py-0.5 rounded-full text-gray-600">
//                   {item.population}
//                 </div>
//                 <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">
//                   {item.traitDescription}
//                 </div>
//               </div>
//             </div>
//           ))}
//           {filteredResults.length === 0 && (
//             <div className="px-3 py-1.5 text-gray-500 text-sm">No matches found</div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SearchBar;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import _ from 'lodash';

const baseURL = process.env.FRONTEND_BASE_URL || 'http://localhost:5001/api';
const RESULTS_PER_PAGE = 50;

export const SearchBar = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [phenotypeMetadata, setPhenotypeMetadata] = useState([]);
  const [snpResults, setSNPResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [displayCount, setDisplayCount] = useState(RESULTS_PER_PAGE);
  const navigate = useNavigate();

  // Create two separate debounced functions
  const debouncedSetSearchTermSlow = useMemo(
    () => _.debounce((value) => setSearchTerm(value), 300),
    []
  );

  const debouncedSetSearchTermFast = useMemo(
    () => _.debounce((value) => setSearchTerm(value), 100),
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
      } finally {
        setLoading(false);
      }
    };
    fetchPhenotypeMetadata();
  }, []);

  // Fetch SNP results when search term changes
  useEffect(() => {
    const fetchSNPResults = async () => {
      if (!searchTerm) {
        setSNPResults([]);
        return;
      }

      // Show results immediately for 'rs' prefix
      if (searchTerm.toLowerCase() === 'rs' || searchTerm.toLowerCase().startsWith('rs')) {
        try {
          // const response = await fetch(`${baseURL}/searchSNPs?term=${searchTerm}`);
          const response = await fetch(`/api/searchSNPs?term=${searchTerm}`);

          if (!response.ok) throw new Error('Failed to fetch SNP results');
          const data = await response.json();
          
          setSNPResults(data.results || []);
        } catch (err) {
          console.error('Error fetching SNP results:', err);
          setSNPResults([]);
        }
      } else {
        setSNPResults([]);
      }
    };

    fetchSNPResults();
  }, [searchTerm]);

  // Memoized filtered results combining phenotypes and SNPs
  const filteredResults = useMemo(() => {
    if (!searchTerm) return [];
    
    const termLower = searchTerm.toLowerCase();
    
    // If searching for RS IDs, only show SNP results
    if (termLower.startsWith('rs')) {
      return snpResults;
    }
    
    // Otherwise show phenotype results
    const phenoResults = phenotypeMetadata
      .filter(item =>
        item.phenotype.toLowerCase().includes(termLower) ||
        item.traitDescription.toLowerCase().includes(termLower) ||
        item.category.toLowerCase().includes(termLower)
      );

    return phenoResults.slice(0, displayCount);
  }, [phenotypeMetadata, snpResults, searchTerm, displayCount]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Use fast debounce for RS IDs, slow for everything else
    if (value.toLowerCase().startsWith('rs')) {
      debouncedSetSearchTermFast(value);
    } else {
      debouncedSetSearchTermSlow(value);
    }
    
    setShowSuggestions(true);
  };

  const handleSelect = useCallback(async (item) => {
    setInputValue('');
    setSearchTerm('');
    setShowSuggestions(false);
    
    if (item.type === 'phenotype') {
      navigate(`/gwas/${item.phenotype}`, { 
        state: { population: item.population } 
      });
    } else if (item.type === 'snp') {
      console.log('ITEMS')
      console.log(item)
      const snpData = {
        SNP_ID: item.rsId,
        chromosome: item.chromosome,
        position: item.position,
        internalId:item.internalId
      };

      // Try both study types
      const studies = ['gwama', 'mrmega'];

      for (const study of studies) {
        try {
            // const url = `${baseURL}/phewas?snp=${snpData.internalId}&chromosome=${snpData.chromosome}&position=${snpData.position}&study=${study}`;
            const url = `/api/phewas?snp=${snpData.internalId}&chromosome=${snpData.chromosome}&position=${snpData.position}&study=${study}`;
            const response = await fetch(url);
            
            if (response.status === 404) {
                continue; // Try next study type if no data found
            }
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.plot_data) {
                    navigate('/phewas', {
                        state: {
                            snpData,
                            selectedStudy: study
                        }
                    });
                    break; // Exit after finding valid data
                }
            }
        } catch (error) {
            console.warn(`Failed to fetch data for study ${study}:`, error);
        }
    }

      // If neither study type worked, navigate without a study type
      navigate('/phewas', {
        state: {
          snpData,
          selectedStudy: 'gwama' // Default to gwama if neither works
        }
      });
    }
}, [navigate]);

  const handleScroll = useCallback((e) => {
    const element = e.target;
    if (
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50 &&
      filteredResults.length >= displayCount
    ) {
      setDisplayCount(prev => prev + RESULTS_PER_PAGE);
    }
  }, [filteredResults.length, displayCount]);

  if (loading) {
    return <div className="w-full text-center">Loading...</div>;
  }

  return (
    <div className="relative w-full mb-8">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-5 w-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search phenotypes or SNPs (e.g., rs561109771)..."
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                    bg-white shadow-sm focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-blue-500
                    text-sm placeholder-gray-400"
        />
      </div>
      
      {showSuggestions && searchTerm && (
       <div 
       className="absolute w-full bg-white border rounded-lg shadow-lg max-h-[172px] overflow-y-auto"
       style={{ zIndex: 9999, top: 'calc(100% + 6px)' }}
       onScroll={handleScroll}
     >
          {filteredResults.length > 0 ? (
            filteredResults.map((item, idx) => (
              <div
                key={item.type === 'phenotype' ? 
                  `${item.phenotype}-${item.population}-${idx}` : 
                  `${item.rsId}-${idx}`}
                className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(item)}
              >
                {item.type === 'phenotype' ? (
                  // Phenotype result
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
                ) : (
                  // SNP result
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{item.rsId}</div>
                      <div className="text-xs text-gray-600">
                        Gene: {item.gene}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">
                        Chr{item.chromosome}:{item.position}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.consequence}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="px-3 py-1.5 text-gray-500 text-sm">
              {searchTerm.toLowerCase() === 'rs' ? 
                'Loading RS IDs...' : 
                'No matches found'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

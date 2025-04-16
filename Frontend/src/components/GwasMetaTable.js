import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  MapPin, 
  ArrowUpRight, 
  FileText, 
  Activity, 
  ChevronDown,
  Globe,
  BarChart,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Filter,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import _ from 'lodash';

const baseURL = process.env.FRONTEND_BASE_URL || 'http://localhost:5001/api';

/**
 * Function to get styles based on cohort name.
 */
const getCohortStyle = (cohort) => {
  const styles = {
    Meta: {
      tag: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white',
      bar: 'bg-gradient-to-r from-violet-500 to-purple-500',
      text: 'text-violet-700'
    },
    EUR: {
      tag: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      bar: 'bg-gradient-to-r from-blue-500 to-blue-600',
      text: 'text-blue-700'
    },
    EAS: {
      tag: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white',
      bar: 'bg-gradient-to-r from-emerald-500 to-green-600',
      text: 'text-emerald-700'
    },
    AFR: {
      tag: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
      bar: 'bg-gradient-to-r from-amber-500 to-orange-600',
      text: 'text-amber-700'
    },
    AMR: {
      tag: 'bg-gradient-to-r from-rose-500 to-red-600 text-white',
      bar: 'bg-gradient-to-r from-rose-500 to-red-600',
      text: 'text-rose-700'
    },
    default: {
      tag: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
      bar: 'bg-gradient-to-r from-gray-500 to-gray-600',
      text: 'text-gray-700'
    }
  };
  return styles[cohort] || styles.default;
};

/**
 * Component to display statistical values with labels and icons.
 */
const StatCell = ({ value, label, icon: Icon }) => (
  <motion.div 
    className="flex flex-col space-y-1"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <span className="text-lg font-bold text-gray-900">
      {new Intl.NumberFormat('en-US').format(value)}
    </span>
    <div className="flex items-center space-x-1 text-xs text-gray-500">
      {Icon && <Icon className="w-3 h-3" />}
      <span>{label}</span>
    </div>
  </motion.div>
);

/**
 * Modified SampleSizeCell component with progress bars
 */
const SampleSizeCell = ({ variants }) => {
  const sampleSizes = variants.reduce((acc, variant) => {
    if (!acc[variant.cohort]) {
      acc[variant.cohort] = variant.n_total;
    }
    return acc;
  }, {});

  // Find the maximum sample size for scaling the bars
  const maxSize = Math.max(...Object.values(sampleSizes));

  return (
    <div className="space-y-2">
      {Object.entries(sampleSizes).map(([cohort, size], idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-medium ${getCohortStyle(cohort).text}`}>{cohort}:</span>
            <span className="text-gray-600">{new Intl.NumberFormat('en-US').format(size)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full ${getCohortStyle(cohort).bar}`}
              style={{ width: `${(size / maxSize) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Updated CompactCohortCell component to show inline populations.
 */
const CompactCohortCell = ({ cohorts, onCohortClick, traitName }) => {
  return (
    <div className="flex flex-wrap gap-2 md:gap-2">
      {cohorts.map((cohort, idx) => (
        <motion.button
          key={idx}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCohortClick(traitName, cohort)}
          className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded-md text-xs font-medium ${getCohortStyle(cohort).tag}`}
        >
          {cohort}
        </motion.button>
      ))}
    </div>
  );
};

/**
 * Updated CompactLeadSNPCell with population information
 */
const CompactLeadSNPCell = ({ variants, onLeadSNPClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Group variants by population
  const variantsByPopulation = variants.reduce((acc, variant) => {
    if (!acc[variant.cohort]) {
      acc[variant.cohort] = [];
    }
    acc[variant.cohort].push(variant);
    return acc;
  }, {});
  
  return (
    <div className="relative">
      <motion.div 
        className="relative group"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div 
          className="p-2 md:p-3 rounded-lg bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 md:space-x-2">
              <span className="text-sm font-semibold text-gray-900">{variants.length}</span>
              <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full">variants</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </motion.div>
      
      {isExpanded && (
        <div 
          className="absolute left-0 mt-2 w-64 md:w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-2 space-y-2 z-50"
          style={{ 
            maxHeight: '300px', 
            overflowY: 'auto',
            top: '100%'
          }}
        >
          {Object.entries(variantsByPopulation).map(([population, populationVariants], popIdx) => (
            <div key={popIdx} className="space-y-2">
              <div className={`text-xs font-semibold px-2 py-1 rounded ${getCohortStyle(population).text} bg-gray-50`}>
                {population} ({populationVariants.length} variants)
              </div>
              
              {populationVariants.map((variant, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    onLeadSNPClick(variant);
                    setIsExpanded(false);
                  }}
                  className="p-2 hover:bg-gray-50 rounded cursor-pointer ml-2 border-l-2 border-gray-100"
                >
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">Chr{variant.lead_snp.position.chromosome}:{variant.lead_snp.position.position.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Activity className="w-3 h-3" />
                    <span>Log10P: {variant.lead_snp.log10p.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono truncate">{variant.lead_snp.rsid}</div>
                  <div className="mt-1 flex items-center space-x-2 text-xs text-gray-600">
                    <FileText className="w-3 h-3" />
                    <span>Studies: {variant.n_study}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * New StudiesBreakdownCell component to show studies per population.
 */
const StudiesPerPopCell = ({ studies }) => (
    <div className="space-y-1 md:space-y-2">
      {Object.entries(studies).map(([pop, studyInfo]) => (
        <div key={pop} className="flex items-center justify-between">
          <div className="flex items-center space-x-1 md:space-x-2">
            <Globe className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
            <span className={`text-xs md:text-sm md:ml-2 ${getCohortStyle(pop).text}`}>
              {pop}:
            </span>
          </div>
          <span className="text-xs md:text-sm md:-ml-2 md:right-2 text-gray-600">
            {studyInfo}
          </span>
        </div>
      ))}
    </div>
  );

const StudiesBreakdownCell = ({ popGwasData, studies }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="relative">
      <motion.div 
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{studies} studies</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </motion.div>
      
      {isExpanded && (
        <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg border p-3 min-w-[200px]">
          {Object.entries(popGwasData).map(([pop, count]) => (
            <div key={pop} className="flex justify-between items-center py-1">
              <span className={`text-sm ${getCohortStyle(pop).text}`}>{pop}:</span>
              <span className="text-sm text-gray-600">{count} studies</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterPopover = ({ column, options, selectedValues, onChange, onClose, anchorRef }) => {
  const popoverRef = useRef(null);
  
  useEffect(() => {
    if (anchorRef && popoverRef.current) {
      const buttonRect = anchorRef.getBoundingClientRect();
      const popover = popoverRef.current;
      
      popover.style.position = 'fixed';
      popover.style.top = `${buttonRect.bottom + 8}px`;
      popover.style.left = `${buttonRect.left}px`;
      popover.style.width = '280px';
      popover.style.maxHeight = '400px';
      popover.style.zIndex = '51';
    }
  }, [anchorRef]);

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/5"
        onClick={onClose}
        style={{ zIndex: 50 }}
      />
      
      <div 
        ref={popoverRef}
        className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
      >
        <div className="flex justify-between items-center p-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700">Filter {column}</span>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 max-h-[320px] overflow-y-auto">
          <div className="space-y-2">
            {options.map((option, idx) => (
              <label 
                key={idx} 
                className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter(val => val !== option);
                    onChange(newValues);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const ColumnHeader = ({ title, onSort, sortConfig, hasSort = true }) => {
  return (
    <th className="px-6 py-3 text-left">
      <div className="flex items-center space-x-2">
        {hasSort ? (
          <button 
            onClick={onSort}
            className="group flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span>{title}</span>
            <ArrowUpDown className={`w-4 h-4 ${
              sortConfig?.key === title.toLowerCase() 
                ? 'text-blue-600' 
                : 'text-gray-400 group-hover:text-gray-600'
            }`} />
          </button>
        ) : (
          <span className="text-sm font-medium text-gray-700">{title}</span>
        )}
      </div>
    </th>
  );
};

// Mobile card view component for each item
const MobileCard = ({ item, onCohortClick, onLeadSNPClick }) => {
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="space-y-3">
        {/* Trait and Category */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900">{item.trait.name}</h3>
            <p className="text-xs text-gray-500">{item.trait.description}</p>
          </div>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100">
            {item.category}
          </span>
        </div>
        
        {/* Populations */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Populations:</div>
          <CompactCohortCell 
            cohorts={item.cohorts}
            onCohortClick={onCohortClick}
            traitName={item.trait.name}
          />
        </div>
        
        {/* Lead SNPs */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Lead SNPs:</div>
          <CompactLeadSNPCell 
            variants={item.variants}
            onLeadSNPClick={onLeadSNPClick}
          />
        </div>
        
        {/* Sample Sizes */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Sample Sizes:</div>
          <SampleSizeCell variants={item.variants} />
        </div>
        
        {/* Studies */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Studies:</div>
          <StudiesPerPopCell studies={item.studies_by_pop} />
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Main component to display the Lead Variants Table.
 */
const LeadVariantsTable = () => {
  const [data, setData] = useState([]);
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'leadsnps', direction: 'desc' });
  const [filters, setFilters] = useState({
    category: [],
    populations: [],
    leadsnps: [],
    studies: []
  });
  const [activeFilter, setActiveFilter] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const [filterAnchorRef, setFilterAnchorRef] = useState(null);

  const handleFilterClick = (columnKey) => {
    const buttonRef = filterRefs[columnKey].current;
    setFilterAnchorRef(buttonRef);
    setActiveFilter(activeFilter === columnKey ? null : columnKey);
  };
  
  const filterRefs = {
    category: useRef(null),
    populations: useRef(null),
    leadsnps: useRef(null),
    studies: useRef(null)
  };
  
  const navigate = useNavigate();
  
  // Check if we're on a mobile screen
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getSortValue = (item, key) => {
    switch (key) {
      case 'trait':
        return item.trait.name.toLowerCase();
      case 'category':
        return item.category.toLowerCase();
      case 'populations':
        return item.cohorts.length;
      case 'leadsnps':
        return item.variants.length;
      case 'studies':
        return Object.values(item.studies_by_pop).reduce((a, b) => a + b, 0);
      default:
        return item[key];
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return groupedData;
    
    return [...groupedData].sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [groupedData, sortConfig]);

  const filteredData = React.useMemo(() => {
    return sortedData.filter(item => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        item.trait.name?.toLowerCase().includes(searchLower) ||
        item.trait.description?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower);

      // Column filters
      const matchesCategory = filters.category.length === 0 || 
        filters.category.includes(item.category);
      
      const matchesPopulations = filters.populations.length === 0 ||
        item.cohorts.some(cohort => filters.populations.includes(cohort));
      
      const matchesLeadSnps = filters.leadsnps.length === 0 ||
        filters.leadsnps.includes(item.variants.length.toString());
      
      const totalStudies = Object.values(item.studies_by_pop).reduce((a, b) => a + b, 0);
      const matchesStudies = filters.studies.length === 0 ||
        filters.studies.includes(totalStudies.toString());

      return matchesSearch && matchesCategory && matchesPopulations && 
             matchesLeadSnps && matchesStudies;
    });
  }, [sortedData, searchTerm, filters]);

  // Get unique values for filters
  const getFilterOptions = (key) => {
    const options = new Set();
    groupedData.forEach(item => {
      switch (key) {
        case 'category':
          options.add(item.category);
          break;
        case 'populations':
          item.cohorts.forEach(cohort => options.add(cohort));
          break;
        case 'leadsnps':
          options.add(item.variants.length.toString());
          break;
        case 'studies':
          const totalStudies = Object.values(item.studies_by_pop)
            .reduce((a, b) => a + b, 0);
          options.add(totalStudies.toString());
          break;
      }
    });
    return Array.from(options).sort();
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/getLeadVariants`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const leadVariants = await response.json();
        
        // Process data with studies per population
        const processedData = leadVariants.reduce((acc, item) => {
          const key = item.trait.name;
          if (!acc[key]) {
            acc[key] = {
              trait: item.trait,
              category: item.category,
              cohorts: new Set(),
              variants: [],
              total_samples: 0,
              studies_by_pop: {}  // Track studies by population
            };
          }
          
          acc[key].cohorts.add(item.cohort);
          acc[key].variants.push(item);
          acc[key].total_samples += item.n_total;
          
          // Store studies count per population
          if (!acc[key].studies_by_pop[item.cohort]) {
            acc[key].studies_by_pop[item.cohort] = item.n_study;
          }
          
          return acc;
        }, {});
        
        setGroupedData(Object.values(processedData).map(group => ({
          ...group,
          cohorts: Array.from(group.cohorts)
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /**
   * Handler for cohort button clicks.
   */
  const handleCohortClick = (traitName, cohort) => {
    navigate(`/gwas/${traitName}`, { state: { selectedCohort: cohort } });
  };

  /**
   * Handler for Lead SNP clicks.
   */
  const handleLeadSNPClick = async (data) => {
    try {
      const snpData = {
        SNP_ID: data.lead_snp.rsid,
        chromosome: data.lead_snp.position.chromosome,
        position: data.lead_snp.position.position
      };

      const url = `/api/phewas?snp=${snpData.SNP_ID}&chromosome=${snpData.chromosome}&position=${snpData.position}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const phewasData = await response.json();

      navigate('/phewas', { 
        state: { 
          phewasData: phewasData, 
          selectedSNP: snpData.SNP_ID,
          originalData: data
        } 
      });
    } catch (error) {
      console.error('Error fetching PheWAS data:', error);
    }
  };

  /**
   * Pagination logic.
   */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">
        Error loading data: {error}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Search and Pagination Bar - Desktop */}
      <motion.div 
        className="hidden md:flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
      >
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by phenotype ID or trait..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 z-index 40 pr-4 py-2 w-80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {filteredData.length} results | Page {currentPage} of {totalPages}
          </span>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Search Bar - Mobile Only */}
      <div className="md:hidden bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search phenotype or trait..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Desktop Filter Bar */}
      <div className="hidden md:block bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <div className="flex space-x-2">
            <button
              ref={filterRefs.category}
              onClick={() => handleFilterClick('category')}
              className={`flex items-center px-3 py-2 rounded-lg border bg-gradient-to-r from-emerald-500 to-green-500 text-white${
                filters.category.length > 0 
                  ? 'border-blue-200 bg-blue-50 text-white' 
                  : 'border-gray-200 text-white hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <span className="text-sm">Category</span>
              {filters.category.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 px-2 rounded-full text-xs">
                  {filters.category.length}
                </span>
              )}
            </button>

            <button
              ref={filterRefs.populations}
              onClick={() => handleFilterClick('populations')}
              className={`flex items-center px-3 py-2 rounded-lg border bg-gradient-to-r from-blue-500 to-blue-600 text-white${
                filters.populations.length > 0 
                  ? 'border-blue-200 bg-blue-50 text-white' 
                  : 'border-gray-200 text-white hover:bg-gray-50'
              }`}
            >
              <Globe className="w-4 h-4 mr-2" />
              <span className="text-sm">Populations</span>
              {filters.populations.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 px-2 rounded-full text-xs">
                  {filters.populations.length}
                </span>
              )}
            </button>

            <button
              ref={filterRefs.leadsnps}
              onClick={() => handleFilterClick('leadsnps')}
              className={`flex items-center px-3 py-2 rounded-lg border bg-gradient-to-r from-red-400 to-red-600 text-white${
                filters.leadsnps.length > 0 
                  ? 'border-blue-200 bg-blue-50 text-white' 
                  : 'border-gray-200 text-white hover:bg-gray-50'
              }`}
            >
              <Activity className="w-4 h-4 mr-2" />
              <span className="text-sm">Lead SNPs</span>
              {filters.leadsnps.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 px-2 rounded-full text-xs">
                  {filters.leadsnps.length}
                </span>
              )}
            </button>

            <button
              ref={filterRefs.studies}
              onClick={() => handleFilterClick('studies')}
              className={`flex items-center px-3 py-2 rounded-lg border bg-gradient-to-r from-orange-500 to-orange-600 text-white${
                filters.studies.length > 0 
                  ? 'border-blue-200 bg-blue-50 text-white' 
                  : 'border-gray-200 text-white hover:bg-gray-50'
              }`}
            >
              <BarChart className="w-4 h-4 mr-2" />
              <span className="text-sm">Studies</span>
              {filters.studies.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 px-2 rounded-full text-xs">
                  {filters.studies.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filters Toggle + Status Bar */}
      <div className="md:hidden flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center">
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center space-x-1 text-gray-700"
          >
            <Filter className="w-4 h-4" />
            <span className="text-xs font-medium">Filters</span>
            {Object.values(filters).some(f => f.length > 0) && (
              <span className="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {Object.values(filters).filter(f => f.length > 0).length}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center justify-end">
          <span className="text-xs text-gray-600 mr-2">
            {filteredData.length} results | Page {currentPage} of {totalPages}
          </span>
          <div className="flex">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1 rounded ${currentPage === 1 ? 'text-gray-300' : 'text-gray-600 bg-gray-100'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1 rounded ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-600 bg-gray-100'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Filters Panel */}
      {showMobileFilters && (
        <div className="md:hidden bg-white p-3 rounded-lg shadow-sm border border-gray-100 space-y-2">
          <button
            ref={filterRefs.category}
            onClick={() => handleFilterClick('category')}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white"
          >
            <span className="text-xs">Category</span>
            {filters.category.length > 0 && (
              <span className="bg-white text-green-600 px-2 rounded-full text-xs">
                {filters.category.length}
              </span>
            )}
          </button>

          <button
            ref={filterRefs.populations}
            onClick={() => handleFilterClick('populations')}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white"
          >
            <span className="text-xs">Populations</span>
            {filters.populations.length > 0 && (
              <span className="bg-white text-blue-600 px-2 rounded-full text-xs">
                {filters.populations.length}
              </span>
            )}
          </button>

          <button
            ref={filterRefs.leadsnps}
            onClick={() => handleFilterClick('leadsnps')}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-gradient-to-r from-red-400 to-red-600 text-white"
          >
            <span className="text-xs">Lead SNPs</span>
            {filters.leadsnps.length > 0 && (
              <span className="bg-white text-red-600 px-2 rounded-full text-xs">
                {filters.leadsnps.length}
              </span>
            )}
          </button>

          <button
            ref={filterRefs.studies}
            onClick={() => handleFilterClick('studies')}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white"
          >
            <span className="text-xs">Studies</span>
            {filters.studies.length > 0 && (
              <span className="bg-white text-orange-600 px-2 rounded-full text-xs">
                {filters.studies.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {currentItems.map((group, idx) => (
          <MobileCard
            key={idx}
            item={group}
            onCohortClick={handleCohortClick}
            onLeadSNPClick={handleLeadSNPClick}
          />
        ))}
      </div>

      {/* Lead Variants Table - Desktop Only */}
      <motion.div className="hidden md:block bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { title: 'Trait', key: 'trait', hasFilter: false, hasSort: false },
                  { title: 'Category', key: 'category' },
                  { title: 'Populations', key: 'populations' },
                  { title: 'Lead SNPs', key: 'leadsnps' },
                  { title: 'Sample Sizes', key: 'samplesize', hasFilter: false },
                  { title: 'Studies', key: 'studies' }
                ].map(({ title, key, hasFilter = true, hasSort = true }) => (
                  <ColumnHeader
                    key={key}
                    title={title}
                    onSort={() => handleSort(key)}
                    sortConfig={sortConfig}
                    hasSort={hasSort}
                  />
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((group, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <motion.div className="flex flex-col space-y-1">
                      <span className="text-sm font-semibold text-gray-900">{group.trait.name}</span>
                      <span className="text-xs text-gray-500">{group.trait.description}</span>
                    </motion.div>
                  </td>

                  <td className="px-6 py-4">
                    <motion.span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100">
                      {group.category}
                    </motion.span>
                  </td>

                  <td className="px-6 py-4">
                    <CompactCohortCell 
                      cohorts={group.cohorts}
                      onCohortClick={handleCohortClick}
                      traitName={group.trait.name}
                    />
                  </td>

                  <td className="px-6 py-4">
                    <CompactLeadSNPCell 
                      variants={group.variants}
                      onLeadSNPClick={handleLeadSNPClick}
                    />
                  </td>

                  <td className="px-6 py-4">
                    <SampleSizeCell variants={group.variants} />
                  </td>

                  <td className="px-6 py-4">
                    <StudiesPerPopCell studies={group.studies_by_pop} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {activeFilter && (
        <FilterPopover
          column={activeFilter}
          options={getFilterOptions(activeFilter)}
          selectedValues={filters[activeFilter]}
          onChange={(newValues) => setFilters({ ...filters, [activeFilter]: newValues })}
          onClose={() => {
            setActiveFilter(null);
            setFilterAnchorRef(null);
          }}
          anchorRef={filterAnchorRef}
        />
      )}
    </motion.div>
  );
};

export default LeadVariantsTable;
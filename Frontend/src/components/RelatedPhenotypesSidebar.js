import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ChevronDown, Search, Target, ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const baseURL = process.env.FRONTEND_BASE_URL || 'http://localhost:5001/api';
const TOP_VARIANTS_PER_CATEGORY = 5;

const RelatedPhenotypesSidebar = ({ currentPhenoId, isOpen, onClose }) => {
  const [leadVariants, setLeadVariants] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchLeadVariants = async () => {
      setLoading(true);
      try {
        // const response = await fetch(`${baseURL}/getLeadVariants`);
        const response = await fetch(`/api/getLeadVariants`);

        if (response.ok) {
          const data = await response.json();
          
          const groupedVariants = data.reduce((acc, variant) => {
            if (variant.trait.name !== currentPhenoId) {
              const category = variant.category || 'Uncategorized';
              if (!acc[category]) {
                acc[category] = [];
              }
              acc[category].push(variant);
            }
            return acc;
          }, {});

          Object.keys(groupedVariants).forEach(category => {
            groupedVariants[category].sort((a, b) => b.lead_snp.count - a.lead_snp.count);
            groupedVariants[category] = groupedVariants[category].slice(0, TOP_VARIANTS_PER_CATEGORY);
          });

          setLeadVariants(groupedVariants);
          // Expand the first category by default
          if (Object.keys(groupedVariants).length > 0) {
            setExpandedCategories(new Set([Object.keys(groupedVariants)[0]]));
          }
        }
      } catch (error) {
        console.error('Failed to fetch lead variants:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchLeadVariants();
    }
  }, [currentPhenoId, isOpen]);

  const handleVariantClick = (trait) => {
    navigate(`/gwas/${trait}`);
    onClose();
  };

  const handleGoBack = () => {
    navigate(-1);
    onClose();
  };

  const handleGoHome = () => {
    navigate('/');
    onClose();
  };

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const filterVariants = () => {
    if (!searchTerm) return leadVariants;

    const filteredGroups = {};
    Object.entries(leadVariants).forEach(([category, variants]) => {
      const filtered = variants.filter(variant =>
        variant.trait.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        variant.trait.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        filteredGroups[category] = filtered;
      }
    });
    return filteredGroups;
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ width: '400px' }}
    >
      <div className="h-full flex flex-col bg-white shadow-2xl">
        {/* Gradient Header */}
        <div 
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
          }}
        >
          <div className="px-6 py-8 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    navigate(-1);
                    onClose();
                  }}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  title="Go Back"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => {
                    navigate('/');
                    onClose();
                  }}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  title="Go Home"
                >
                  <Home className="w-5 h-5 text-white" />
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-white">Lead Variants</h2>
            <p className="text-blue-100 mt-1">Browse by category</p>
          </div>

          {/* DNA Animation Background - matching main page */}
          <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden opacity-25">
            <svg viewBox="0 0 100 200" className="h-full w-full">
              <path
                d="M30,10 Q50,50 30,90 Q10,130 30,170 Q50,210 30,250"
                stroke="rgba(255,255,255,0.5)"
                fill="none"
                strokeWidth="2"
              />
              <path
                d="M70,10 Q50,50 70,90 Q90,130 70,170 Q50,210 70,250"
                stroke="rgba(255,255,255,0.7)"
                fill="none"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search variants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3 p-3">
              {Object.entries(filterVariants()).map(([category, variants]) => (
                <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-100">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-800">{category}</span>
                    {expandedCategories.has(category) ? 
                      <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    }
                  </button>
                  
                  {expandedCategories.has(category) && (
                    <div className="divide-y divide-gray-100">
                      {variants.map((variant, index) => (
                        <button
                          key={`${variant.trait.name}-${index}`}
                          onClick={() => handleVariantClick(variant.trait.name)}
                          className="w-full flex flex-col p-4 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800 text-left">{variant.trait.name}</p>
                              <p className="text-xs text-gray-600 text-left mt-1 line-clamp-2">{variant.trait.description}</p>
                            </div>
                            <Target className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                              {variant.lead_snp.count} Lead SNPs
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                              {variant.n_study} Studies
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default RelatedPhenotypesSidebar;
import React, { useState, useEffect } from 'react';
import { BarChart2, Target, Network } from 'lucide-react';
const baseURL = process.env.FRONTEND_BASE_URL || 'http://localhost:5001/api'

const LeadVariantStats = ({ phenoId, selectedCohort }) => {
  const [leadVariantData, setLeadVariantData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeadVariants = async () => {
      try {
        // const response = await fetch(`${baseURL}/getLeadVariants`);
        const response = await fetch(`/api/getLeadVariants`);

        if (!response.ok) throw new Error('Failed to fetch data');
        const allVariants = await response.json();
        
        // Filter variants for current phenotype and cohort
        const relevantVariants = allVariants.filter(variant => 
          variant.trait.name === phenoId && variant.cohort === selectedCohort
        );

        if (relevantVariants.length > 0) {
          setLeadVariantData({
            total_variants: relevantVariants.length,
            most_significant: Math.max(...relevantVariants.map(v => v.lead_snp.log10p)),
            total_studies: relevantVariants.reduce((sum, v) => sum + v.n_study, 0)
          });
        }
      } catch (error) {
        console.error('Error fetching lead variants:', error);
      } finally {
        setLoading(false);
      }
    };

    if (phenoId && selectedCohort) {
      fetchLeadVariants();
    }
  }, [phenoId, selectedCohort]);

  if (loading || !leadVariantData) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-8 p-6 bg-white rounded-lg shadow-lg -mt-10 mx-4 relative z-10">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
          <BarChart2 className="w-4 h-4" />
          Lead Variants
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
              Total
            </span>
            <span className="text-sm font-medium text-gray-700">
              {leadVariantData.total_variants} variants
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Most Significant
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-emerald-500 to-green-500 text-white">
              -log10(p)
            </span>
            <span className="text-sm font-medium text-gray-700">
              {leadVariantData.most_significant.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
          <Network className="w-4 h-4" />
          Studies
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              Total
            </span>
            <span className="text-sm font-medium text-gray-700">
              {leadVariantData.total_studies} studies
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadVariantStats;
import React, { useState, useEffect, useMemo,useRef } from 'react';
import { useParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal'; // Import Modal for pop-up
import Button from 'react-bootstrap/Button'; // Import Button for Modal
import { Manhattan } from '../plots/Manhattan';
import { QQ } from '../plots/QQ';
import { TopResults } from '../plots/TopResults';
import { Hudson } from '../plots/Hudson';
import { OptionBar } from '../components/OptionBar';
import AncestryFilter from '../components/CohortFilters';
import PheWASPlot from '../plots/PheWASPlot';
import { useNavigate } from 'react-router-dom';
import QQPlotView from '../components/QQPlotView';
import classNames from 'classnames';
import { FaInfoCircle, FaChartLine, FaChartBar } from 'react-icons/fa';
import {
  RefreshCcw,
  Search,
  TrendingUp,
  Target,
  ShoppingBag,
  Share2,
  AlertCircle,
  Clock,
  Car,
  BarChart3,
  ExternalLink,
  Info,
  ClipboardCheck,
  Users,
  BarChart2,
  Network,
  ChevronDown, ChevronUp,
  ArrowBigDown,
  Download
} from 'lucide-react';
import { Database, ChevronRight } from 'lucide-react';
import RelatedPhenotypesSidebar from '../components/RelatedPhenotypesSidebar';
import LeadVariantStats from '../components/LeadVariantsStats';
import NavigationBar from '../components/NavigationBar';
import GenerlaBar from '../components/GeneralNavBar';
const baseURL = process.env.FRONTEND_BASE_URL || 'http://localhost:5001/api'

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

// const StatsBar = ({ phenoStats, leadVariants }) => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isSnpExpanded, setIsSnpExpanded] = useState(false);
  
//   // Group SNP counts by analysis type
//   const groupedSNPs = useMemo(() => {
//     const snps = phenoStats.snps_by_cohort || {};
//     return {
//       gwama: Object.entries(snps)
//         .filter(([cohort]) => cohort !== 'ALL')
//         .reduce((acc, [cohort, count]) => ({...acc, [cohort]: count}), {}),
//       mrmega: snps['ALL'] || 0
//     };
//   }, [phenoStats.snps_by_cohort]);

//   // Calculate total sample size
//   const totalSampleSize = Object.values(phenoStats.samples_by_cohort || {})[0] || 0;
  
//   // Calculate total SNPs across all cohorts
//   const totalSnps = Object.values(groupedSNPs.gwama).reduce((sum, count) => sum + count, 0) + groupedSNPs.mrmega;

//   // Get cohort badge color
//   const getCohortColor = (cohort) => {
//     const colors = {
//       'EUR': 'from-blue-500 to-blue-600',
//       'EAS': 'from-emerald-500 to-emerald-600',
//       'AFR': 'from-amber-500 to-amber-600',
//       'AMR': 'from-rose-500 to-rose-600',
//       'SAS': 'from-purple-500 to-purple-600',
//       'ALL': 'from-indigo-500 to-indigo-600',
//     };
//     return colors[cohort] || 'from-gray-500 to-gray-600';
//   };

//   return (
//     <div className="grid grid-cols-3 gap-8 p-6 bg-white rounded-lg shadow-lg -mt-10 mx-4 relative z-10">
//       {/* SNPs Size - Redesigned with collapsible UI */}
//       <div className="space-y-2">
//         <div className="flex items-center justify-between">
//           <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//             <Database className="w-4 h-4" />
//             SNPs Size
//           </h3>
//           <button 
//             onClick={() => setIsSnpExpanded(!isSnpExpanded)}
//             className="text-blue-600 hover:text-blue-800 text-xs font-medium"
//           >
//             {isSnpExpanded ? 'Collapse' : 'View details'}
//           </button>
//         </div>
        
//         {/* Main SNP counter */}
//         <div className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium flex justify-between items-center">
//           <span>Total SNPs</span>
//           <ArrowBigDown/>
//           {/* <span className="text-lg">{totalSnps.toLocaleString()}</span> */}
//         </div>
        
//         {/* Expandable detail section */}
//         {isSnpExpanded && (
//           <div className="mt-2 space-y-1.5 bg-gray-50 p-2 rounded-md max-h-48 overflow-y-auto">
//             {/* GWAMA SNPs by cohort */}
//             {Object.entries(groupedSNPs.gwama).map(([cohort, count]) => (
//               <div 
//                 key={cohort} 
//                 className="flex justify-between items-center px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-100"
//               >
//                 <div className="flex items-center">
//                   <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${getCohortColor(cohort)} mr-2`}></span>
//                   <span>GWAMA {cohort}</span>
//                 </div>
//                 <span>{count.toLocaleString()}</span>
//               </div>
//             ))}
            
//             {/* MR-MEGA SNPs */}
//             {groupedSNPs.mrmega > 0 && (
//               <div className="flex justify-between items-center px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-100">
//                 <div className="flex items-center">
//                   <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 mr-2"></span>
//                   <span>MR-MEGA</span>
//                 </div>
//                 <span>{groupedSNPs.mrmega.toLocaleString()}</span>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Sample Size */}
//       <div className="space-y-4">
//         <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//           <Users className="w-4 h-4" />
//           Sample Size
//         </h3>
//         <div className="flex items-center space-x-2">
//           <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-lg font-medium">
//             {totalSampleSize.toLocaleString()} <span className='text-sm p-2'>samples</span>
//           </span>
//         </div>
//       </div>

//       {/* Lead Variants */}
//       <div className="relative">
//         <div className="space-y-4">
//           <button
//             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//             className="w-full flex items-center justify-between text-sm font-semibold text-gray-600 hover:text-gray-800"
//           >
//             <div className="flex items-center gap-2">
//               <Target className="w-4 h-4" />
//               Lead Variants ({leadVariants?.length || 0})
//             </div>
//             {isDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//           </button>

//           {isDropdownOpen && (
//             <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-50 max-h-64 overflow-y-auto">
//               <div className="space-y-3">
//                 {leadVariants?.map((variant, index) => (
//                   <div key={index} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-200">
//                         {variant.cohort}
//                       </span>
//                       <span className="text-sm font-medium text-gray-700">
//                         {variant.rsid}
//                       </span>
//                     </div>
//                     <div className="text-xs text-gray-500 pl-2 flex items-center gap-4">
//                       <span>-log10(p): {variant.log10p.toFixed(2)}</span>
//                       <span>• {variant.n_study} studies</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

const StatsBar = ({ phenoStats, leadVariants, phenoId, selectedCohort, selectedStudy }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSnpExpanded, setIsSnpExpanded] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  
  // Group SNP counts by analysis type
  const groupedSNPs = useMemo(() => {
    const snps = phenoStats.snps_by_cohort || {};
    return {
      gwama: Object.entries(snps)
        .filter(([cohort]) => cohort !== 'ALL')
        .reduce((acc, [cohort, count]) => ({...acc, [cohort]: count}), {}),
      mrmega: snps['ALL'] || 0
    };
  }, [phenoStats.snps_by_cohort]);

  // Calculate total sample size
  const totalSampleSize = Object.values(phenoStats.samples_by_cohort || {})[0] || 0;
  
  // Calculate total SNPs across all cohorts
  const totalSnps = Object.values(groupedSNPs.gwama).reduce((sum, count) => sum + count, 0) + groupedSNPs.mrmega;

  // Generate download links based on current phenotype, cohort, and study
  const generateDownloadLinks = () => {
    const population = selectedCohort || 'ALL';
    const studyType = selectedStudy || 'gwama';
    
    // Base URL pattern from DownloadsPage
    const baseUrl = `https://g-fce312.fd635.8443.data.globus.org/sumstats/${population}/${phenoId}.${population}.${studyType}.sumstats.txt`;
    
    return {
      gz: `${baseUrl}.gz`,
      tbi: `${baseUrl}.gz.tbi`
    };
  };

  // Get download links
  const downloadLinks = generateDownloadLinks();

  // Get cohort badge color
  const getCohortColor = (cohort) => {
    const colors = {
      'EUR': 'from-blue-500 to-blue-600',
      'EAS': 'from-emerald-500 to-emerald-600',
      'AFR': 'from-amber-500 to-amber-600',
      'AMR': 'from-rose-500 to-rose-600',
      'SAS': 'from-purple-500 to-purple-600',
      'ALL': 'from-indigo-500 to-indigo-600',
    };
    return colors[cohort] || 'from-gray-500 to-gray-600';
  };

  // Download Modal component
  const DownloadModal = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Download Summary Statistics</h3>
          <button onClick={() => setShowDownloadModal(false)} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600">
            Download summary statistics for:
          </p>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <div className="font-medium">{phenoId}</div>
            <div className="flex space-x-2 mt-1">
              <span className="px-2 py-0.5 bg-gray-200 rounded text-xs">
                {selectedCohort} Population
              </span>
              <span className="px-2 py-0.5 bg-gray-200 rounded text-xs">
                {selectedStudy.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3 mt-6">
          <a
            href={downloadLinks.gz}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download .gz File
          </a>
          <a
            href={downloadLinks.tbi}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download .gz.tbi File
          </a>
        </div>
        
        <div className="text-xs text-gray-500 mt-4">
          *These files contain complete summary statistics for the selected phenotype and population.
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-4 gap-8 p-6 bg-white rounded-lg shadow-lg -mt-10 mx-4 relative z-10">
      {/* SNPs Size - Redesigned with collapsible UI */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Database className="w-4 h-4" />
            SNPs Size
          </h3>
          <button 
            onClick={() => setIsSnpExpanded(!isSnpExpanded)}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
          >
            {isSnpExpanded ? 'Collapse' : 'View details'}
          </button>
        </div>
        
        {/* Main SNP counter */}
        <div className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium flex justify-between items-center">
          <span>Total SNPs</span>
          <ArrowBigDown/>
          {/* <span className="text-lg">{totalSnps.toLocaleString()}</span> */}
        </div>
        
        {/* Expandable detail section */}
        {isSnpExpanded && (
          <div className="mt-2 space-y-1.5 bg-gray-50 p-2 rounded-md max-h-48 overflow-y-auto">
            {/* GWAMA SNPs by cohort */}
            {Object.entries(groupedSNPs.gwama).map(([cohort, count]) => (
              <div 
                key={cohort} 
                className="flex justify-between items-center px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-100"
              >
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${getCohortColor(cohort)} mr-2`}></span>
                  <span>GWAMA {cohort}</span>
                </div>
                <span>{count.toLocaleString()}</span>
              </div>
            ))}
            
            {/* MR-MEGA SNPs */}
            {groupedSNPs.mrmega > 0 && (
              <div className="flex justify-between items-center px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-100">
                <div className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 mr-2"></span>
                  <span>MR-MEGA</span>
                </div>
                <span>{groupedSNPs.mrmega.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sample Size */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Sample Size
        </h3>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-lg font-medium">
            {totalSampleSize.toLocaleString()} <span className='text-sm p-2'>samples</span>
          </span>
        </div>
      </div>

      {/* Lead Variants */}
      <div className="relative">
        <div className="space-y-4">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-600 hover:text-gray-800"
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Lead Variants ({leadVariants?.length || 0})
            </div>
            {isDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-50 max-h-64 overflow-y-auto">
              <div className="space-y-3">
                {leadVariants?.map((variant, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-200">
                        {variant.cohort}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {variant.rsid}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 pl-2 flex items-center gap-4">
                      <span>-log10(p): {variant.log10p.toFixed(2)}</span>
                      <span>• {variant.n_study} studies</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Download Section - New */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Data
        </h3>
        <div>
          <button
            onClick={() => setShowDownloadModal(true)}
            className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-700 transition-colors flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Summary Statistics
          </button>
        </div>
      </div>

      {/* Download Modal */}
      {showDownloadModal && <DownloadModal />}
    </div>
  );
};

// const GWASHeader = ({ phenoId, cohorts, selectedCohort, setSelectedCohort, phenoStats, onOpenSidebar, leadVariants, selectedStudy }) => {
//   return (
//     <div className="relative w-full">
//       <div 
//         className="w-full relative overflow-hidden"
//         style={{
//           background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
//           borderRadius: '0 0 2rem 2rem'
//         }}
//       >
//         <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
//           {/* Title and Icon Row with Sidebar Toggle */}
//           <div className="flex items-center mb-6">
//             {/* Add sidebar toggle button */}
//             <button
//               onClick={onOpenSidebar}
//               className="mr-6 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors group"
//               title="View related phenotypes"
//             >
//               <div className="space-y-1.5">
//                 <div className="w-6 h-0.5 bg-white group-hover:scale-x-90 transition-transform origin-left"></div>
//                 <div className="w-6 h-0.5 bg-white"></div>
//                 <div className="w-6 h-0.5 bg-white group-hover:scale-x-90 transition-transform origin-left"></div>
//               </div>
//             </button>

//             <BarChart2 className="mr-4 h-10 w-10 text-white" />
            
//             <div>
//               <h1 className="text-4xl font-bold text-white mb-2 p-2">
//                 GWAS Analysis Page
//               </h1>
//               <div className="flex items-center space-x-2">
//                 <span className="text-blue-100 text-lg">Phenotype: </span>
//                 <div className="flex items-center bg-white/20 rounded-lg overflow-hidden">
//                   <span className="px-4 py-2 text-white font-semibold text-lg">
//                     {phenoId}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div className='p-5 -mt-10'>
//             <GenerlaBar/>

//             </div>

//           </div>
//         </div>
        
//         <AnimatedDNA />
        
//         <Network 
//           className="absolute left-[10%] top-[20%] opacity-20"
//           size={30}
//           color="white"
//           style={{
//             animation: 'float 6s ease-in-out infinite'
//           }}
//         />
//         <Share2 
//           className="absolute right-[15%] bottom-[30%] opacity-20"
//           size={24}
//           color="white"
//           style={{
//             animation: 'float 6s ease-in-out infinite 1s'
//           }}
//         />
//       </div>

//       <div className="max-w-7xl mx-auto">
//         <StatsBar phenoStats={phenoStats} leadVariants={leadVariants} />
//       </div>

//       <style jsx>{`
//         @keyframes float {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-20px); }
//         }
//       `}</style>
//     </div>
//   );
// };
const GWASHeader = ({ phenoId, cohorts, selectedCohort, setSelectedCohort, phenoStats, onOpenSidebar, leadVariants, selectedStudy, phenoCategory }) => {
  return (
    <div className="relative w-full">
      <div 
        className="w-full relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
          borderRadius: '0 0 2rem 2rem'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          {/* Title and Icon Row with Sidebar Toggle */}
          <div className="flex items-center mb-6">
            {/* Add sidebar toggle button */}
            <button
              onClick={onOpenSidebar}
              className="mr-6 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors group"
              title="View related phenotypes"
            >
              <div className="space-y-1.5">
                <div className="w-6 h-0.5 bg-white group-hover:scale-x-90 transition-transform origin-left"></div>
                <div className="w-6 h-0.5 bg-white"></div>
                <div className="w-6 h-0.5 bg-white group-hover:scale-x-90 transition-transform origin-left"></div>
              </div>
            </button>

            <BarChart2 className="mr-4 h-10 w-10 text-white" />
            
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 p-2">
                GWAS Analysis Page
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-blue-100 text-lg">Phenotype: </span>
                <div className="flex items-center bg-white/20 rounded-lg overflow-hidden">
                <span className="px-4 py-2 text-white font-semibold text-lg">
                  {phenoId}
                </span>
                {phenoCategory && (
                  <span className="px-3 py-1 bg-blue-500/30 text-white text-sm rounded-r">
                    {phenoCategory}
                  </span>
                )}
              </div>
              </div>
            </div>
            <div className='p-5 -mt-10'>
            <GenerlaBar/>

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
        <StatsBar 
          phenoStats={phenoStats} 
          leadVariants={leadVariants} 
          phenoId={phenoId}
          selectedCohort={selectedCohort}
          selectedStudy={selectedStudy}
        />
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

const StudySelector = ({
  selectedStudy,
  selectedCohort,
  onChange,
  setSelectedCohort,
  setSelectedTopAncestry,    // Add this
  setSelectedBottomAncestry, // Add this
  phenoId,
  availableStudies,
  gwamaCohorts,
  mrmegaAvailable,
  gwamaAvailable
}) => {
  // No fetching here anymore. We rely on data passed from GWASPage.

  const handleStudyChange = (newStudy) => {
    if (newStudy === 'mrmega') {
      setSelectedCohort('ALL');
      // Also update Hudson plot cohorts for MR-MEGA
      setSelectedTopAncestry('ALL');
      setSelectedBottomAncestry('ALL');
    } else {
      // If we have gwama cohorts available, set the first one if needed
      if (gwamaCohorts.length > 0) {
        setSelectedCohort(gwamaCohorts[0]);
        // Set initial Hudson plot cohorts for GWAMA
        if (gwamaCohorts.length >= 2) {
          setSelectedTopAncestry(gwamaCohorts[0]);
          setSelectedBottomAncestry(gwamaCohorts[1]);
        } else {
          setSelectedTopAncestry(gwamaCohorts[0]);
          setSelectedBottomAncestry(gwamaCohorts[0]);
        }
      } else {
        setSelectedCohort(null);
      }
    }
    onChange(newStudy);
  };

  return (
    <div className="space-y-4">
      {/* Study Type Selection */}
      <div className="flex flex-col space-y-2">
        <span className="text-sm font-medium text-gray-700">Study Type:</span>
        
        <div className="flex space-x-2">
        <button
            onClick={() => handleStudyChange('mrmega')}
            disabled={!mrmegaAvailable}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedStudy === 'mrmega'
                ? 'bg-blue-600 text-white'
                : mrmegaAvailable
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            MR-MEGA
          </button>
          <button
            onClick={() => handleStudyChange('gwama')}
            disabled={!gwamaAvailable}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedStudy === 'gwama'
                ? 'bg-blue-600 text-white'
                : gwamaAvailable
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            GWAMA
          </button>
          
        </div>
      </div>

      {/* Cohort Selection - Only shown for GWAMA */}
      {selectedStudy === 'gwama' && gwamaCohorts.length > 0 && (
        <div className="flex flex-col space-y-2">
          <span className="text-sm font-medium text-gray-700">Select Cohort:</span>
          <div className="flex flex-wrap gap-2">
            {gwamaCohorts.map((cohort) => (
              <button
                key={cohort}
                onClick={() => setSelectedCohort(cohort)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCohort === cohort
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cohort}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PValueRangeFilter = ({ maxPValue, minPValue, onFilterChange }) => {
  const [maxInput, setMaxInput] = useState('');
  const [minInput, setMinInput] = useState('');
  
  // Update input fields when props change
  useEffect(() => {
    if (maxPValue !== null && minPValue !== null) {
      // Always work with -log10(p) values directly
      setMinInput(minPValue.toString());
      setMaxInput(maxPValue.toString());
    }
  }, [maxPValue, minPValue]);

  const handleApplyFilter = () => {
    // Always treat inputs as -log10(p) values
    const minLog10p = parseFloat(minInput);
    const maxLog10p = parseFloat(maxInput);
    
    if (isNaN(minLog10p) || isNaN(maxLog10p) || minLog10p > maxLog10p) {
      alert('Invalid -log10(p) range: Min must be less than Max');
      return;
    }
    
    console.log(`Applying filter with -log10(p) range: ${minLog10p} to ${maxLog10p}`);
    
    // Send the -log10(p) values directly to the backend
    onFilterChange({ minPValue: minLog10p, maxPValue: maxLog10p });
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-700">P-value Range Filter (-log10(p) format)</h3>
      </div>
      
      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <label className="text-xs text-gray-600">Min -log10(p)</label>
          <input
            type="text"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., 5"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-600">Max -log10(p)</label>
          <input
            type="text"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., 8"
          />
        </div>
      </div>
      
      <button
        onClick={handleApplyFilter}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Apply Filter
      </button>
      
      <p className="text-xs text-gray-500 mt-2">
        Higher -log10(p) values = more significant SNPs (e.g., 8 = p-value of 10^-8)
      </p>
    </div>
  );
};
const GWASPage = () => {
  const { phenoId } = useParams();
  const [selectedPval, setSelectedPval] = useState('1e-05'); // Default pval threshold
  const [selectedStudy, setSelectedStudy] = useState('mrmega');
  const [selectedCohort, setSelectedCohort] = useState(null); // Initialize as null
  const [selectedSNP, setSelectedSNP] = useState(null);
  const [statData, setStatData] = useState([]);
  const [dynData, setDynData] = useState([]);
  const [ticks, setTicks] = useState([]);
  const [qq, setQQ] = useState(null);
  const [about, setAbout] = useState([]);
  const [tab, setTab] = useState('man');
  const [dynTop, setDynTop] = useState([]);
  const [statTop, setStatTop] = useState([]);
  const [dynBott, setDynBott] = useState([]);
  const [statBott, setStatBott] = useState([]);
  const [ticksTop, setTicksTop] = useState([]);
  const [ticksBott, setTicksBott] = useState([]);
  const [qqComp, setQQComp] = useState(null);
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topResults, setTopResults] = useState([]);
  const [selectedAncestry, setSelectedAncestry] = useState('EUR');
  const [loadingTop, setLoadingTop] = useState(false);
  const [loadingBottom, setLoadingBottom] = useState(false);
  const [showModal, setShowModal] = useState(false); 
  const [logPval, setLogPval] = useState(-Math.log10(parseFloat('0.00000001'))); 
  const [phenoCategory, setPhenoCategory] = useState('');
  const [cachedData, setCachedData] = useState({
    cohortData: {}, 
    bottomPlots: {},
    topPlots: {}
  });
  const [selectedTopAncestry, setSelectedTopAncestry] = useState('EUR');
  const [selectedBottomAncestry, setSelectedBottomAncestry] = useState('AFR');
  const [phenoStats, setPhenoStats] = useState({
    snps_by_cohort: {},
    samples_by_cohort: {}
  });
  const [leadVariants, setLeadVariants] = useState([]);
  const [availableStudies, setAvailableStudies] = useState([]);
  const [gwamaCohorts, setGwamaCohorts] = useState([]);
  const [gwamaAvailable, setGwamaAvailable] = useState(false);
  const [mrmegaAvailable, setMrmegaAvailable] = useState(false);
  const [filterLimit, setFilterLimit] = useState('10'); // Added this line
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const history = useNavigate();

  // Modify these variables in your GWASPage component state:
  const [maxPValue, setMaxPValue] = useState(null);
  const [minPValue, setMinPValue] = useState(null);
  const [filterMaxPValue, setFilterMaxPValue] = useState(null);
  const [filterMinPValue, setFilterMinPValue] = useState(null);
  const isLoadingRef = useRef(false);


// Add this function to the GWASPage component:


const fetchHudsonTopData = async (ancestry) => {
  try {
    setLoadingTop(true);
    
    // Include the same filters used in fetchGWASData
    let queryParams = `cohortId=${ancestry}&phenoId=${phenoId}&study=${selectedStudy}`;
    if (filterMinPValue !== null && !isNaN(filterMinPValue)) {
      queryParams += `&minPval=${filterMinPValue}`;
    }
    if (filterMaxPValue !== null && !isNaN(filterMaxPValue)) {
      queryParams += `&maxPval=${filterMaxPValue}`;
    }
    
    const response = await fetch(`/api/queryGWASData?${queryParams}`);
    
    if (!response.ok) {
      setDynTop([]);
      setStatTop([]);
      setTicksTop([]);
      return;
    }

    const responseData = await response.json();
    let dataToProcess = responseData.data ? responseData.data : responseData;
    
    // Improved data processing
    const processData = (data) => {
      if (!data || typeof data !== 'object') return [];
      
      return Object.entries(data).flatMap(([chrom, snps]) => {
        // Check if snps is an array
        if (!Array.isArray(snps)) return [];
        
        return snps
          .filter(snp => snp && typeof snp === 'object') // Make sure snp is an object
          .map((snp) => {
            return {
              chrom: parseInt(chrom),
              pos: snp.pos,
              log_p: snp.log10p ? parseFloat(snp.log10p) : (-Math.log10(parseFloat(snp.p))),
              pval: parseFloat(snp.p),
              SNP_ID: snp.id || null
            };
          });
      });
    };

    const dfTop = processData(dataToProcess);
    const { dyn: newDynTop, stat: newStatTop, ticks: newTicksTop } = generatePlotData(dfTop);
    
    setDynTop(newDynTop);
    setStatTop(newStatTop);
    setTicksTop(newTicksTop);

  } catch (error) {
    console.error('Failed to fetch or process Hudson top data:', error);
    setDynTop([]);
    setStatTop([]);
    setTicksTop([]);
  } finally {
    setLoadingTop(false);
  }
};

  // Modify the fetchHudsonBottomData function
  const fetchHudsonBottomData = async (ancestry) => {
    try {
      setLoadingBottom(true);
      
      // Include the same filters used in fetchGWASData
      let queryParams = `cohortId=${ancestry}&phenoId=${phenoId}&study=${selectedStudy}`;
      if (filterMinPValue !== null && !isNaN(filterMinPValue)) {
        queryParams += `&minPval=${filterMinPValue}`;
      }
      if (filterMaxPValue !== null && !isNaN(filterMaxPValue)) {
        queryParams += `&maxPval=${filterMaxPValue}`;
      }
      
      const response = await fetch(`/api/queryGWASData?${queryParams}`);
      
      if (!response.ok) {
        setDynBott([]);
        setStatBott([]);
        setTicksBott([]);
        return;
      }
  
      const responseData = await response.json();
      let dataToProcess = responseData.data ? responseData.data : responseData;
      
      // Improved data processing
      const processData = (data) => {
        if (!data || typeof data !== 'object') return [];
        
        return Object.entries(data).flatMap(([chrom, snps]) => {
          // Check if snps is an array
          if (!Array.isArray(snps)) return [];
          
          return snps
            .filter(snp => snp && typeof snp === 'object') // Make sure snp is an object
            .map((snp) => {
              return {
                chrom: parseInt(chrom),
                pos: snp.pos,
                log_p: snp.log10p ? parseFloat(snp.log10p) : (-Math.log10(parseFloat(snp.p))),
                pval: parseFloat(snp.p),
                SNP_ID: snp.id || null
              };
            });
        });
      };
  
      const dfBott = processData(dataToProcess);
      const { dyn: newDynBott, stat: newStatBott, ticks: newTicksBott } = generatePlotData(dfBott);
      
      setDynBott(newDynBott);
      setStatBott(newStatBott);
      setTicksBott(newTicksBott);
  
    } catch (error) {
      console.error('Failed to fetch or process Hudson bottom data:', error);
      setDynBott([]);
      setStatBott([]);
      setTicksBott([]);
    } finally {
      setLoadingBottom(false);
    }
  };

  useEffect(() => {
    const fetchLeadVariants = async () => {
      try {
        // const response = await fetch(`${baseURL}/getLeadVariants`);
        const response = await fetch(`/api/getLeadVariants`);

        if (!response.ok) throw new Error('Failed to fetch data');
        const allVariants = await response.json();
        
        // Filter variants for current phenotype
        const relevantVariants = allVariants
          .filter(variant => variant.trait.name === phenoId)
          .map(variant => ({
            cohort: variant.cohort,
            rsid: variant.lead_snp.rsid,
            log10p: variant.lead_snp.log10p,
            n_study: variant.n_study
          }));

        setLeadVariants(relevantVariants);
      } catch (error) {
        console.error('Error fetching lead variants:', error);
      }
    };

    if (phenoId) {
      fetchLeadVariants();
    }
  }, [phenoId]);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handlePvalChange = (pval) => {
    setSelectedPval(pval);
    setLogPval(-Math.log10(parseFloat(pval))); 
    fetchGWASData(selectedCohort, pval);
  };

  useEffect(() => {
    const fetchHudsonData = async () => {
      if (tab === 'hudson') {
        // Reset the plots when switching to Hudson tab or changing study
        setDynTop([]);
        setStatTop([]);
        setTicksTop([]);
        setDynBott([]);
        setStatBott([]);
        setTicksBott([]);
          
        if (selectedTopAncestry) {
          await fetchHudsonTopData(selectedTopAncestry);
        }
        if (selectedBottomAncestry) {
          await fetchHudsonBottomData(selectedBottomAncestry);
        }
      }
    };
  
    fetchHudsonData();
  }, [tab, selectedStudy, selectedTopAncestry, selectedBottomAncestry]); // Added selectedStudy as dependency

  // Fetch /findfiles once in GWASPage
  useEffect(() => {
    const fetchAvailableStudiesAndCohorts = async () => {
      if (!phenoId) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/findfiles?phenoId=${phenoId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch available studies and cohorts');
        }
        const data = await response.json();
        const { gwamaAvailable: gAvail, mrmegaAvailable: mAvail, gwamaCohorts: gCohorts } = data;
        setGwamaAvailable(gAvail);
        setMrmegaAvailable(mAvail);
        const studies = [];
        if (gAvail) studies.push('gwama');
        if (mAvail) studies.push('mrmega');
        setAvailableStudies(studies);
        setGwamaCohorts(gCohorts);
        // Set default study and cohort
        if (mAvail) {
          setSelectedStudy('mrmega');
          setSelectedCohort('ALL');
          setSelectedTopAncestry('ALL');
          setSelectedBottomAncestry('ALL');
        } else if (gAvail && gCohorts.length > 0) {
          setSelectedStudy('gwama');
          setSelectedCohort(gCohorts[0]);
          if (gCohorts.length >= 2) {
            setSelectedTopAncestry(gCohorts[0]);
            setSelectedBottomAncestry(gCohorts[1]);
          } else {
            setSelectedTopAncestry(gCohorts[0]);
            setSelectedBottomAncestry(gCohorts[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching studies and cohorts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableStudiesAndCohorts();
  }, [phenoId]);

  // Load metadata for the cohort and phenotype
  useEffect(() => {
const loadMetadata = async () => {
  try {
    setLoading(true);
    // const response = await fetch(`${baseURL}/getPhenotypeStats/${phenoId}`);  // Changed this line
    const response = await fetch(`/api/getPhenotypeStats/${phenoId}`);  // Changed this line
    
    if (!response.ok) throw new Error('Failed to fetch metadata');
    const data = await response.json();
    
    // Data will now be directly for the specific phenotype, no need to filter
    if (data) {
      // Set cohorts from the populations in data
      const availableCohorts = Object.keys(data.stats.snps_by_cohort || {});
      setCohorts(availableCohorts);
      if (!selectedCohort && availableCohorts.length > 0) {
        setSelectedCohort(availableCohorts[0]);
      }

      // Set phenotype stats directly
      setPhenoStats(data.stats);
      
      setAbout([{
        Info: `Phenotype: ${data.phenotype_id}`,
        Description: `Available in ${availableCohorts.length} cohorts: ${availableCohorts.join(', ')}`
      }]);

      const mappingResponse = await fetch(`/api/getPhenotypeMapping`);
      if (mappingResponse.ok) {
        const phenoMapping = await mappingResponse.json();
        setPhenoCategory(phenoMapping[phenoId]?.category || 'Uncategorized');
      }
    } else {
      console.error('No metadata found for phenotype:', phenoId);
      handleShowModal();
    }
  } catch (error) {
    console.error('Error loading metadata:', error);
    handleShowModal();
  } finally {
    setLoading(false);
  }
};
    
    loadMetadata();
  }, [phenoId]);

  // Fetch GWAS data based on the selected cohort and p-value
  // const fetchGWASData = async (cohortId, pval) => {
  //   const cacheKey = `${cohortId}_${pval}_${selectedStudy}`;
    
  //   if (cachedData.cohortData[cacheKey]) {
  //     processGWASData(cachedData.cohortData[cacheKey]);
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     // const response = await fetch(
  //     //   `${baseURL}/queryGWASData?cohortId=${cohortId}&phenoId=${phenoId}&pval=${pval}&study=${selectedStudy}`
  //     // );
  //     const response = await fetch(
  //       `/api/queryGWASData?cohortId=${cohortId}&phenoId=${phenoId}&pval=${pval}&study=${selectedStudy}`
  //     );
  //     if (response.status === 404) {
  //       handleShowModal();
  //       setDynData([]);
  //       setStatData([]);
  //       setTicks([]);
  //       setQQ(null);
  //       return;
  //     }

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     console.log(data)
  //     setCachedData((prevData) => ({
  //       ...prevData,
  //       cohortData: {
  //         ...prevData.cohortData,
  //         [cacheKey]: data,
  //       },
  //     }));

  //     processGWASData(data);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     handleShowModal();
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchGWASData = async (cohortId) => {
    if (isLoadingRef.current) {
      console.log('Request already in progress, skipping duplicate call');
      return;
    }
    try {
      isLoadingRef.current = true;
      setLoading(true);
        const cacheKey = `${cohortId}_${filterMinPValue}_${filterMaxPValue}_${selectedStudy}`;
        if (cachedData.cohortData[cacheKey]) {
            console.log(`Using cached data for range: ${filterMinPValue} to ${filterMaxPValue}`);
            processGWASData(cachedData.cohortData[cacheKey]);
            return;
        }

        // Build query with the correct parameter names (minPval/maxPval not minLog10p)
        let queryParams = `cohortId=${cohortId}&phenoId=${phenoId}&study=${selectedStudy}`;
        
        // The backend is expecting minPval and maxPval parameter names even though they represent -log10(p) values
        if (filterMinPValue !== null && !isNaN(filterMinPValue)) {
            queryParams += `&minPval=${filterMinPValue}`;
        }
        if (filterMaxPValue !== null && !isNaN(filterMaxPValue)) {
            queryParams += `&maxPval=${filterMaxPValue}`;
        }

        console.log(`Fetching data with -log10(p) range: ${filterMinPValue} to ${filterMaxPValue}`);
        const response = await fetch(`/api/queryGWASData?${queryParams}`);
        setLoading(false)
        if (response.status === 404) {
            setDynData([]);
            setStatData([]);
            setTicks([]);
            setQQ(null);
            handleShowModal();
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.data) {
            throw new Error('Response missing data property');
        }

        if (data.pValueRange) {
            setMaxPValue(data.pValueRange.maxLog10P);
            setMinPValue(data.pValueRange.minLog10P);
            // if (filterMinPValue === null || filterMaxPValue === null) {
            //     setFilterMinPValue(data.pValueRange.minLog10P);
            //     setFilterMaxPValue(data.pValueRange.maxLog10P);
            // }
        }

        setCachedData(prev => ({
            ...prev,
            cohortData: {
                ...prev.cohortData,
                [cacheKey]: data.data
            }
        }));

        processGWASData(data.data);
    } catch (error) {
        console.error('Error fetching GWAS data:', error);
        setDynData([]);
        setStatData([]);
        setTicks([]);
        setQQ(null);
        handleShowModal();
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
};
  // Handle p-value changes:

  // const fetchGWASData = async (cohortId, pval) => {
  //   const cacheKey = `${cohortId}_${pval}_${selectedStudy}`;
    
  //   if (cachedData.cohortData[cacheKey]) {
  //     processGWASData(cachedData.cohortData[cacheKey]);
  //     return;
  //   }
  
  //   try {
  //     setLoading(true);
  //     const response = await fetch(
  //       `/api/queryGWASData?cohortId=${cohortId}&phenoId=${phenoId}&pval=${pval}&study=${selectedStudy}`
  //     );
  
  //     if (response.status === 404) {
  //       handleShowModal();
  //       setDynData([]);
  //       setStatData([]);
  //       setTicks([]);
  //       setQQ(null);
  //       return;
  //     }
  
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  
  //     // Process streamed response
  //     const reader = response.body.getReader();
  //     const decoder = new TextDecoder('utf-8');
  //     let result = '';
  //     let data = {};
  
  //     while (true) {
  //       const { done, value } = await reader.read();
  //       if (done) break;
  
  //       result += decoder.decode(value, { stream: true });
  //       try {
  //         data = JSON.parse(result);
  //       } catch (e) {
  //         // Incomplete JSON, continue reading
  //         continue;
  //       }
  //     }
  
  //     // Ensure we have the full data object
  //     if (!data.data) {
  //       throw new Error('Incomplete or malformed streamed data');
  //     }
  
  //     console.log('Received GWAS data:', data);
  //     setCachedData((prevData) => ({
  //       ...prevData,
  //       cohortData: {
  //         ...prevData.cohortData,
  //         [cacheKey]: data.data, // Store only the 'data' portion
  //       },
  //     }));
  
  //     processGWASData(data.data);
  //   } catch (error) {
  //     console.error('Error fetching GWAS data:', error);
  //     handleShowModal();
  //     setDynData([]);
  //     setStatData([]);
  //     setTicks([]);
  //     setQQ(null);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // Fetch top results with caching
  const fetchTopResults = async (cohortId) => {
    const cacheKey = `${cohortId}_topResults_${selectedStudy}`;
    
    if (cachedData.cohortData[cacheKey]) {
      setTopResults(cachedData.cohortData[cacheKey]);
      return;
    }

    try {
      setLoading(true);
      // const url = `${baseURL}/getTopResults?cohortId=${cohortId}&phenoId=${phenoId}&study=${selectedStudy}`;
      const url = `/api/getTopResults?cohortId=${cohortId}&phenoId=${phenoId}&study=${selectedStudy}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setTopResults(data);
        setCachedData((prevData) => ({
          ...prevData,
          cohortData: {
            ...prevData.cohortData,
            [cacheKey]: data,
          },
        }));
      } else {
        setTopResults([]);
      }
    } catch (error) {
      console.error('Failed to fetch top results:', error);
      setTopResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSNPClick = async (snpData) => {
    setSelectedSNP(snpData);
    try {
        // const url = `${baseURL}/phewas?snp=${snpData.SNP_ID}&chromosome=${snpData.chromosome}&position=${snpData.position}&study=${selectedStudy}`;
        const url = `/api/phewas?snp=${snpData.SNP_ID}&chromosome=${snpData.chromosome}&position=${snpData.position}&study=${selectedStudy}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        history('/phewas', { 
            state: { 
                phewasData: data, 
                selectedSNP: snpData.SNP_ID,
                study: selectedStudy 
            } 
        });
    } catch (error) {
        console.error('Error fetching PheWAS data:', error);
    }
  };

  // const processGWASData = (data) => {
  //   const df = Object.entries(data).flatMap(([chrom, snps]) =>
  //       snps.map((snp) => ({
  //           chrom: parseInt(chrom),
  //           pos: snp.pos,
  //           log_p: -Math.log10(snp.p),
  //           pval: snp.p,
  //           SNP_ID: snp.id
  //       }))
  //   );

  //   generateQQData(df);
  //   const { dyn, stat, ticks } = generatePlotData(df);
  //   setDynData(dyn);
  //   setStatData(stat);
  //   setTicks(ticks);
  // };



// Modify the processGWASData function to set the max p-value:
// const processGWASData = (data) => {
//   const df = Object.entries(data).flatMap(([chrom, snps]) =>
//     snps.map((snp) => ({
//       chrom: parseInt(chrom),
//       pos: snp.pos,
//       log_p: -Math.log10(snp.p),
//       pval: snp.p,
//       SNP_ID: snp.id
//     }))
//   );
//   generateQQData(df);
//   const { dyn, stat, ticks } = generatePlotData(df);
//   setDynData(dyn);
//   setStatData(stat);
//   setTicks(ticks);
// };
const processGWASData = (data) => {
  const df = Object.entries(data).flatMap(([chrom, snps]) =>
    snps.map((snp) => ({
      chrom: parseInt(chrom),
      pos: snp.pos,
      log_p: parseFloat(snp.log10p), // Use backend-provided log10p instead of calculating
      pval: snp.p,
      SNP_ID: snp.id
    }))
  );

  generateQQData(df);
  const { dyn, stat, ticks } = generatePlotData(df);
  setDynData(dyn);
  setStatData(stat);
  setTicks(ticks);
};
  // const processGWASData = (data) => {
  //   console.log('Processing GWAS data:', data); // Debug log
  
  //   const df = Object.entries(data).flatMap(([chrom, snps]) =>
  //     snps.map((snp) => ({
  //       chrom: parseInt(chrom),
  //       pos: snp.pos,
  //       log_p: -Math.log10(snp.p),
  //       pval: snp.p,
  //       SNP_ID: snp.id
  //     }))
  //   );
  
  //   generateQQData(df);
  //   const { dyn, stat, ticks } = generatePlotData(df);
  //   setDynData(dyn);
  //   setStatData(stat);
  //   setTicks(ticks);
  // };
  const generateQQData = (df) => {
    console.log(df)
    const n = df.length;
    const observed = df.map((row) => row.log_p).sort((a, b) => a - b);
    const theoretical = Array.from({ length: n }, (_, i) => -Math.log10((i + 0.5) / n)).sort((a, b) => a - b);
    setQQ({ x: theoretical, y: observed });
  };

// Modify your generatePlotData function in GWASPage.js to handle the dynamic p-value filtering

const generatePlotData = (df) => {
  const pvalThreshold = filterMaxPValue ? parseFloat(filterMaxPValue) : parseFloat(selectedPval);
  
  console.log(`Filtering with p-value threshold: ${pvalThreshold}`);
  
  const numChromosomes = 22;
  const dyn_out = [];
  const stat_out = [];
  const ticks = [];

  const chromLengths = [
      248956422, 242193529, 198295559, 190214555, 181538259, 170805979,
      159345973, 145138636, 138394717, 133797422, 135086622, 133275309,
      114364328, 107043718, 101991189, 90338345, 83257441, 80373285,
      58617616, 64444167, 46709983, 50818468
  ];
  
  const cumulativeSums = chromLengths.reduce((acc, val, i) => {
      acc[i + 1] = (acc[i] || 0) + val;
      return acc;
  }, {});

  const totalLength = cumulativeSums[numChromosomes];

  // Process each chromosome
  for (let chrom = 1; chrom <= numChromosomes; chrom++) {
      const df_chr = df.filter((row) => row.chrom === chrom);

      if (df_chr.length > 0) {
          const startPos = chrom === 1 ? 0 : cumulativeSums[chrom - 1] / totalLength;
          const endPos = cumulativeSums[chrom] / totalLength;
          ticks.push((startPos + endPos) / 2);

          const normalizePos = (pos) => {
              const chromStart = chrom === 1 ? 0 : cumulativeSums[chrom - 1];
              return (chromStart + pos) / totalLength;
          };

          // Split data by p-value threshold
          const dyn_chr = df_chr.filter((row) => row.pval <= pvalThreshold);
          const stat_chr = df_chr.filter((row) => row.pval > pvalThreshold);

          // Progressive filtering: as the p-value threshold gets more permissive, limit the total points
          const maxPointsPerChromosome = 5000; // Adjust based on performance testing
          
          if (dyn_chr.length > 0) {
              // Always include highly significant points
              dyn_out.push({
                  x: dyn_chr.map((row) => normalizePos(row.pos)),
                  y: dyn_chr.map((row) => row.log_p),
                  chr: chrom,
                  SNP_ID: dyn_chr.map((row) => row.SNP_ID),
                  pos: dyn_chr.map((row) => row.pos)
              });
          }

          if (stat_chr.length > 0) {
              // Sample less significant points if there are too many
              let stat_chr_filtered = stat_chr;
              
              if (stat_chr.length > maxPointsPerChromosome) {
                  // Sort by p-value (most significant first)
                  stat_chr_filtered = [...stat_chr].sort((a, b) => a.pval - b.pval);
                  
                  // Take the top N most significant points
                  stat_chr_filtered = stat_chr_filtered.slice(0, maxPointsPerChromosome);
                  
                  console.log(`Chromosome ${chrom}: Filtered from ${stat_chr.length} to ${maxPointsPerChromosome} points`);
              }
              
              stat_out.push({
                  x: stat_chr_filtered.map((row) => normalizePos(row.pos)),
                  y: stat_chr_filtered.map((row) => row.log_p),
                  chr: chrom,
                  SNP_ID: stat_chr_filtered.map((row) => row.SNP_ID),
                  pos: stat_chr_filtered.map((row) => row.pos)
              });
          }
      }
  }

  return { dyn: dyn_out, stat: stat_out, ticks };
};

// useEffect(() => {
//   console.log('useEffect running with:', { selectedCohort, selectedStudy, tab, filterMinPValue, filterMaxPValue });
  
//   if (tab === 'man' && selectedStudy && 
//       ((selectedStudy === 'mrmega' && selectedCohort === 'ALL') || 
//        (selectedStudy === 'gwama' && selectedCohort && selectedCohort !== 'ALL'))) {
//     const loadData = async () => {
//       await fetchGWASData(selectedCohort);
//       await fetchTopResults(selectedCohort);
//     };
//     loadData();
//   }
// }, [selectedCohort, selectedStudy, tab, filterMinPValue, filterMaxPValue]);
// For GWAS data (Manhattan plot)
useEffect(() => {
  if (tab === 'man' && selectedStudy && 
      ((selectedStudy === 'mrmega' && selectedCohort === 'ALL') || 
       (selectedStudy === 'gwama' && selectedCohort && selectedCohort !== 'ALL'))) {
    fetchGWASData(selectedCohort);
  }
}, [selectedCohort, selectedStudy, tab, filterMinPValue, filterMaxPValue]);

// For top results
useEffect(() => {
  if (tab === 'man' && selectedStudy && 
      ((selectedStudy === 'mrmega' && selectedCohort === 'ALL') || 
       (selectedStudy === 'gwama' && selectedCohort && selectedCohort !== 'ALL'))) {
    fetchTopResults(selectedCohort);
  }
}, [selectedCohort, selectedStudy, tab]);

return (
  <div className="min-h-screen bg-gray-50">
    <RelatedPhenotypesSidebar
      currentPhenoId={phenoId}
      isOpen={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
    />

    {/* Modal Component */}
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        showModal ? "visible bg-gray-800 bg-opacity-50" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-96">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Unavailable</h2>
        <p className="text-gray-600 mb-4">No data found for the selected parameters:</p>
        <ul className="list-disc list-inside text-gray-600 mb-4">
          <li>Cohort: {selectedCohort}</li>
          <li>Phenotype: {phenoId}</li>
          <li>P-value Threshold: {selectedPval}</li>
        </ul>
        <p className="text-gray-600 mb-4">
          Please try different parameters or contact the system administrator if you believe this is an error.
        </p>
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          onClick={handleCloseModal}
        >
          Close
        </button>
      </div>
    </div>

    {loading && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div className="flex items-center space-x-2">
          <Spinner animation="border" role="status" />
          <span className="text-white">Loading...</span>
        </div>
      </div>
    )}

    <div className="w-full">
      <GWASHeader 
        phenoId={phenoId}
        cohorts={cohorts}
        selectedCohort={selectedCohort}
        setSelectedCohort={setSelectedCohort}
        phenoStats={phenoStats}
        onOpenSidebar={() => setSidebarOpen(true)}
        leadVariants={leadVariants}
        selectedStudy={selectedStudy}
        phenoCategory={phenoCategory}
      />
    </div>

    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow p-6">
        
        {/* Study Selector */}
        <div className="mb-6">
          <StudySelector
            selectedStudy={selectedStudy}
            selectedCohort={selectedCohort}
            onChange={setSelectedStudy}
            setSelectedCohort={setSelectedCohort}
            setSelectedTopAncestry={setSelectedTopAncestry}
            setSelectedBottomAncestry={setSelectedBottomAncestry}
            phenoId={phenoId}
            availableStudies={availableStudies}
            gwamaCohorts={gwamaCohorts}
            mrmegaAvailable={mrmegaAvailable}
            gwamaAvailable={gwamaAvailable}
          />
        </div>
        
        {/* Filters Row - Grid Layout */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          {/* P-value Filter - Takes 3 columns */}
          <div className="col-span-3">
            <PValueRangeFilter
              maxPValue={maxPValue}
              minPValue={minPValue}
              onFilterChange={({ minPValue, maxPValue }) => {
                setFilterMinPValue(minPValue);
                setFilterMaxPValue(maxPValue);
                fetchGWASData(selectedCohort);
              }}
            />
          </div>
          
          {/* Variant Filter - Takes 1 column */}
          <div className="col-span-1">
            <div className="h-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Lead Variants Filter</h3>
              <select 
                value={filterLimit}
                onChange={(e) => setFilterLimit(e.target.value)}
                className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="None">No filtering</option>
                <option value="all">All Variants</option>
                <option value="10">Top 10</option>
                <option value="20">Top 20</option>
                <option value="50">Top 50</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Filter to show specific lead variants
              </p>
            </div>
          </div>
        </div>
        
        <Tabs activeKey={tab} onSelect={(e) => setTab(e)} variant="pills" justify>          
          <Tab eventKey="man" title="Analysis">
            <div className="space-y-6">
              <div className="space-y-6">
                <div className="bg-white flex justify-center items-center rounded-lg shadow p-4">
                  <div className="overflow-hidden max-h-[600px] flex justify-center w-full">
                    <Manhattan
                      stat={statData}
                      dyn={dynData}
                      ticks={ticks}
                      threshold={logPval}
                      onSNPClick={handleSNPClick}
                      history={history}
                      phenoId={phenoId}
                      selectedCohort={selectedCohort}
                      selectedStudy={selectedStudy}
                      filterLimit={filterLimit}
                      filterMinPValue={filterMinPValue}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-800">Top Results</h3>
                <TopResults data={topResults} onSNPClick={handleSNPClick} />
              </div>
            </div>
          </Tab>
          
          <Tab eventKey="qq" title="QQ Plot">
            <div className="p-4">
              <QQPlotView
                phenoId={phenoId}
                selectedCohort={selectedCohort}
                selectedStudy={selectedStudy}
              />
            </div>
          </Tab>  
          
          <Tab eventKey="hudson" title="Compare Ancestries">
            <div className="p-4">
              <div className="bg-gray-100 rounded-lg shadow p-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-800">Ancestry Comparison (Significant Analyzed SNPs)</h3>
                <Hudson
                  dynTop={dynTop}
                  statTop={statTop}
                  dynBott={dynBott}
                  statBott={statBott}
                  ticksTop={ticksTop}
                  ticksBott={ticksBott}
                  selectedTopAncestry={selectedTopAncestry}
                  selectedBottomAncestry={selectedBottomAncestry}
                  onTopAncestryChange={setSelectedTopAncestry}
                  onBottomAncestryChange={setSelectedBottomAncestry}
                  loadingTop={loadingTop}
                  loadingBottom={loadingBottom}
                  availableCohorts={selectedStudy === 'gwama' ? gwamaCohorts : ['ALL']}
                />
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  </div>
);
}

export default GWASPage;

import React from 'react';
import ComprehensiveSummary from './ComprehensiveSummary';

const SummarySection = () => {
  const summaryItems = [
    {
      image: "/images/summary1.png",
      title: "Phenotype Distribution Analysis",
      description: "Visualization of trait distribution across binary and quantitative phenotypes. The plot shows the frequency distribution of traits across 22 chromosomes, with the upper panel representing binary traits (like disease status) and the lower panel showing quantitative traits (like biomarker measurements). This comprehensive view helps understand the genomic landscape of different trait types.",
      isImageLeft: true
    },
    {
      image: "/images/summary2.png",
      title: "Population-Specific Variant Analysis",
      description: "Comparison of newly identified and known variants across different populations (AFR: African, AMR: American, EAS: East Asian, EUR: European). The upper panel shows newly identified variants specific to each population, while the lower panel displays the distribution of known variants. This highlights the importance of diverse population studies in genetic research.",
      isImageLeft: false
    },
    {
      image: "/images/summary3.png",
      title: "Minor Allele Frequency Impact",
      description: "Analysis of genetic effects across minor allele frequencies for both binary and quantitative traits. The scatter plot demonstrates how rare and common variants contribute differently to binary (left) and quantitative (right) traits. Green points represent newly identified associations while grey points show known associations, revealing patterns in genetic architecture.",
      isImageLeft: true
    },
    {
      image: "/images/summary4.png",
      title: "Variant Impact Classification",
      description: "Forest plot showing the relative impact of different types of genetic variants. The analysis categorizes variants from high-impact (stop gained) to low-impact (intergenic) based on their odds ratios. This classification helps prioritize variants for functional studies and understand their biological significance in disease mechanisms.",
      isImageLeft: false
    },
    {
      image: "/images/summary6.png",
      title: "Signal Distribution and PIP Analysis",
      description: "Dual analysis of GWAS signals and Posterior Inclusion Probabilities (PIP). The left panel shows the number of genome-wide significant signals across traits, while the right panel displays the proportion of variants in different PIP ranges. This combined view helps assess both the quantity and quality of genetic associations.",
      isImageLeft: true
    }
  ];

  return (
    <>
     {/* <ComprehensiveSummary /> */}
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Research Summary</h2>
        <p className="text-lg text-gray-600">Key findings from our genetic association studies</p>
      </div>

      <div className="space-y-24">
        {summaryItems.map((item, index) => (
          <div 
            key={index}
            className={`flex flex-col ${item.isImageLeft ? 'md:flex-row' : 'md:flex-row-reverse'} 
                       items-center gap-8 md:gap-16`}
          >
            {/* Image Container */}
            <div className="w-full md:w-1/2">
              <div className="bg-white rounded-xl shadow-lg p-4 transition-transform duration-300 hover:scale-105">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>

            {/* Text Container */}
            <div className="w-full md:w-1/2 space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
              <div className="pt-4">
                {/* <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg
                                 hover:bg-blue-700 transition-colors duration-200">
              
                </button> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
         
</>
  );
};

export default SummarySection;
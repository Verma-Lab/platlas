import React from 'react';
import { BookOpen, FileText, Award, Lightbulb, ArrowRight, Building2, Flask, Target } from 'lucide-react';

const ResearchSection = () => {
  const researchHighlights = [
    {
      icon: BookOpen,
      title: "Research Overview",
      description: "A comprehensive multi-ancestry genome-wide association study platform analyzing genetic variations across diverse populations.",
      points: [
        "Integration of multiple cohorts including EUR, EAS, AFR, and AMR populations",
        "Novel statistical approaches for cross-ancestry analysis",
        "Advanced visualization tools for genetic associations"
      ]
    },
    {
      icon: Target,
      title: "Key Innovations",
      description: "Cutting-edge methodologies and tools developed for enhanced genetic analysis.",
      points: [
        "Dynamic Manhattan plots with interactive features",
        "Cross-ancestry comparison through Hudson plots",
        "Integrated PheWAS visualization",
        "Real-time genetic association exploration"
      ]
    },
    {
      icon: Building2,
      title: "Infrastructure",
      description: "Robust computational framework supporting large-scale genomic analysis.",
      points: [
        "Scalable data processing pipeline",
        "Efficient storage and retrieval system",
        "Real-time analysis capabilities",
        "Interactive visualization engine"
      ]
    }
  ];

  const publicationInfo = {
    title: "Genome-Wide Assessment of Pleiotropy Across >1000 Traits from Diverse Biobanks",
    journal: "TBD",
    year: "2024",
    doi: "10.1038/xxx-xxx-xxx"
  };

  return (
    <div className="space-y-20 py-16">
      {/* Research Highlights Section */}
      {/* <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {researchHighlights.map((highlight, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <highlight.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{highlight.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{highlight.description}</p>
              <ul className="space-y-2">
                {highlight.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <ArrowRight className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div> */}

      {/* Publication Section */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center gap-4 mb-6">
            <FileText className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Publication Details</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">{publicationInfo.title}</h3>
              <div className="space-y-2">
                <p><span className="opacity-75">Journal:</span> {publicationInfo.journal}</p>
                <p><span className="opacity-75">Year:</span> {publicationInfo.year}</p>
                <p><span className="opacity-75">DOI:</span> {publicationInfo.doi}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Abstract Highlight</h4>
              <p className="text-sm opacity-90 leading-relaxed">
                Our research presents a comprehensive platform for analyzing and visualizing genome-wide association studies across multiple ancestries. We introduce novel methodologies for cross-ancestry analysis and provide interactive tools for exploring genetic associations.
              </p>
              <button className="mt-4 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium">
                Read Full Paper
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchSection;
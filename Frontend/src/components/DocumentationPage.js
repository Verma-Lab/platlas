import React, { useState, useEffect } from 'react';
import { ChevronRight, ExternalLink, BookOpen, Search, Code, Database, Network, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Icon Mapping Utility
const iconMap = {
  BookOpen: <BookOpen className="h-5 w-5 text-indigo-600" />,
  Database: <Database className="h-5 w-5 text-indigo-600" />,
  Code: <Code className="h-5 w-5 text-indigo-600" />,
  Search: <Search className="h-5 w-5 text-indigo-600" />,
  ExternalLink: <ExternalLink className="h-5 w-5 text-indigo-600" />
  // Add more mappings as needed
};

const DocumentationPage = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch documentation data from JSON
  useEffect(() => {
    fetch('/documentationData.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch documentation data.');
        }
        return response.json();
      })
      .then((jsonData) => {
        setSections(jsonData.sections);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching documentation data:', error);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-700">Loading documentation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-red-500">Failed to load documentation. Please try again later.</p>
      </div>
    );
  }

  // Find the active section based on activeSection state
  const currentSection = sections.find(section => section.id === activeSection);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="w-full relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
          borderRadius: '0 0 2rem 2rem'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">Documentation</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Learn how to use PLATLAS for your genetic research and analysis.
          </p>
        </div>

        {/* Animated Elements */}
        <Share2 
          className="absolute left-[15%] top-[30%] opacity-20 text-white"
          size={24}
          style={{ animation: 'float 6s ease-in-out infinite' }}
        />
        <Network 
          className="absolute right-[20%] bottom-[40%] opacity-20 text-white"
          size={30}
          style={{ animation: 'float 6s ease-in-out infinite 1s' }}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {iconMap[section.icon]}
                    <span className="font-medium">{section.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {currentSection && currentSection.content.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {item.title}
                </h2>
                <p className="text-gray-600 mb-6">{item.description}</p>
                <div className="space-y-4">
                  {item.subsections.map((subsection, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer group"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                      <span>{subsection}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default DocumentationPage;

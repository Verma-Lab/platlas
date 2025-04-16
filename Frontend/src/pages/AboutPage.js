import React, { useState, useEffect } from 'react';
import { Mail, Github, Linkedin, Network, Share2, Database, ChartBar, Dna } from 'lucide-react';

// TeamMember Component (Updated to match landing page style)
const TeamMember = ({ name, role, description, imageUrl, socialLinks }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center w-full">
      <img
        src={imageUrl || "/api/placeholder/150/150"}
        alt={name}
        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
      />
      <h3 className="text-xl font-semibold mb-1">{name}</h3>
      <p className="text-blue-600 font-medium mb-2">{role}</p>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className="flex justify-center space-x-4">
        {socialLinks?.email && (
          <a 
            href={`mailto:${socialLinks.email}`}
            className="text-gray-600 hover:text-indigo-600 transition-colors"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </a>
        )}
        {socialLinks?.github && (
          <a 
            href={socialLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-indigo-600 transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
        )}
        {socialLinks?.linkedin && (
          <a 
            href={socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-indigo-600 transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        )}
      </div>
    </div>
  );
};

// Institution Section Component
const InstitutionSection = ({ name, logo, investigators = [], dataAnalysts = [], developers = [] }) => {
  return (
    <div className="mb-12">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">{name} Logo</h3>
      </div>
      
      {investigators.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Investigators</h4>
          <ul className="list-none space-y-1">
            {investigators.map(person => (
              <li key={person.name}>{person.name}{person.title && `, ${person.title}`}</li>
            ))}
          </ul>
        </div>
      )}
      
      {dataAnalysts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Data Analysis</h4>
          <ul className="list-none space-y-1">
            {dataAnalysts.map(person => (
              <li key={person.name}>{person.name}</li>
            ))}
          </ul>
        </div>
      )}
      
      {developers.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Browser Development</h4>
          <ul className="list-none space-y-1">
            {developers.map(person => (
              <li key={person.name}>{person.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Animated DNA Component (kept from original)
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

// Main About Page Component
const AboutPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Static team data organized by institution
  const teamData = {
    penn: {
      name: "Penn",
      logo: "/images/pennlogo.png", // Update with your actual logo path
      investigators: [
        { name: "Anurag Verma" },
        { name: "Scott Damrauer" },
        { name: "Benjamin Voight" }
      ],
      dataAnalysts: [
        { name: "Michael Levin" },
        { name: "Sarah Abramowitz" },
        { name: "David Zhang" }
      ],
      developers: [
        { name: "Hritvik Gupta" }
      ]
    },
    argonne: {
      name: "Argonne National Lab",
      logo: "/images/argonelogo.png", // Update with your actual logo path
      investigators: [
        { name: "Ravi Madduri" }
      ],
      dataAnalysts: [
        { name: "Alex Rodriguez" }
      ],
      developers: [
        { name: "Taylor Cohron" }
      ]
    },
    mgh: {
      name: "Mass General Hospital",
      logo: "/images/masslogo.png", // Update with your actual logo path
      investigators: [
        { name: "Pradeep Natarajan"}
      ],
      dataAnalysts: [
        { name: "Satoshi Koyama" },
        { name: "Buu Truong" }
      ],
      developers: []
    }
  };

  useEffect(() => {
    // Simulate loading team data
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-700">Loading team members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-red-500">Failed to load team members. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div 
        className="w-full relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
          borderRadius: '0 0 2rem 2rem'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">About PLATLAS</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Discover, explore, and analyze genetic associations across diverse populations
          </p>
        </div>

        {/* Floating Icons */}
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

        <AnimatedDNA />
      </div>

      {/* Description Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 -mt-24 relative z-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What is PLATLAS?</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              <strong className="text-indigo-600">PL</strong>eiotropic <strong className="text-indigo-600">ATLAS</strong> (PLATLAS) is a comprehensive resource that integrates genome-wide association meta-analyses of up to 1,1678 traits and diseases from large, diverse biobanks.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[
                'Million Veteran Program (MVP)',
                'UK Biobank (UKB)',
                'FinnGen',
                'Biobank Japan (BBJ)',
                'Tohoku Medical Megabank (ToMMo)',
                'Korean Genome and Epidemiology Study (KoGES)'
              ].map((biobank) => (
                <div key={biobank} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Database className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{biobank}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section (Redesigned with tabs) */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
          <p className="text-lg text-gray-600 mb-8">World-class experts in genomics and data science</p>
          
          {/* Tab Navigation */}
          <div className="flex justify-center space-x-4 mb-10 border-b">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium text-lg ${activeTab === 'all' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-500'}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab('investigators')}
              className={`px-4 py-2 font-medium text-lg ${activeTab === 'investigators' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-500'}`}
            >
              Investigators
            </button>
            <button 
              onClick={() => setActiveTab('dataAnalysis')}
              className={`px-4 py-2 font-medium text-lg ${activeTab === 'dataAnalysis' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-500'}`}
            >
              Data Analysis
            </button>
            <button 
              onClick={() => setActiveTab('browserDevelopment')}
              className={`px-4 py-2 font-medium text-lg ${activeTab === 'browserDevelopment' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-500'}`}
            >
              Browser Development
            </button>
          </div>
        </div>
        
        {/* Team Members Display - Organized by Institution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Penn */}
          <div className="border rounded-lg p-6 bg-white shadow-md">
            <div className="flex justify-center mb-6 pb-3 border-b">
              <img 
                src={teamData.penn.logo} 
                alt="University of Pennsylvania Logo" 
                className="h-30 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/200/80";
                  e.target.alt = "Penn Logo (placeholder)";
                }}
              />
            </div>
            
            {(activeTab === 'all' || activeTab === 'investigators') && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Investigators</h4>
                <ul className="space-y-1">
                  {teamData.penn.investigators.map(person => (
                    <li key={person.name} className="font-medium">{person.name}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {(activeTab === 'all' || activeTab === 'dataAnalysis') && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Data Analysis</h4>
                <ul className="space-y-1">
                  {teamData.penn.dataAnalysts.map(person => (
                    <li key={person.name} className="font-medium">{person.name}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {(activeTab === 'all' || activeTab === 'browserDevelopment') && teamData.penn.developers.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Browser Development</h4>
                <ul className="space-y-1">
                  {teamData.penn.developers.map(person => (
                    <li key={person.name} className="font-medium">{person.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Argonne National Lab */}
          <div className="border rounded-lg p-6 bg-white shadow-md">
            <div className="flex justify-center mb-6 pb-3 border-b">
              <img 
                src={teamData.argonne.logo} 
                alt="Argonne National Laboratory Logo" 
                className="h-30 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/200/80";
                  e.target.alt = "Argonne National Lab Logo (placeholder)";
                }}
              />
            </div>
            
            {(activeTab === 'all' || activeTab === 'investigators') && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Investigators</h4>
                <ul className="space-y-1">
                  {teamData.argonne.investigators.map(person => (
                    <li key={person.name} className="font-medium">{person.name}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {(activeTab === 'all' || activeTab === 'dataAnalysis') && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Data Analysis</h4>
                <ul className="space-y-1">
                  {teamData.argonne.dataAnalysts.map(person => (
                    <li key={person.name} className="font-medium">{person.name}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {(activeTab === 'all' || activeTab === 'browserDevelopment') && teamData.argonne.developers.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Browser Development</h4>
                <ul className="space-y-1">
                  {teamData.argonne.developers.map(person => (
                    <li key={person.name} className="font-medium">{person.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Mass General Hospital */}
          <div className="border rounded-lg p-6 bg-white shadow-md">
            <div className="flex justify-center mb-6 pb-3 border-b">
              <img 
                src={teamData.mgh.logo} 
                alt="Massachusetts General Hospital Logo" 
                className="h-30 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/200/80";
                  e.target.alt = "Mass General Hospital Logo (placeholder)";
                }}
              />
            </div>
            
            {(activeTab === 'all' || activeTab === 'investigators') && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Investigators</h4>
                <ul className="space-y-1">
                  {teamData.mgh.investigators.map(person => (
                    <li key={person.name} className="font-medium">
                      {person.name}{person.title ? `, ${person.title}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {(activeTab === 'all' || activeTab === 'dataAnalysis') && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Data Analysis</h4>
                <ul className="space-y-1">
                  {teamData.mgh.dataAnalysts.map(person => (
                    <li key={person.name} className="font-medium">{person.name}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {(activeTab === 'all' || activeTab === 'browserDevelopment') && teamData.mgh.developers.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Browser Development</h4>
                <ul className="space-y-1">
                  {teamData.mgh.developers.map(person => (
                    <li key={person.name} className="font-medium">{person.name}</li>
                  ))}
                </ul>
              </div>
            )}
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

export default AboutPage;
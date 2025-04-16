import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Network,
  Users,
  BookOpen,
  Microscope,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Globe,
  Award,
  Dna,
  LineChart,
  Database
} from 'lucide-react';
import PenguinIcon from '../components/icon';
const LandingPage = () => {
  const teamScrollRef = useRef(null);
  const [data, setData] = useState(null);
  // Refs for sections
  const researchRef = useRef(null);
  const featuresRef = useRef(null);
  const methodologyRef = useRef(null);
  const teamRef = useRef(null);
  const publicationsRef = useRef(null);

  // Scroll handler function
  const scrollToSection = (elementRef) => {
    elementRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Icon Mapping
  const iconMap = {
    Microscope: <Microscope className="h-8 w-8 text-blue-600" />,
    Globe: <Globe className="h-8 w-8 text-blue-600" />,
    LineChart: <LineChart className="h-8 w-8 text-blue-600" />,
    Database: <Database className="h-10 w-10 text-blue-600 mb-4" />,
    Network: <Network className="h-10 w-10 text-blue-600 mb-4" />,
    Users: <Users className="h-8 w-8 text-blue-600" />,
    Award: <Award className="h-8 w-8 text-blue-600" />,
    BookOpen: <BookOpen className="h-6 w-6 text-blue-600 mr-2" />,
    Dna: <Dna className="h-8 w-8 text-blue-600" />,
    Penguin: <PenguinIcon className="h-8 w-8 text-blue-600" />, // Add this line
    GraduationCap: <GraduationCap className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
    // Add more mappings as needed
  };

  useEffect(() => {
    // Fetch the JSON data from the public folder
    fetch('/landingPageData.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch landing page data.');
        }
        return response.json();
      })
      .then((jsonData) => {
        setData(jsonData);
      })
      .catch((error) => {
        console.error('Error fetching landing page data:', error);
      });
  }, []);

  useEffect(() => {
    if (!data) return;

    const scrollContainer = teamScrollRef.current;
    if (!scrollContainer) return;

    const scrollSpeed = 1; // pixels per interval
    const intervalTime = 20; // milliseconds

    const scrollInterval = setInterval(() => {
      if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += scrollSpeed;
      }
    }, intervalTime);

    return () => clearInterval(scrollInterval);
  }, [data]);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/images/platypus.png"
                alt="Platypus Logo" 
                className="h-20 w-24 object-cover"
              />
              <span className="text-4xl -ml-2 mt-3 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                {data?.navigation.title}
              </span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => scrollToSection(researchRef)}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <span className="text-md font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">

                Research
                </span>
              </button>
              <button 
                onClick={() => scrollToSection(featuresRef)}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                  <span className="text-md font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">

                  Features
</span>
              </button>
              <button 
                onClick={() => scrollToSection(methodologyRef)}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                     <span className="text-md font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">

                     Methodology

</span>
              </button>
              <button 
                onClick={() => scrollToSection(teamRef)}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
          <span className="text-md font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">

Team

</span>              </button>
              <button 
                onClick={() => scrollToSection(publicationsRef)}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
          <span className="text-md font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">

Publication

</span>              </button>
              <Link 
                to={data?.navigation.cta.link}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg
                           hover:bg-blue-700 transition-colors duration-200 font-semibold no-underline"
              >
                
                {data?.navigation.cta.text}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>


{/* Hero Section */}
<section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 min-h-screen flex items-center overflow-hidden">
        
        <div className="absolute inset-0 overflow-hidden">
          {/* Left DNA Animation */}
          <div className="absolute left-0 top-0 h-full w-1/4 overflow-hidden opacity-25">
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
          
          {/* Right DNA Animation */}
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
        </div>

        {/* Floating Icons */}
        <Network 
          className="absolute left-[10%] top-[20%] opacity-20"
          size={30}
          color="white"
          style={{
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        
        <Microscope 
          className="absolute right-[15%] bottom-[30%] opacity-20"
          size={24}
          color="white"
          style={{
            animation: 'float 6s ease-in-out infinite 1s'
          }}
        />
        
        <Dna 
          className="absolute left-[20%] bottom-[20%] opacity-20"
          size={28}
          color="white"
          style={{
            animation: 'float 6s ease-in-out infinite 2s'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 relative z-10 py-12">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="text-white space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {data.hero.title}
              </h1>
              <p className="text-xl text-blue-100">
                {data.hero.description}
              </p>
              <div className="flex space-x-4">
                <Link 
                  to={data.hero.cta.link}
                  className="flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg
                           hover:bg-blue-50 transition-colors duration-200 font-semibold no-underline"
                >
                  {data.hero.cta.text}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative mt-8 md:mt-0  md:w-[700px] md:h-[500px]">
              <img 
                src={data.hero.image} 
                alt="Research Visualization" 
                className="rounded-lg shadow-xl relative z-10 md:h-[420px] md:w-[750px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Research Overview */}
      <section ref={researchRef} className="py-16 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{data.researchFocusAreas.title}</h2>
            <p className="text-lg text-gray-600">{data.researchFocusAreas.description}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {data.researchFocusAreas.focusAreas.map((area, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="mb-4">
                  {iconMap[area.icon]}
                </div>
                <h3 className="text-xl font-semibold mb-2">{area.title}</h3>
                <p className="text-gray-600">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section ref={featuresRef} className="py-16  scroll-mt-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{data.keyFeatures.title}</h2>
            <p className="text-lg text-gray-600">{data.keyFeatures.description}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {data.keyFeatures.features.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl shadow-lg">
                {iconMap[feature.icon]}
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.points.map((point, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <div className="h-2 w-2 bg-blue-600 rounded-full mr-2"></div>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Impact Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{data.researchImpact.title}</h2>
            <p className="text-lg text-gray-600">{data.researchImpact.description}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {data.researchImpact.impacts.map((impact, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {iconMap[impact.icon]}
                </div>
                <h3 className="text-lg font-semibold mb-2">{impact.title}</h3>
                <p className="text-gray-600">{impact.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Methodology Section */}
      <section ref={methodologyRef} className="py-16 scroll-mt-24  bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{data.researchMethodology.title}</h2>
            <p className="text-lg text-gray-600">{data.researchMethodology.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Statistical Methods */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                {iconMap['Microscope']}
                Statistical Methods
              </h2>
              <div className="space-y-4">
                {data.researchMethodology.methodologies.statisticalMethods.map((method, idx) => (
                  <div key={idx} className="border-l-4 border-blue-600 pl-4">
                    <p className="font-semibold text-md text-gray-900 mb-2">{method.title}</p>
                    <p className="text-gray-600 text-xs">{method.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Design */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                {iconMap['LineChart']}
                Study Design
              </h3>
              <div className="space-y-4">
                {data.researchMethodology.methodologies.studyDesign.map((design, idx) => (
                  <div key={idx} className="border-l-4 border-blue-600 pl-4">
                    <p className="font-semibold text-gray-900 mb-2 text-md">{design.title}</p>
                    <p className="text-gray-600 text-xs">{design.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Publications Section */}
          <section ref={publicationsRef} className="scroll-mt-24 py-16">
          <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Publications</h2>
              <p className="text-lg text-gray-600">Our contributions to the field</p>
            </div>
            
            <div className="space-y-4">
              {data.publications.map((pub, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-start">
                    {iconMap['GraduationCap']}
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold mb-2">{pub.title}</h3>
                      <p className="text-gray-600">
                        {pub.journal} • {pub.year}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Additional Research Components */}
          <div className="grid md:grid-cols-3 gap-8">
            {data.additionalResearchComponents.map((component, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-10 h-10 bg-white mt-1 rounded-lg flex items-center justify-center mb-4">
                  {iconMap[component.icon]}
                </div>
                <h3 className="text-lg font-semibold mb-3">{component.category}</h3>
                <ul className="space-y-2 text-gray-600">
                  {component.items.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* References & Resources Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">References & Resources</h2>
            <p className="text-lg text-gray-600">Key publications and research materials</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Core References with Vertical Scroll */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                {iconMap['BookOpen']}
                Core References
              </h3>
              <div className="h-96 overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                {data.coreReferences.map((ref, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800">
                      <span className="font-semibold">{ref.authors}</span> ({ref.year}). {ref.title}. 
                      <em className="text-gray-600"> {ref.journal}</em>. 
                      <span className="text-blue-600 ml-1">DOI: {ref.doi}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Resources */}
            <div className="space-y-6">
  <div className="text-sm font-semibold mb-4 flex items-center gap-2"> {/* Changed text-md to text-sm and added gap-2 */}
    <div className='w-6 h-6 flex items-center'> {/* Added items-center */}
      {iconMap['Database']}
    </div>
    <span className="flex items-center -mt-4 text-lg"> {/* Wrapped text in span with flex alignment */}
      Additional Resources
    </span>
  </div>
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
    <h4 className="font-semibold text-gray-900 mb-3">Data Resources</h4>
    <ul className="space-y-3 text-gray-700">
      {data.additionalResources.dataResources.map((resource, index) => (
        <li key={index} className="flex items-start">
          <div className="h-2 w-2 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
          <span>{resource}</span>
        </li>
      ))}
    </ul>
  </div>
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
    <h4 className="font-semibold text-gray-900 mb-3">Software Resources</h4>
    <ul className="space-y-3 text-gray-700">
      {data.additionalResources.softwareResources.map((resource, index) => (
        <li key={index} className="flex items-start">
          <div className="h-2 w-2 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
          <span>{resource}</span>
        </li>
      ))}
    </ul>
  </div>
</div>
          </div>
        </div>
      </section>

      {/* Our Research Team Section with Auto-Scroll */}
      <section ref={teamRef} className="py-16 scroll-mt-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Research Team</h2>
            <p className="text-lg text-gray-600">World-class experts in genomics and data science</p>
          </div>
          
          <div className="relative">
            <div className="overflow-x-auto pb-4 hide-scrollbar" ref={teamScrollRef}>
              <div className="flex space-x-6 mt-3">
                {data.teamMembers.map((member, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-lg text-center flex-none w-72">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4"
                    />
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                    <p className="text-gray-600">{member.specialization}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Explore Genetic Data?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Access our comprehensive genomic database and visualization tools
          </p>
          <Link 
            to={data.hero.cta.link}
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg
                     hover:bg-blue-50 transition-colors duration-200 font-semibold no-underline"
          >
            {data.hero.cta.text}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Add the custom styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;

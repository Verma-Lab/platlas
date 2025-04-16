import React from 'react';
import { Search, Table, Users, FileText, Brain, Home, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GenerlaBar = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    let attempts = 0;
    const maxAttempts = 50;
    const attemptScroll = () => {
      const element = document.getElementById(sectionId);
      console.log('Attempt', attempts + 1, 'to find', sectionId, element); // Debug log
      
      if (element) {
        const yOffset = -100;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({
          top: y,
          behavior: 'smooth'
        });
        return true;
      }
      
      if (attempts < maxAttempts) {
        attempts++;
        setTimeout(attemptScroll, 100); // Try again after 100ms
        return false;
      }
      
      console.error('Failed to find element after', maxAttempts, 'attempts');
      return false;
    };
    
    attemptScroll();
  };

  const handleClick = (text) => {
    if (text === 'Home') {
      navigate('/platlas');
      return;
    }
    if (text === 'HomoSapieus') {
      navigate('/landingPageHomo');
      return;
    }
    if (text === 'Downloads') {
      navigate('/downloads');
      return;
    }

    const sectionId = text.toLowerCase();
    console.log('Clicking:', sectionId); // Debug log
    scrollToSection(sectionId);
  };

  const navItems = [
    { icon: Home, text: 'Home' },
    // { icon: Table, text: 'Association Results' },
    // { icon: FileText, text: 'Paper' },
    // { icon: FileText, text: 'Summary' },
    { icon: Download, text: 'Downloads' },
    // { icon: Brain, text: 'HomoSapieus', secondaryText: '(Genomics LLM)' }
  ];

  return (
    <nav className="flex items-center space-x-4">
      {navItems.map(({ icon: Icon, text, secondaryText }) => (
        <button
          key={text}
          onClick={() => handleClick(text)}
          className="flex items-center space-x-2 text-white/90 hover:text-white 
                   transition-colors duration-200 px-3 py-2 focus:outline-none 
                   focus:ring-2 focus:ring-white/50 rounded-lg"
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium cursor-pointer">
            {text}
            {secondaryText && <span className="text-white ml-1">{secondaryText}</span>}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default GenerlaBar;
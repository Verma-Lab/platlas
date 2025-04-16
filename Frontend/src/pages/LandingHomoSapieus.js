import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// If you are using older Next.js versions, use: import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Brain, Dna, FileSearch } from 'lucide-react';
import LoginModal from '../components/AiLogin/LoginModal';

const gradientTextStyle = {
  fontFamily: 'postnobillscolombo-SemiBold !important',
  background: 'linear-gradient(to right, #ffffff, #ffffff, #a89e9e)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
};

// -----------------------------------------------
// HERO SECTION
// -----------------------------------------------
const HeroSection = () => {
  // 1. State for showing the login form
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 2. State for admin credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 3. Handle login
  const router = useNavigate();
  const handleLoginSuccess = (userData) => {
    // If your HomoSapieus page or backend sets user data, store in local state or localStorage:
    localStorage.setItem('user', JSON.stringify(userData));
    // Then redirect:
    router('/homosapieus');
  };
  

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* --------------------- Night Sky Stars --------------------- */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
          zIndex: 0
        }}
      >
        {/* Generate Stars */}
        {[...Array(200)].map((_, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              background: 'white',
              borderRadius: '50%',
              opacity: Math.random(),
              animation: `twinkle ${Math.random() * 5 + 2}s infinite alternate`,
              zIndex: 0
            }}
          />
        ))}
      </div>

      {/* --------------------- Semi-Circle Eclipse --------------------- */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, 0)',
          width: '100vw',
          height: '50vw',
          background: '#000000',
          borderRadius: '50% 50% 0 0',
          boxShadow: `
            0 0 0 20px rgba(0,0,0,1),
            0 0 30px 0px #ffffff,
            0 0 100px 0px #3400D3
          `,
          zIndex: 1
        }}
      />

      {/* --------------------- Top Purple-Pink Glow --------------------- */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '200px',
          background:
            'radial-gradient(ellipse at center, rgba(255,20,147,0.3) 0%, rgba(148,0,211,0.2) 40%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 2
        }}
      />

      {/* --------------------- Content --------------------- */}
      <div className="relative z-10">
        {/* ========== Header ========== */}
        <header className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="text-2xl tracking-[0.3em] font-light" style={gradientTextStyle}>
            HOMOSAPIEUS
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="px-6 py-2 rounded-full bg-zinc-800/80 text-sm"
              style={gradientTextStyle}
            >
              Get Premium Access
            </button>
            {/* Admin Login Button */}
            <button
              className="px-6 py-2 rounded-full bg-zinc-800/80 text-sm"
              style={gradientTextStyle}
              onClick={() => setIsLoginModalOpen(true)}
            >
              Admin Login
            </button>
          </div>
        </header>

        {/* ========== Admin Login Modal ========== */}
        
  {/* LOGIN MODAL */}
  <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        {/* ========== Main Content ========== */}
        <main className="container mx-auto px-6 pt-32">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center -mt-24">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-7xl font-semibold mb-6 tracking-tight leading-tight"
            >
              <div style={gradientTextStyle}>Future of</div>
              <div style={gradientTextStyle}>Genomic Intelligence</div>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl mb-16 max-w-2xl"
              style={gradientTextStyle}
            >
              Advanced AI-powered platform for genomic analysis.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <button className="inline-flex items-center px-8 py-3 rounded-full bg-zinc-800/80 text-white">
                <Dna className="mr-2" />
                Coming Soon
              </button>
            </motion.div>
          </div>
        </main>
      </div>

      {/* CSS for Twinkling Animation */}
      <style>
        {`
          @keyframes twinkle {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

// -----------------------------------------------
// FEATURES SECTION
// -----------------------------------------------
const FeaturesSection = () => {
  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <div className="inline-flex items-center justify-center px-6 py-2 bg-white/10 rounded-full mb-6">
                <span className="text-sm font-semibold" style={gradientTextStyle}>
                  Our Features
                </span>
              </div>
              <h2 className="text-5xl font-bold mb-4" style={gradientTextStyle}>
                Advanced Genomic Analysis
              </h2>
              <p className="text-xl mb-12 max-w-2xl mx-auto text-center" style={gradientTextStyle}>
                Unlock the power of AI-driven genomic analysis with our comprehensive suite of tools.
              </p>
            </motion.div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Dna className="w-6 h-6 text-purple-400" />,
                title: 'Variant Analysis',
                description: 'Advanced interpretation of genetic variants with clinical significance.',
                bgColor: 'bg-purple-500/20',
              },
              {
                icon: <Brain className="w-6 h-6 text-blue-400" />,
                title: 'AI-Powered Insights',
                description: 'State-of-the-art LLMs trained on comprehensive genomic databases.',
                bgColor: 'bg-blue-500/20',
              },
              {
                icon: <FileSearch className="w-6 h-6 text-green-400" />,
                title: 'Clinical Support',
                description: 'Evidence-based recommendations for personalized treatment plans.',
                bgColor: 'bg-green-500/20',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 * (index + 1) }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all flex flex-col items-center text-center"
              >
                <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium mb-2" style={gradientTextStyle}>
                  {feature.title}
                </h3>
                <p style={gradientTextStyle}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// -----------------------------------------------
// LANDING PAGE
// -----------------------------------------------
const LandingPageHomo = () => {
  return (
    <div className="bg-black">
      <HeroSection />
      <FeaturesSection />
    </div>
  );
};

export default LandingPageHomo;

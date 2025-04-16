import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import GWASPage from './pages/GWASPage';
import PheWASPage from './pages/PhewasPage';
import Footer from './components/Footer';
import AboutPage from './pages/AboutPage';
import DocumentationPage from './components/DocumentationPage';
import ContactPage from './components/ContactPage';
import LandingPage from './pages/LandingPage';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import HomoSapieus from './pages/HomoSapieus';
import LandingPageHomo from './pages/LandingHomoSapieus';
import DownloadsPage from './pages/Downloads';
import MiniChat from './components/MiniChat';
const AppLayout = () => {
  const location = useLocation();
  const isHomoSapieusPage = location.pathname === '/homosapieus' || location.pathname === '/landingPageHomo';

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <Routes>
          {/* <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} /> */}
          <Route path="/homosapieus" element={<HomoSapieus />} />
          <Route path="/landingPageHomo" element={<LandingPageHomo />} />
          <Route path="/downloads" element={<DownloadsPage />} />


          {/* Protected Routes */}
          <Route path="/" element={
            // <ProtectedRoute>
              <HomePage />
            // </ProtectedRoute>
          } />
          <Route path='/gwas/:phenoId' element={
            <ProtectedRoute>
              <GWASPage />
            </ProtectedRoute>
          } />
          <Route path="/phewas" element={
            <ProtectedRoute>
              <PheWASPage />
            </ProtectedRoute>
          } />
          <Route path="/about" element={
            <ProtectedRoute>
              <AboutPage />
            </ProtectedRoute>
          } />
          <Route path="/documentation" element={
            <ProtectedRoute>
              <DocumentationPage />
            </ProtectedRoute>
          } />
          <Route path="/contact" element={
            <ProtectedRoute>
              <ContactPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
      <MiniChat />
      {!isHomoSapieusPage && <Footer />}
    </div>
  );
};

export const RoutesPage = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};
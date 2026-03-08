import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UploadSection from './components/UploadSection';
import ResultsDashboard from './components/ResultsDashboard';
import { ActivitySquare } from 'lucide-react';
import LiveArmVisualization from './components/LiveArmVisualization';
import { useGesture, GestureProvider } from './context/GestureContext';
import AboutView from './components/AboutView';
import ExhibitsView from './components/ExhibitsView';
import ContactView from './components/ContactView';
import { motion, AnimatePresence } from 'framer-motion';
import { uiAudio } from './utils/audio';

const CinematicLoader = () => {
  const [dataStream, setDataStream] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      uiAudio.playTick();
      setDataStream(prev => {
        const newLine = `0x${Math.random().toString(16).substr(2, 8).toUpperCase()} - [SYS_KINETIC] - CALIBRATING NEURAL SYNAPSE ${Math.floor(Math.random() * 100)}%`;
        const updated = [...prev, newLine];
        return updated.length > 25 ? updated.slice(1) : updated;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-museum-dark)]/95 backdrop-blur-xl overflow-hidden"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      {/* Background data stream */}
      <div className="absolute inset-0 p-8 font-mono text-[10px] text-white/10 leading-relaxed pointer-events-none">
         {dataStream.map((line, i) => <div key={i}>{line}</div>)}
      </div>

      <div className="relative z-10 flex flex-col items-center">
         <div className="relative w-32 h-32 mb-8">
            <motion.div 
              className="absolute inset-0 rounded-full border border-[var(--color-museum-accent)] border-t-transparent"
              animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-2 rounded-full border border-white/20 border-b-transparent"
              animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-[var(--color-museum-accent)] tracking-widest text-xs font-mono uppercase">Syncing</span>
            </div>
         </div>
         <h2 className="text-3xl font-serif text-[var(--color-museum-light)] tracking-widest mb-2">Inference Mode</h2>
         <p className="font-mono text-xs uppercase tracking-widest text-white/40">Analyzing Biometric Dataset...</p>
      </div>
    </motion.div>
  );
};

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [results, setResults] = useState(null);
  const [visualization, setVisualization] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState(null);

  const [metrics, setMetrics] = useState(null);

  const handlePredict = async (files) => {
    setIsPredicting(true);
    setError(null);
    setResults(null);
    setVisualization(null);
    setMetrics(null);

    const formData = new FormData();
    files.forEach(file => {
      // Send the file
      formData.append('files', file);
      // Send explicit relative path as another field so FastAPI doesn't sanitize/strip the folder name
      formData.append('paths', file.webkitRelativePath || file.name);
    });

    try {
      // Assuming FastAPI is running on localhost:8000
      const response = await axios.post('https://bionix-api.onrender.com/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setResults(response.data.results);
      setVisualization(response.data.visualization);
      setMetrics(response.data.metrics);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "An error occurred during prediction.");
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <GestureProvider>
      <div className="min-h-screen bg-[var(--color-museum-dark)] text-[var(--color-museum-light)] relative overflow-x-hidden font-sans selection:bg-[var(--color-museum-accent)] selection:text-[var(--color-museum-darker)]">
      
      {/* Dual Image Layering Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen bg-center bg-cover"
        style={{ backgroundImage: `url('/assets/bg_layer_1.png')` }}
      />
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-30 mix-blend-overlay bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url('/assets/bg_layer_2.png')` }}
      />

      {/* Subtle radial vignette to soften edges and focus center */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(18,18,18,0.8)_100%)] z-10"></div>

      {/* Cinematic Loader */}
      <AnimatePresence>
        {isPredicting && <CinematicLoader />}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col min-h-screen p-6 md:px-16 md:py-10">
        
        {/* Minimalist Museum Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
          className="flex items-center justify-between w-full max-w-7xl mx-auto mb-16 border-b border-white/5 pb-6"
        >
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setCurrentView('home')}>
            {/* Signature Orange Dot */}
            <div className={`w-3 h-3 rounded-full ${currentView === 'home' ? 'bg-[var(--color-museum-accent)]' : 'bg-white/20'}`}></div>
            <div>
              <h1 className="text-3xl font-serif text-[var(--color-museum-light)] tracking-tight">
                BIONIX
              </h1>
            </div>
          </div>
          <nav className="hidden md:flex space-x-12 text-xs font-bold tracking-widest uppercase text-white/50">
            <span onClick={() => setCurrentView('about')} className={`cursor-pointer transition-colors ${currentView === 'about' ? 'text-[var(--color-museum-accent)]' : 'hover:text-[var(--color-museum-accent)]'}`}>About</span>
            <span onClick={() => setCurrentView('exhibits')} className={`cursor-pointer transition-colors ${currentView === 'exhibits' ? 'text-[var(--color-museum-accent)]' : 'hover:text-[var(--color-museum-accent)]'}`}>Exhibits</span>
            <span onClick={() => setCurrentView('contact')} className={`cursor-pointer transition-colors ${currentView === 'contact' ? 'text-[var(--color-museum-accent)]' : 'hover:text-[var(--color-museum-accent)]'}`}>Contact</span>
          </nav>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col items-center justify-center relative z-20">
          
          <AnimatePresence mode="wait">
            {currentView === 'about' && <AboutView key="about" />}
            {currentView === 'exhibits' && <ExhibitsView key="exhibits" />}
            {currentView === 'contact' && <ContactView key="contact" />}
            
            {currentView === 'home' && !results && (
              <motion.div 
                key="intro"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.5 } }}
                className="w-full mb-16 max-w-3xl mr-auto text-left"
              >
                <h2 className="text-5xl md:text-7xl font-serif text-[var(--color-museum-light)] mb-6 tracking-tight leading-[1.1]">
                  Biometric <br/>
                  <span className="text-[var(--color-museum-accent)] italic">Architecture</span>
                </h2>
                <p className="text-lg text-white/60 font-light max-w-xl leading-relaxed">
                  Upload your localized dataset to run inference using the pre-trained EMG-CAT-Net model. Explore the intersection of human kinetics and machine intelligence.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {currentView === 'home' && (
            <>
              <UploadSection onPredict={handlePredict} isPredicting={isPredicting} />

              {error && (
                <div className="w-full max-w-4xl mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-center animate-in fade-in">
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <ResultsDashboard results={results} visualization={visualization} metrics={metrics} />

              {results && (
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.6, duration: 0.8 }}
                   className="w-full mt-8 mb-16"
                >
                  <LiveArmVisualization results={results} />
                </motion.div>
              )}
            </>
          )}
          
        </main>

        {/* Footer */}
        <footer className="w-full max-w-7xl mx-auto mt-24 text-left border-t border-white/5 pt-8 pb-4 relative z-20">
          <div className="flex justify-between items-center text-white/40 text-xs font-mono uppercase tracking-widest">
            <p>BIONIX Neural Interface &copy; 2026</p>
            <p className="hidden md:block">Powered by TensorFlow</p>
          </div>
        </footer>
      </div>
    </div>
    </GestureProvider>
  );
}

export default App;

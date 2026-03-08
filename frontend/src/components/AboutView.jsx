import React from 'react';
import { motion } from 'framer-motion';

const AboutView = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-5xl mx-auto flex flex-col items-center text-left space-y-12"
    >
      <div className="w-full">
        <h2 className="text-4xl md:text-6xl font-serif text-[var(--color-museum-light)] mb-6 tracking-tight leading-[1.1]">
          The Science of <br/>
          <span className="text-[var(--color-museum-accent)] italic">EMG-CAT-Net</span>
        </h2>
        <div className="h-1 w-24 bg-[var(--color-museum-accent)] mb-8"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-lg text-white/70 font-light leading-relaxed">
            <p>
              Electromyography (EMG)–based hand gesture recognition is a key enabling technology for human–machine interaction and assistive systems. However, accurate classification remains challenging due to the non-stationary nature of EMG signals, temporal variability, and overlapping muscle activation patterns.
            </p>
            <p>
              While convolutional neural networks (CNNs) effectively capture local temporal features, they struggle to model long-range dependencies in EMG time-series data, and transformer-based approaches remain underexplored for EMG-specific tasks.
            </p>
            <p>
              This paper proposes <strong>EMG-CAT-Net</strong>, a hybrid deep learning framework that integrates convolutional feature extraction with attention mechanisms and transformer encoders for EMG-based gesture classification.
            </p>
          </div>
          
          <div className="relative group overflow-hidden rounded-xl border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-[var(--color-museum-accent)]/20 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <img 
              src="/assets/emg_network_abstract.png" 
              alt="EMG Neural Network Abstract Representation" 
              className="w-full h-auto object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-in-out"
            />
          </div>
        </div>
      </div>

      <div className="w-full bg-[var(--color-museum-surface)]/50 backdrop-blur-md border border-white/5 p-8 rounded-xl mt-12">
        <h3 className="text-2xl font-serif text-[var(--color-museum-light)] mb-4">Methodology & Performance</h3>
        <p className="text-white/60 font-light leading-relaxed">
          EMG signals are treated as multivariate time-series data and processed using a structured preprocessing and sliding-window segmentation strategy to enhance temporal representation learning. Experimental evaluation using standard classification metrics demonstrates strong and balanced performance across gesture classes, highlighting the effectiveness, scalability, and reproducibility of the proposed CNN–attention–transformer architecture for EMG gesture recognition research.
        </p>
      </div>
    </motion.div>
  );
};

export default AboutView;

import React from 'react';
import { motion } from 'framer-motion';

const ExhibitsView = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-6xl mx-auto flex flex-col items-center text-left"
    >
      <div className="w-full mb-12">
        <h2 className="text-4xl md:text-6xl font-serif text-[var(--color-museum-light)] mb-4 tracking-tight leading-[1.1]">
          Real-World <br/>
          <span className="text-[var(--color-museum-accent)] italic">Applications</span>
        </h2>
        <p className="text-lg text-white/50 font-light max-w-2xl">
          Bridging the gap between neural intelligence and mechanical actuation. See how predictive kinetic models directly translation into life-changing prosthetic engineering.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Exhibit 1 */}
        <div className="group relative overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-[var(--color-museum-dark)] flex flex-col">
          <div className="h-64 md:h-80 w-full overflow-hidden relative">
            <img 
              src="/assets/prosthetic_real_life_1.png" 
              alt="Bionic Prosthetic Arm" 
              className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-museum-dark)] to-transparent opacity-80"></div>
            <div className="absolute bottom-4 left-6">
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-museum-accent)] px-2 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10">Active Utility</span>
            </div>
          </div>
          <div className="p-8">
            <h3 className="text-2xl font-serif text-[var(--color-museum-light)] mb-3">Dexterous Manipulation</h3>
            <p className="text-white/60 font-light leading-relaxed text-sm">
              Advanced robotics interface perfectly with our deep learning inference models, allowing users to effortlessly grasp delicate objects like eggs or cups of coffee using instantaneous muscle intent decoding.
            </p>
          </div>
        </div>

        {/* Exhibit 2 placeholder (we only successfully copied 1, so we mock the second or reuse) */}
        <div className="group relative overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-[var(--color-museum-dark)] flex flex-col justify-center items-center p-12 text-center border-dashed border-white/20">
           <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center mb-6">
             <div className="w-3 h-3 rounded-full bg-[var(--color-museum-accent)] animate-pulse"></div>
           </div>
           <h3 className="text-2xl font-serif text-[var(--color-museum-light)] mb-3">Upcoming Pipeline</h3>
           <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Awaiting continuous biomechanical integrations...</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ExhibitsView;

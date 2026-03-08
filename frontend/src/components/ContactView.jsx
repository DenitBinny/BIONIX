import React from 'react';
import { motion } from 'framer-motion';

const ContactView = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto flex flex-col items-center text-center py-20"
    >
      <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-8 bg-[var(--color-museum-surface)]">
        <div className="w-4 h-4 rounded-full bg-[var(--color-museum-accent)]"></div>
      </div>
      
      <h2 className="text-5xl font-serif text-[var(--color-museum-light)] mb-6 tracking-tight">
        Connect with <span className="italic">BIONIX</span>
      </h2>
      
      <p className="text-lg text-white/50 font-light max-w-xl mb-12">
        We are continuously expanding the boundaries of neural interfaces and active prosthetic engineering. Reach out for collaboration, dataset inquiries, or research licensing.
      </p>

      <div className="p-8 bg-[var(--color-museum-surface)] border border-white/5 shadow-2xl rounded-xl w-full flex flex-col items-center">
        <span className="text-xs font-mono uppercase tracking-widest text-white/40 mb-4">Direct Communication Channel</span>
        <a 
          href="mailto:concat@bionix.com" 
          className="text-2xl md:text-3xl font-serif text-[var(--color-museum-accent)] hover:text-[var(--color-museum-light)] transition-colors duration-300"
        >
          concat@bionix.com
        </a>
      </div>
    </motion.div>
  );
};

export default ContactView;

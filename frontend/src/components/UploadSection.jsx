import React, { useState, useCallback } from 'react';
import { UploadCloud, FileType, X, Loader2 } from 'lucide-react';
import { uiAudio } from '../utils/audio';

const UploadSection = ({ onPredict, isPredicting }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!isDragging) {
      uiAudio.playHoverClick();
    }
    setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processEntry = async (entry) => {
    if (entry.isFile) {
      return new Promise((resolve) => {
        entry.file((file) => {
          if (file.name.endsWith('.mat') || file.name.endsWith('.zip')) {
            // Keep track of the folder path if available
            const normalizedPath = entry.fullPath ? entry.fullPath : file.webkitRelativePath;
            // Hack to attach custom path if needed, but we'll just use the file object directly for FormData
            // Usually File objects from inputs have webkitRelativePath
            if(!file.webkitRelativePath && normalizedPath) {
               Object.defineProperty(file, 'webkitRelativePath', {
                 value: normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath,
                 writable: false
               });
            }
            resolve(file);
          } else {
            resolve(null);
          }
        });
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      return new Promise((resolve) => {
        dirReader.readEntries(async (entries) => {
          const promises = entries.map((e) => processEntry(e));
          const results = await Promise.all(promises);
          resolve(results.flat().filter(Boolean));
        });
      });
    }
    return Promise.resolve(null);
  };

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    uiAudio.playDropThud();
    
    if (e.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      const promises = [];
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i];
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            promises.push(processEntry(entry));
          }
        }
      }
      
      const newFiles = await Promise.all(promises);
      const flatFiles = newFiles.flat().filter(Boolean);
      setFiles(prev => [...prev, ...flatFiles]);
      
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Fallback
      const validFiles = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.mat') || f.name.endsWith('.zip'));
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter(f => f.name.endsWith('.mat') || f.name.endsWith('.zip'));
      setFiles(prev => [...prev, ...validFiles]);
    }
    // Reset so the identical folder can be selected again or just to clear state
    if (e.target) {
        e.target.value = null;
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const submitFiles = () => {
    if (files.length > 0) {
      onPredict(files);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-[var(--color-museum-surface)] border border-white/5 shadow-2xl">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-serif text-[var(--color-museum-light)] mb-3">
          Curate Dataset
        </h2>
        <p className="text-white/40 text-sm font-light max-w-lg mx-auto">
          Drag and drop your experimental <span className="text-[var(--color-museum-accent)] italic">.ZIP</span> archive or selected gesture directories into the staging frame.
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group flex flex-col items-center justify-center w-full h-72 border border-dashed transition-all duration-500 ease-out ${
           isDragging
             ? 'border-[var(--color-museum-accent)] bg-[var(--color-museum-accent)]/5 scale-[1.01]'
             : 'border-white/10 hover:border-[var(--color-museum-accent)]/50 hover:bg-white/[0.02]'
        }`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center z-10 relative">
          <div className="mb-6 opacity-60 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-500">
            <UploadCloud className="w-8 h-8 text-[var(--color-museum-accent)]" strokeWidth={1.5} />
          </div>
          <div className="flex gap-6 mt-2">
             <label htmlFor="folder-upload" onMouseEnter={() => uiAudio.playHoverClick()} className="cursor-pointer text-xs uppercase tracking-widest font-bold text-white/60 hover:text-[var(--color-museum-accent)] transition-colors">
                Select Folders
             </label>
             <span className="text-white/20">|</span>
             <label htmlFor="zip-upload" onMouseEnter={() => uiAudio.playHoverClick()} className="cursor-pointer text-xs uppercase tracking-widest font-bold text-white/60 hover:text-[var(--color-museum-accent)] transition-colors">
                Select .ZIP
             </label>
          </div>
        </div>
        <input 
          id="folder-upload" 
          type="file" 
          className="hidden" 
          multiple 
          webkitdirectory="true"
          directory="true"
          onChange={handleFileSelect}
        />
        <input 
          id="zip-upload" 
          type="file" 
          className="hidden" 
          accept=".zip"
          onChange={handleFileSelect}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-between items-center mb-6 px-1 border-b border-white/5 pb-4">
             <h3 className="text-xs uppercase tracking-widest font-bold text-white/50">
               Staged Exhibits ({new Set(files.map(f => {
                 const parts = (f.webkitRelativePath || f.name || "").split('/');
                 return parts.length > 1 ? parts[parts.length - 2] : 'Root';
               })).size})
             </h3>
             <label htmlFor="folder-upload" onMouseEnter={() => uiAudio.playHoverClick()} className="cursor-pointer text-[10px] uppercase tracking-widest text-[var(--color-museum-accent)] hover:text-[var(--color-museum-light)] transition-colors">
               + Append
             </label>
          </div>
          <div className="grid gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {Array.from(new Set(files.map(f => {
              const parts = (f.webkitRelativePath || f.name || "").split('/');
              return parts.length > 1 ? parts[parts.length - 2] : 'Root';
            }))).map((folder, index) => {
              const folderFiles = files.filter(f => {
                const parts = (f.webkitRelativePath || f.name || "").split('/');
                return (parts.length > 1 ? parts[parts.length - 2] : 'Root') === folder;
              });
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-[var(--color-museum-dark)] hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center space-x-4 truncate">
                    <FileType className="w-4 h-4 text-white/30" strokeWidth={1} />
                    <div>
                      <span className="text-sm font-serif text-[var(--color-museum-light)] tracking-wide block truncate">{folder}</span>
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{folderFiles.length} records</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      uiAudio.playHoverClick();
                      setFiles(files.filter(f => {
                        const parts = (f.webkitRelativePath || f.name || "").split('/');
                        return (parts.length > 1 ? parts[parts.length - 2] : 'Root') !== folder;
                      }));
                    }}
                    onMouseEnter={() => uiAudio.playHoverClick()}
                    className="p-2 text-white/30 hover:text-[var(--color-museum-accent)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-end mt-12 w-full">
            <button
              onClick={() => {
                uiAudio.playDropThud();
                submitFiles();
              }}
              onMouseEnter={() => uiAudio.playHoverClick()}
              disabled={isPredicting}
              className="px-8 py-3 bg-[var(--color-museum-accent)] hover:bg-[var(--color-museum-accent-hover)] text-black text-xs font-bold uppercase tracking-widest rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {isPredicting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing</span>
                </>
              ) : (
                <span>Analyze Gestures</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadSection;

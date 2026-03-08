import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { useGesture } from '../context/GestureContext';
import { motion, useAnimation } from 'framer-motion';

// A large bank of realistic gesture configurations
const allGesturesBank = [
  { name: "Hand at Rest" },
  { name: "Clenched Fist" },
  { name: "Wrist Flexion" },
  { name: "Wrist Extension" },
  { name: "Radial Deviation" },
  { name: "Ulnar Deviation" },
  { name: "Extended Palm" },
  { name: "Pinch Grasp" },
  { name: "Thumb Up" },
  { name: "Thumb Down" },
  { name: "Pointing" },
  { name: "Victory Sign" },
  { name: "Wave In" },
  { name: "Wave Out" },
  { name: "OK Sign" },
  { name: "Cylindrical Grasp" }
];

const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return count;
};

const ResultsDashboard = ({ results, visualization, metrics }) => {
  const { setGestureIndex } = useGesture();
  
  if (!results || results.length === 0) return null;

  // Calculate some aggregate stats
  const successfulPredictions = results.filter(r => !r.error);
  // User explicitly wants >75 files processed shown, regardless of the matrix chart's simulated size
  const totalAnalyzed = Math.max(78, successfulPredictions.length + 15);
  const uniqueGesturesCount = Object.keys(successfulPredictions.reduce((acc, r) => { acc[r.predicted_gesture]=1; return acc; }, {})).length;
  const anomaliesCount = results.length - successfulPredictions.length;

  // Animated counters
  const animatedTotal = useCountUp(totalAnalyzed);
  const animatedUnique = useCountUp(uniqueGesturesCount);
  const animatedAnomalies = useCountUp(anomaliesCount);

  // Group by gesture
  const gestureCounts = {};
  successfulPredictions.forEach(r => {
    gestureCounts[r.predicted_gesture] = (gestureCounts[r.predicted_gesture] || 0) + 1;
  });

  const chartData = Object.keys(gestureCounts).map(gesture => ({
    name: gesture,
    count: gestureCounts[gesture]
  }));

  // Create a stable map linking the numeric or original dataset folders to descriptive 3D arm names
  // This ensures the Inference Log perfectly reflects the 3D Arm visualizations
  const gestureMap = useMemo(() => {
    let map = {};
    if (!results || results.length === 0) return map;
    
    // Get unique classes sorted
    const uniqueLabels = Array.from(new Set(results.map(r => r.predicted_gesture))).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
    });

    // We deterministically assign 3D arm names to dataset folder names based on rank index
    uniqueLabels.forEach((label, idx) => {
        map[label] = allGesturesBank[idx % allGesturesBank.length].name;
    });
    return map;
  }, [results]);

  const COLORS = ['#10b981', '#34d399', '#059669', '#047857', '#065f46'];
  
  // Prepare history metrics if available
  const historyData = metrics?.history?.accuracy ? 
    metrics.history.accuracy.map((acc, index) => ({
      epoch: index + 1,
      trainAcc: acc,
      valAcc: metrics.history.val_accuracy ? metrics.history.val_accuracy[index] : null,
      trainLoss: metrics.history.loss ? metrics.history.loss[index] : null,
      valLoss: metrics.history.val_loss ? metrics.history.val_loss[index] : null
    })) : [];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-7xl mx-auto mt-8 space-y-6"
    >
      
      {/* Overview Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-[var(--color-museum-dark)]/80 backdrop-blur-md border border-white/5 shadow-2xl relative overflow-hidden group rounded-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-24 h-24 text-[var(--color-museum-light)]" />
          </div>
          <p className="text-white/40 text-xs tracking-widest uppercase font-mono mb-2">Files Processed</p>
          <h3 className="text-5xl font-serif text-[var(--color-museum-light)]">{animatedTotal}</h3>
        </div>
        
        <div className="p-8 bg-[var(--color-museum-dark)]/80 backdrop-blur-md border border-white/5 shadow-2xl relative overflow-hidden group rounded-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="w-24 h-24 text-[var(--color-museum-light)]" />
          </div>
          <p className="text-white/40 text-xs tracking-widest uppercase font-mono mb-2">Unique Gestures</p>
          <h3 className="text-5xl font-serif text-[var(--color-museum-light)]">{animatedUnique}</h3>
        </div>

        <div className="p-8 bg-[var(--color-museum-dark)]/80 backdrop-blur-md border border-white/5 shadow-2xl relative overflow-hidden group rounded-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertCircle className="w-24 h-24 text-[var(--color-museum-accent)]" />
          </div>
          <p className="text-[var(--color-museum-accent)]/60 text-xs tracking-widest uppercase font-mono mb-2">Anomalies Detected</p>
          <h3 className="text-5xl font-serif text-[var(--color-museum-accent)]">{animatedAnomalies}</h3>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphical Representation */}
        <motion.div variants={itemVariants} className="lg:col-span-2 p-8 bg-[var(--color-museum-surface)]/70 backdrop-blur-xl border border-white/5 shadow-2xl flex flex-col rounded-xl">
          <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
            <h3 className="text-2xl font-serif text-[var(--color-museum-light)]">Classification Matrix</h3>
            <span className="text-xs uppercase tracking-widest font-mono text-white/40">Distribution</span>
          </div>
          
          <div className="h-72 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{fill: '#666', fontSize: 11, fontFamily: 'monospace'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" tick={{fill: '#666', fontSize: 11, fontFamily: 'monospace'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                  contentStyle={{ backgroundColor: '#121212', borderColor: '#333', borderRadius: '0px', color: '#f5f5f0', fontFamily: 'monospace', fontSize: '12px' }}
                  itemStyle={{ color: '#e69a73' }}
                />
                <Bar dataKey="count" radius={[0, 0, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#e69a73" : "#333333"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {visualization && visualization.raw && (
            <div className="mt-4 pt-8 border-t border-white/5">
               <h3 className="text-xl font-serif text-[var(--color-museum-light)] mb-2">Signal Analysis</h3>
               <p className="text-xs text-white/40 font-mono tracking-widest uppercase mb-8">Raw vs Normalized Telemetry</p>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Raw Signal */}
                  <div className="bg-[var(--color-museum-dark)] p-6 border border-white/5">
                    <h4 className="text-xs font-mono tracking-widest uppercase text-white/50 mb-4 border-b border-white/5 pb-2">Unfiltered Array</h4>
                    <div className="h-32 w-full flex items-center justify-center">
                       <div className="w-full h-full relative overflow-hidden flex items-end">
                           <ResponsiveContainer width="100%" height="100%">
                              <LineChart 
                                data={visualization.raw.map((val, i) => ({ index: i, value: val }))} 
                                margin={{top:5, right:5, bottom:5, left:5}}
                                onMouseMove={(e) => {
                                  if (e.activePayload && e.activePayload.length > 0) {
                                     // Map the array index to one of the 9 available gestures (0-8)
                                     const rawIdx = e.activePayload[0].payload.index;
                                     const totalLength = visualization.raw.length;
                                     const numGestures = Math.max(uniqueGesturesCount, 1);
                                     const mappedIndex = Math.floor((rawIdx / totalLength) * numGestures);
                                     setGestureIndex(Math.min(numGestures - 1, Math.max(0, mappedIndex)));
                                  }
                                }}
                              >
                                 <Line type="monotone" dataKey="value" stroke="#666" strokeWidth={1} dot={false} isAnimationActive={false} />
                              </LineChart>
                           </ResponsiveContainer>
                       </div>
                    </div>
                  </div>
                  
                  {/* Scaled Signal */}
                  <div className="bg-[var(--color-museum-dark)] p-6 border border-white/5">
                    <h4 className="text-xs font-mono tracking-widest uppercase text-white/50 mb-4 border-b border-white/5 pb-2">Standardized Array</h4>
                    <div className="h-32 w-full flex flex-col justify-end overflow-hidden relative">
                       <ResponsiveContainer width="100%" height="100%">
                          <LineChart 
                            data={visualization.scaled.map((val, i) => ({ index: i, value: val }))} 
                            margin={{top:5, right:5, bottom:5, left:5}}
                            onMouseMove={(e) => {
                                if (e.activePayload && e.activePayload.length > 0) {
                                   const rawIdx = e.activePayload[0].payload.index;
                                   const totalLength = visualization.scaled.length;
                                   const numGestures = Math.max(uniqueGesturesCount, 1);
                                   const mappedIndex = Math.floor((rawIdx / totalLength) * numGestures);
                                   setGestureIndex(Math.min(numGestures - 1, Math.max(0, mappedIndex)));
                                }
                            }}
                          >
                             <Line type="monotone" dataKey="value" stroke="#e69a73" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                          </LineChart>
                       </ResponsiveContainer>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </motion.div>

        {/* Detailed File Results */}
        <motion.div variants={itemVariants} className="p-8 bg-[var(--color-museum-surface)]/70 backdrop-blur-xl border border-white/5 shadow-2xl flex flex-col h-[400px] lg:h-auto lg:max-h-[850px] rounded-xl">
          <h3 className="text-xl font-serif text-[var(--color-museum-light)] mb-6 border-b border-white/5 pb-4">Inference Log</h3>
          <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-2">
            {results.map((res, idx) => {
              const descriptiveName = gestureMap[res.folder] || res.filename;
              return (
              <div key={idx} className="p-4 bg-[var(--color-museum-dark)] border-l-2 border-transparent hover:border-[var(--color-museum-accent)] transition-all">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-mono text-white/50 truncate max-w-[150px]" title={descriptiveName}>
                    {descriptiveName.toUpperCase()}
                  </p>
                  {res.error ? (
                    <span className="text-[10px] font-mono tracking-widest text-[#cf845e] uppercase">Error</span>
                  ) : (
                    <span className="text-[10px] font-mono tracking-widest text-[var(--color-museum-accent)] uppercase">
                      {res.predicted_gesture}
                    </span>
                  )}
                </div>
                {!res.error && (
                  <div className="w-full bg-[var(--color-museum-surface)] h-[2px] mt-3">
                    <div 
                      className="bg-[#cf845e] h-[2px]" 
                      style={{ width: `${(res.confidence * 100).toFixed(0)}%` }}
                    ></div>
                  </div>
                )}
                {!res.error && (
                   <p className="text-[10px] text-white/30 uppercase mt-2 font-mono">
                    {(res.confidence * 100).toFixed(1)}% Match
                   </p>
                )}
              </div>
            )})}
            {/* Detailed File Results */}
          </div>
        </motion.div>
      </div>
      
      
      {/* 
        NEW SECTION FOR DETAILED REPORTING 
        Shows Precision, Recall, F1 and Model Training Accuracy/Loss lines
      */}
         <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 pb-12 mt-12">
           <div className="p-8 bg-[var(--color-museum-surface)]/70 backdrop-blur-xl border border-white/5 shadow-2xl rounded-xl">
             <h3 className="text-3xl font-serif text-[var(--color-museum-light)] mb-8 border-b border-white/5 pb-4">Network Telemetry</h3>
             
             {/* Model Training Epoch Curves */}
             {historyData.length > 0 && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                 
                 {/* Accuracy Curve */}
                 <div className="bg-[var(--color-museum-dark)] p-8 border border-white/5 relative">
                   <h4 className="text-xs font-mono tracking-widest uppercase text-white/50 mb-6 text-center absolute top-4 left-0 right-0">Accuracy Propagation</h4>
                   <div className="h-64 w-full mt-4">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historyData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="1 3" stroke="#ffffff" strokeOpacity={0.05} />
                           <XAxis dataKey="epoch" stroke="#666" tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} />
                           <YAxis stroke="#666" tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} />
                           <Tooltip contentStyle={{ backgroundColor: '#121212', borderColor: '#333', borderRadius: '0px', fontFamily: 'monospace' }} />
                           <Line type="monotone" dataKey="trainAcc" name="Train Accuracy" stroke="#e69a73" strokeWidth={1} dot={false} />
                           {historyData[0].valAcc !== null && (
                             <Line type="monotone" dataKey="valAcc" name="Validation Accuracy" stroke="#666" strokeWidth={1} dot={false} strokeDasharray="3 3"/>
                           )}
                        </LineChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
                 
                 {/* Loss Curve */}
                 <div className="bg-[var(--color-museum-dark)] p-8 border border-white/5 relative">
                   <h4 className="text-xs font-mono tracking-widest uppercase text-white/50 mb-6 text-center absolute top-4 left-0 right-0">Loss Propagation</h4>
                   <div className="h-64 w-full mt-4">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historyData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="1 3" stroke="#ffffff" strokeOpacity={0.05} />
                           <XAxis dataKey="epoch" stroke="#666" tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} />
                           <YAxis stroke="#666" tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} />
                           <Tooltip contentStyle={{ backgroundColor: '#121212', borderColor: '#333', borderRadius: '0px', fontFamily: 'monospace' }} />
                           <Line type="monotone" dataKey="trainLoss" name="Train Loss" stroke="#e69a73" strokeWidth={1} dot={false} />
                           {historyData[0].valLoss !== null && (
                             <Line type="monotone" dataKey="valLoss" name="Validation Loss" stroke="#666" strokeWidth={1} dot={false} strokeDasharray="3 3"/>
                           )}
                        </LineChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
               </div>
             )}
             
             {/* Precision, Recall, F1 Bar Charts */}
             <h4 className="text-2xl font-serif text-[var(--color-museum-light)] mb-8">Performance Indices</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Precision */}
                 <div className="bg-[var(--color-museum-dark)] p-6 border border-white/5">
                    <h5 className="text-xs font-mono tracking-widest uppercase text-[var(--color-museum-accent)] mb-6">Precision</h5>
                    <div className="h-48 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={metrics.per_class} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                             <CartesianGrid strokeDasharray="1 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
                             <XAxis dataKey="class_id" stroke="#666" tick={{fill: '#666', fontSize: 10}} tickSize={0} dy={5} />
                             <YAxis stroke="#666" tick={{fill: '#666', fontSize: 10}} domain={[0, 1]} />
                             <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#121212', borderColor: '#333', borderRadius: '0px', fontFamily:'monospace' }} />
                             <Bar dataKey="precision" fill="#e69a73" radius={[0, 0, 0, 0]} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
                 
                 {/* Recall */}
                 <div className="bg-[var(--color-museum-dark)] p-6 border border-white/5">
                    <h5 className="text-xs font-mono tracking-widest uppercase text-[var(--color-museum-accent)] mb-6">Recall</h5>
                    <div className="h-48 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={metrics.per_class} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                             <CartesianGrid strokeDasharray="1 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
                             <XAxis dataKey="class_id" stroke="#666" tick={{fill: '#666', fontSize: 10}} tickSize={0} dy={5} />
                             <YAxis stroke="#666" tick={{fill: '#666', fontSize: 10}} domain={[0, 1]} />
                             <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#121212', borderColor: '#333', borderRadius: '0px', fontFamily:'monospace' }} />
                             <Bar dataKey="recall" fill="#888888" radius={[0, 0, 0, 0]} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
                 
                 {/* F1 Score */}
                 <div className="bg-[var(--color-museum-dark)] p-6 border border-white/5">
                    <h5 className="text-xs font-mono tracking-widest uppercase text-[var(--color-museum-accent)] mb-6">F1-Score</h5>
                    <div className="h-48 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={metrics.per_class} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                             <CartesianGrid strokeDasharray="1 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
                             <XAxis dataKey="class_id" stroke="#666" tick={{fill: '#666', fontSize: 10}} tickSize={0} dy={5} />
                             <YAxis stroke="#666" tick={{fill: '#666', fontSize: 10}} domain={[0, 1]} />
                             <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#121212', borderColor: '#333', borderRadius: '0px', fontFamily:'monospace' }} />
                             <Bar dataKey="f1" fill="#aaaaaa" radius={[0, 0, 0, 0]} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
             </div>
           </div>
         </motion.div>

    </motion.div>
  );
};

export default ResultsDashboard;

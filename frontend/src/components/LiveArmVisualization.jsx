import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGesture } from '../context/GestureContext';

// A large bank of realistic gesture configurations
const allGesturesBank = [
  { name: "Hand at Rest", wrist: [0, 0, 0], fingers: [0.2, 0.3, 0.4, 0.5], thumb: 0.1, spread: 0.05 },
  { name: "Clenched Fist", wrist: [0.1, 0, 0], fingers: [1.6, 1.6, 1.6, 1.6], thumb: 1.2, spread: 0 },
  { name: "Wrist Flexion", wrist: [1.2, 0, 0], fingers: [0.3, 0.4, 0.5, 0.6], thumb: 0.2, spread: 0.05 },
  { name: "Wrist Extension", wrist: [-1.0, 0, 0], fingers: [0.1, 0.2, 0.3, 0.4], thumb: 0.2, spread: 0.1 },
  { name: "Radial Deviation", wrist: [0, 0, -0.6], fingers: [0.2, 0.3, 0.4, 0.5], thumb: 0.1, spread: 0.05 },
  { name: "Ulnar Deviation", wrist: [0, 0, 0.6], fingers: [0.2, 0.3, 0.4, 0.5], thumb: 0.1, spread: 0.05 },
  { name: "Extended Palm", wrist: [-0.2, 0, 0], fingers: [-0.1, -0.1, -0.1, -0.1], thumb: -0.1, spread: 0.3 },
  { name: "Pinch Grasp", wrist: [0.1, 0, 0], fingers: [0.6, 0.1, 0.1, 0.1], thumb: 0.6, spread: 0 },
  { name: "Thumb Up", wrist: [0, 0, -0.2], fingers: [1.6, 1.6, 1.6, 1.6], thumb: -0.2, spread: 0 },
  { name: "Thumb Down", wrist: [0, 0, 0.2], fingers: [1.5, 1.5, 1.5, 1.5], thumb: -0.2, spread: 0 },
  { name: "Pointing", wrist: [0, 0, 0], fingers: [0.1, 1.5, 1.5, 1.5], thumb: 1.2, spread: 0 },
  { name: "Victory Sign", wrist: [0, 0.1, 0], fingers: [0.1, 0.1, 1.5, 1.5], thumb: 1.2, spread: 0.2 },
  { name: "Wave In", wrist: [0, 0, -0.5], fingers: [0.1, 0.1, 0.1, 0.1], thumb: 0.1, spread: 0.2 },
  { name: "Wave Out", wrist: [0, 0, 0.5], fingers: [0.1, 0.1, 0.1, 0.1], thumb: 0.1, spread: 0.2 },
  { name: "OK Sign", wrist: [0, 0, 0], fingers: [0.9, 0.1, 0.1, 0.1], thumb: 0.9, spread: 0.1 },
  { name: "Cylindrical Grasp", wrist: [0, 0, 0], fingers: [0.8, 0.8, 0.8, 0.8], thumb: 0.5, spread: 0.05 }
];

function RealisticArm({ currentConfig }) {
  const group = useRef();
  const wristRef = useRef();
  const fingersRefs = useRef([]);
  const thumbRef = useRef();

  const lerp = (current, target, factor = 0.08) => THREE.MathUtils.lerp(current, target, factor);

  useFrame(() => {
    if (!currentConfig) return;
    
    // Smooth interpolations
    if (wristRef.current) {
      wristRef.current.rotation.x = lerp(wristRef.current.rotation.x, currentConfig.wrist[0]);
      wristRef.current.rotation.y = lerp(wristRef.current.rotation.y, currentConfig.wrist[1]);
      wristRef.current.rotation.z = lerp(wristRef.current.rotation.z, currentConfig.wrist[2]);
    }
    fingersRefs.current.forEach((finger, i) => {
      if (finger) {
        finger.rotation.x = lerp(finger.rotation.x, currentConfig.fingers[i]);
        const spreadMultiplier = (i - 1.5) * 0.4;
        finger.rotation.z = lerp(finger.rotation.z, currentConfig.spread * spreadMultiplier);
      }
    });
    if (thumbRef.current) {
      thumbRef.current.rotation.x = lerp(thumbRef.current.rotation.x, currentConfig.thumb);
      thumbRef.current.rotation.z = lerp(thumbRef.current.rotation.z, currentConfig.thumb * 0.5);
    }
  });

  // Realistic Skin Material
  const skinMaterial = new THREE.MeshPhysicalMaterial({
    color: "#e8b496", // Peach/Tan skin base
    emissive: "#3a1104", // Simulate subsurface scattering blood
    emissiveIntensity: 0.15,
    roughness: 0.45,
    metalness: 0.05,
    clearcoat: 0.1,
    clearcoatRoughness: 0.4,
  });

  const knuckleMaterial = new THREE.MeshPhysicalMaterial({
    color: "#d99778", // Slightly darker/redder for joints
    roughness: 0.5,
    metalness: 0.0,
  });

  return (
    <group ref={group} position={[0, -1, 0]} scale={0.9} rotation={[0, -0.4, 0]}>
      {/* Forearm - Capsule instead of Cylinder */}
      <mesh position={[0, 1.5, 0]}>
        <capsuleGeometry args={[0.45, 2.5, 16, 32]} />
        <primitive object={skinMaterial} />
      </mesh>

      {/* Wrist Joint Sphere */}
      <mesh position={[0, 3.0, 0]}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <primitive object={knuckleMaterial} />
      </mesh>

      {/* Hand Group (Rotates at the wrist) */}
      <group ref={wristRef} position={[0, 3.0, 0]}>
        {/* Palm base - rounded box essentially */}
        <mesh position={[0, 0.7, 0]}>
          <capsuleGeometry args={[0.5, 0.8, 16, 32]} />
          <primitive object={skinMaterial} />
        </mesh>

        {/* Thumb */}
        <group position={[-0.6, 0.3, 0]} rotation={[0, 0, 0.6]}>
          <mesh>
            <sphereGeometry args={[0.22, 16, 16]} />
            <primitive object={knuckleMaterial} />
          </mesh>
          <group ref={thumbRef}>
            <mesh position={[0, 0.5, 0]}>
              <capsuleGeometry args={[0.18, 0.5, 12, 16]} />
              <primitive object={skinMaterial} />
            </mesh>
            {/* Thumb Tip */}
            <mesh position={[0, 1.0, 0]} rotation={[0.2, 0, 0]}>
              <sphereGeometry args={[0.16, 16, 16]} />
              <primitive object={knuckleMaterial} />
            </mesh>
            <mesh position={[0, 1.25, 0]} rotation={[0.4, 0, 0]}>
               <capsuleGeometry args={[0.15, 0.3, 12, 16]} />
               <primitive object={skinMaterial} />
            </mesh>
          </group>
        </group>

        {/* 4 Fingers */}
        {[-0.4, -0.13, 0.13, 0.4].map((xOffset, i) => {
          const lengthMod = i === 1 ? 1.1 : i === 3 ? 0.8 : 1.0; // Index/Middle differ
          return (
          <group key={i} position={[xOffset, 1.5, 0]}>
            <mesh>
              <sphereGeometry args={[0.18, 16, 16]} />
              <primitive object={knuckleMaterial} />
            </mesh>
            <group ref={(el) => (fingersRefs.current[i] = el)}>
              {/* Proximal */}
              <mesh position={[0, 0.35 * lengthMod, 0]}>
                <capsuleGeometry args={[0.14, 0.5 * lengthMod, 12, 16]} />
                <primitive object={skinMaterial} />
              </mesh>
              
              {/* Middle & Distal */}
              <group position={[0, 0.75 * lengthMod, 0]}>
                 <mesh>
                  <sphereGeometry args={[0.13, 16, 16]} />
                  <primitive object={knuckleMaterial} />
                </mesh>
                <mesh position={[0, 0.3 * lengthMod, 0]} rotation={[i > 1 ? 0.2 : 0.1, 0, 0]}>
                  <capsuleGeometry args={[0.12, 0.4 * lengthMod, 12, 16]} />
                  <primitive object={skinMaterial} />
                </mesh>
              </group>
            </group>
          </group>
        )})}
      </group>
    </group>
  );
}

export default function LiveArmVisualization({ results }) {
  const { gestureIndex, setGestureIndex } = useGesture(); 

  // Extract exactly which unique classes are present in the dataset and sort them numerically if possible
  const uniqueLabels = useMemo(() => {
    if (!results || results.length === 0) return Array.from({length: 9}, (_, i) => `Seq ${i + 13}`);
    const labels = Array.from(new Set(results.map(r => r.predicted_gesture)));
    // Try to sort them logically (e.g. Gesture 13, Gesture 14...)
    return labels.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
    });
  }, [results]);
  
  // Randomly select enough realistic 3D configs to cover the unique dataset classes
  const activeGestures = useMemo(() => {
    const shuffled = [...allGesturesBank].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.max(uniqueLabels.length, 1));
  }, [uniqueLabels]);

  const handleSliderChange = (e) => {
    setGestureIndex(parseInt(e.target.value, 10));
  };

  const currentConfig = activeGestures[gestureIndex];

  return (
    <div className="w-full flex flex-col">
      <div className="w-full relative overflow-hidden flex flex-col items-center">
        
        <div className="flex flex-col md:flex-row items-end justify-between mb-2 pb-6 relative z-10 w-full max-w-5xl">
          <div className="mb-4 md:mb-0">
            <h3 className="text-3xl font-serif text-[var(--color-museum-light)] mb-2">Kinetic Articulation</h3>
            <p className="text-xs font-mono tracking-widest uppercase text-[var(--color-museum-accent)]">Real-time Biometric Subsurface Engine</p>
          </div>
          <div className="flex items-center space-x-3 bg-[var(--color-museum-dark)]/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/5">
             <div className="h-2 w-2 rounded-full bg-[var(--color-museum-accent)] animate-pulse"></div>
             <span className="text-[var(--color-museum-light)] font-mono text-sm tracking-widest uppercase">
               {currentConfig?.name || "CALIBRATING..."}
             </span>
          </div>
        </div>

        <div className="w-full max-w-6xl h-[400px] md:h-[700px] relative z-10 flex items-center justify-center">
          <Canvas camera={{ position: [0, 2, 8], fov: 40 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[5, 10, 5]} angle={0.25} penumbra={1} intensity={1.5} castShadow color="#ffedd5" />
            <spotLight position={[-5, 5, -5]} angle={0.25} penumbra={1} intensity={0.5} color="#cbd5e1" />
            
            <Environment preset="studio" />
            <group position={[0, -1.5, 0]}>
               <RealisticArm currentConfig={currentConfig} />
               <ContactShadows resolution={1024} scale={20} blur={2.5} opacity={0.6} far={10} color="#111111" position={[0, -1.5, 0]} />
            </group>

            <OrbitControls 
              enableZoom={true}
              enablePan={false} 
              minPolarAngle={1.0}  
              maxPolarAngle={Math.PI / 1.5}
              autoRotate={true}
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </div>

        <div className="w-full max-w-2xl px-4 md:px-8 relative z-10 flex flex-col items-center">
          <div className="flex justify-between w-full text-white/40 font-mono text-xs tracking-widest uppercase mb-4">
            <span>{uniqueLabels[0] || "START"}</span>
            <span className="text-[var(--color-museum-accent)]">Manual Override</span>
            <span>{uniqueLabels[uniqueLabels.length - 1] || "END"}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max={Math.max(uniqueLabels.length - 1, 0)} 
            value={gestureIndex} 
            onChange={handleSliderChange}
            className="w-full h-1 bg-white/10 appearance-none outline-none focus:outline-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none 
              [&::-webkit-slider-thumb]:w-4 
              [&::-webkit-slider-thumb]:h-4 
              [&::-webkit-slider-thumb]:bg-[var(--color-museum-accent)] 
              [&::-webkit-slider-thumb]:rounded-full 
              [&::-webkit-slider-thumb]:shadow-lg
              transition-all duration-300 ease-in-out"
          />
        </div>

      </div>
    </div>
  );
}

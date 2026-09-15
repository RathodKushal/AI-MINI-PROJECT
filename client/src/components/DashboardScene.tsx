import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Line, Stars } from '@react-three/drei';
import * as THREE from 'three';

const DataNode = ({ position, color, size, speed }: { position: [number, number, number], color: string, size: number, speed: number }) => {
  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[size, 32, 32]} position={position}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
      </Sphere>
    </Float>
  );
};

const AnimatedConnections = () => {
  const lineRef = useRef<any>();
  
  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.material.dashOffset -= 0.01;
    }
  });

  const points = [
    new THREE.Vector3(-4, 2, -5),
    new THREE.Vector3(-2, -1, -3),
    new THREE.Vector3(2, 3, -4),
    new THREE.Vector3(5, -2, -6),
    new THREE.Vector3(1, -3, -2),
    new THREE.Vector3(-4, 2, -5),
  ];

  return (
    <Line 
      ref={lineRef}
      points={points}
      color="#8b5cf6"
      lineWidth={1.5}
      dashed={true}
      dashScale={20}
      dashSize={2}
      dashOffset={0}
      transparent
      opacity={0.3}
    />
  );
};

const DashboardScene = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full bg-slate-950">
      {/* Fallback gradient if WebGL fails or takes time to load */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#130b29] to-slate-950"></div>
      
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#f43f5e" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#3b82f6" />
        <pointLight position={[0, 0, 0]} intensity={1} color="#a855f7" />

        {/* Data Nodes */}
        <DataNode position={[-4, 2, -5]} color="#3b82f6" size={0.6} speed={1.5} />
        <DataNode position={[-2, -1, -3]} color="#f43f5e" size={0.4} speed={2} />
        <DataNode position={[2, 3, -4]} color="#a855f7" size={0.7} speed={1} />
        <DataNode position={[5, -2, -6]} color="#10b981" size={0.5} speed={2.5} />
        <DataNode position={[1, -3, -2]} color="#f59e0b" size={0.3} speed={3} />

        <AnimatedConnections />

        <Stars radius={100} depth={50} count={3000} factor={4} saturation={1} fade speed={1.5} />
      </Canvas>
    </div>
  );
};

export default DashboardScene;

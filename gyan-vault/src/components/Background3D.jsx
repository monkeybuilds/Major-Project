import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTheme } from '../context/ThemeContext';
import * as THREE from 'three';

// An animated particle system for the background
const ParticleSystem = ({ isDark }) => {
  const points = useRef();

  // Create 1500 random particles spread across a large area
  const particlesCount = 1500;

  const [positions, colors, scales] = useMemo(() => {
    const p = new Float32Array(particlesCount * 3);
    const c = new Float32Array(particlesCount * 3);
    const s = new Float32Array(particlesCount);

    // Vibrant color palette
    const colorGen = new THREE.Color();

    for (let i = 0; i < particlesCount; i++) {
      // Spread out further: -50 to 50
      p[i * 3] = (Math.random() - 0.5) * 100;
      p[i * 3 + 1] = (Math.random() - 0.5) * 100;
      p[i * 3 + 2] = (Math.random() - 0.5) * 50 - 20;

      // Assign vibrant colors (Pinks, Purples, Cyans, Golds)
      const mix = Math.random();
      if (mix < 0.3) colorGen.setHSL(0.8 + Math.random() * 0.1, 0.8, 0.6); // Pink/Purple
      else if (mix < 0.6) colorGen.setHSL(0.5 + Math.random() * 0.1, 0.8, 0.6); // Cyan/Blue
      else if (mix < 0.9) colorGen.setHSL(0.1 + Math.random() * 0.1, 0.8, 0.6); // Gold/Orange
      else colorGen.setHSL(0, 0, 1); // White highlights

      c[i * 3] = colorGen.r;
      c[i * 3 + 1] = colorGen.g;
      c[i * 3 + 2] = colorGen.b;

      s[i] = Math.random();
    }
    return [p, c, s];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (points.current) {
      points.current.rotation.y = time * 0.05;
      points.current.rotation.x = time * 0.03;
      // Gentle floating motion
      points.current.position.y = Math.sin(time * 0.2) * 2;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particlesCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={particlesCount} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aScale" count={particlesCount} array={scales} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={isDark ? 0.3 : 0.4}
        vertexColors={true}
        sizeAttenuation={true}
        transparent={true}
        opacity={isDark ? 0.6 : 0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Vibrant, iridescent floating shapes
const BackgroundShapes = ({ isDark }) => {
  const group = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (group.current) {
      group.current.children.forEach((child, i) => {
        const factor = i % 2 === 0 ? 1 : -1;
        child.rotation.x = time * 0.2 * factor + i;
        child.rotation.y = time * 0.3 * factor + i;
        child.position.y += Math.sin(time * 0.8 + i) * 0.01;
      });
    }
  });

  // Premium glass / iridescent material
  const materialProps = {
    transmission: 0.9,
    opacity: 1,
    metalness: 0,
    roughness: 0.1,
    ior: 1.5,
    thickness: 2,
    specularIntensity: 1,
    specularColor: '#ffffff',
    envMapIntensity: 1,
    transparent: true,
    // The base color shifts based on the theme
    color: isDark ? '#1e1b4b' : '#ffffff',
    clearcoat: 1,
    clearcoatRoughness: 0.1
  };

  return (
    <group ref={group}>
      {/* Ambient colorful lights to hit the glass materials */}
      <pointLight position={[10, 10, 10]} intensity={isDark ? 2 : 1.5} color="#ec4899" /> {/* Pink */}
      <pointLight position={[-10, -10, -10]} intensity={isDark ? 2 : 1.5} color="#06b6d4" /> {/* Cyan */}
      <pointLight position={[10, -10, 10]} intensity={isDark ? 1.5 : 1} color="#8b5cf6" /> {/* Purple */}

      <mesh position={[-12, 8, -15]} scale={1.5}>
        <torusGeometry args={[4, 1.5, 32, 64]} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>

      <mesh position={[15, -8, -25]} scale={2}>
        <icosahedronGeometry args={[5, 4]} /> {/* Smooth sphere-like */}
        <meshPhysicalMaterial {...materialProps} />
      </mesh>

      <mesh position={[-18, -12, -20]} scale={1.3}>
        <octahedronGeometry args={[6, 2]} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>

      {/* Adding a unique abstract shape */}
      <mesh position={[8, 12, -30]} scale={2.5}>
        <torusKnotGeometry args={[3, 1, 100, 16]} />
        <meshPhysicalMaterial {...materialProps} transmission={0.5} roughness={0.3} color="#fcd34d" />
      </mesh>
    </group>
  )
}

export default function Background3D() {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] transition-colors duration-700 bg-background">
      {/* The canvas takes up the full background */}
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        {/* Subtle lighting */}
        <ambientLight intensity={isDark ? 0.2 : 0.5} />
        <directionalLight position={[10, 10, 5]} intensity={isDark ? 0.5 : 1} color={isDark ? "#8b5cf6" : "#3b82f6"} />

        {/* 3D Elements */}
        <ParticleSystem isDark={isDark} />
        <BackgroundShapes isDark={isDark} />

        {/* Optional atmospheric effects like fog could go here */}
        <fog attach="fog" args={[isDark ? '#0f172a' : '#f8fafc', 10, 60]} />
      </Canvas>
    </div>
  );
}

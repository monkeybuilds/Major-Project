import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, MeshDistortMaterial, OrbitControls, Sphere } from '@react-three/drei';
import { FiSearch, FiArrowRight, FiExternalLink, FiCpu, FiAlertCircle } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 3D "Thinking Node"
// Animated blob that morphs while searching
const ThinkingBlob = ({ isSearching }) => {
    const mesh = useRef();

    useFrame((state) => {
        if (mesh.current) {
            // Spin faster when searching
            mesh.current.rotation.x += isSearching ? 0.05 : 0.01;
            mesh.current.rotation.y += isSearching ? 0.06 : 0.01;
        }
    });

    return (
        <Float speed={isSearching ? 6 : 2} rotationIntensity={isSearching ? 2 : 1} floatIntensity={isSearching ? 3 : 1}>
            <mesh ref={mesh} scale={isSearching ? 1.5 : 1}>
                <sphereGeometry args={[1, 64, 64]} />
                <MeshDistortMaterial
                    color={isSearching ? "#8b5cf6" : "#3b82f6"} // Purple to Blue transition
                    attach="material"
                    distort={isSearching ? 0.6 : 0.3} // More distortion when thinking
                    speed={isSearching ? 5 : 2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>
        </Float>
    );
};


// Main Page Component
export default function ResearchPage() {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setResult(null);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/agent/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error("Research error:", err);
            setError(err.message || 'An error occurred during research');
        } finally {
            setIsSearching(false);
        }
    };

    // Framer Motion variants
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
    };

    const contentVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { delay: 0.2, duration: 0.5 } }
    }

    return (
        <motion.div
            className="w-full max-w-5xl mx-auto space-y-8 relative"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >

            {/* Header */}
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-full mb-2 border border-primary/20 backdrop-blur-sm shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                >
                    <FiCpu size={32} />
                </motion.div>

                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    Deep Research Agent
                </h1>
                <p className="text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
                    Ask complex questions. The agent will autonomously browse the web, scrape multiple sources, and synthesize an in-depth answer perfectly tailored for your needs.
                </p>
            </div>

            {/* 3D Visualization Area */}
            <div className="w-full h-[250px] relative rounded-3xl overflow-hidden border border-border bg-surface/30 backdrop-blur-md shadow-inner flex items-center justify-center">
                {/* The 3D Canvas */}
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 10]} intensity={1.5} />
                    <pointLight position={[-10, -10, -10]} intensity={1} color="#8b5cf6" />

                    <ThinkingBlob isSearching={isSearching} />
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate={!isSearching} autoRotateSpeed={1} />
                </Canvas>

                {/* Overlay Status Text */}
                <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium tracking-widest uppercase transition-all duration-500 ${isSearching ? 'bg-purple-500/20 text-purple-400 animate-pulse border border-purple-500/50' : 'bg-surface/50 text-secondary border border-border/50'}`}>
                        {isSearching ? 'Agent is actively researching...' : 'Agent is idle. Awaiting command.'}
                    </span>
                </div>
            </div>

            {/* Search Input Box */}
            <motion.form
                onSubmit={handleSearch}
                className="relative group"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-secondary group-hover:text-primary transition-colors">
                    <FiSearch size={24} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="E.g., What are the latest breakthroughs in solid-state batteries?"
                    className="w-full pl-16 pr-32 py-5 bg-surface/80 backdrop-blur-md border-[1.5px] border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 text-lg transition-all shadow-lg placeholder:text-secondary/70"
                    disabled={isSearching}
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                    <button
                        type="submit"
                        disabled={isSearching || !query.trim()}
                        className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-primary/30"
                    >
                        {isSearching ? 'Researching...' : 'Deep Dive'}
                        {!isSearching && <FiArrowRight />}
                    </button>
                </div>
            </motion.form>

            {/* Results Section */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4 text-red-400"
                >
                    <FiAlertCircle size={24} className="shrink-0 mt-1" />
                    <div>
                        <h3 className="font-semibold text-lg mb-1">Research Failed</h3>
                        <p>{error}</p>
                    </div>
                </motion.div>
            )}

            {result && (
                <motion.div
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* Main Answer Card */}
                    <div className="p-8 bg-surface/80 backdrop-blur-xl border border-border rounded-3xl shadow-xl">
                        {/* Decorative top bar */}
                        <div className="w-full h-1.5 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-t-full absolute top-0 left-0" />

                        <div className="prose prose-invert prose-blue max-w-none pt-2">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {result.answer}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* Sources Section */}
                    {result.sources && result.sources.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                                <FiSearch />
                                Sources Extracted
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                {result.sources.map((source, index) => (
                                    <motion.a
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)" }}
                                        key={index}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-4 bg-surface/60 backdrop-blur-sm border border-border rounded-2xl hover:border-primary/50 transition-all group flex flex-col justify-between h-full"
                                    >
                                        <div>
                                            <div className="text-xs font-mono text-primary/80 mb-2 truncate">Source #{index + 1}</div>
                                            <h4 className="font-semibold text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors text-text-primary">
                                                {source.title || new URL(source.url).hostname}
                                            </h4>
                                        </div>
                                        <div className="flex items-center text-xs text-secondary mt-4 gap-1 overflow-hidden">
                                            <FiExternalLink className="shrink-0 group-hover:text-primary transition-colors" />
                                            <span className="truncate group-hover:text-primary transition-colors">{new URL(source.url).hostname}</span>
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

        </motion.div>
    );
}

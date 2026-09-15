import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Box, Edges, MeshDistortMaterial, Stars } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const InventoryNode = ({ position, color, speed, floatIntensity }: { position: [number, number, number], color: string, speed: number, floatIntensity: number }) => {
  return (
    <Float speed={speed} rotationIntensity={1.5} floatIntensity={floatIntensity}>
      <Box args={[0.8, 0.8, 0.8]} position={position}>
        <meshStandardMaterial color={color} transparent opacity={0.6} roughness={0.1} metalness={0.8} />
        <Edges scale={1.05} threshold={15} color={color} />
      </Box>
    </Float>
  );
};

const AICore = () => {
  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={2}>
      <Box args={[1.5, 1.5, 1.5]} position={[0, 0, 0]}>
        <MeshDistortMaterial 
          color="#3b82f6" 
          distort={0.4} 
          speed={2} 
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.8}
        />
        <Edges scale={1.05} threshold={15} color="#60a5fa" />
      </Box>
    </Float>
  );
}

const AnimatedInventoryScene = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#8b5cf6" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#3b82f6" />
      
      {/* Central AI Core */}
      <AICore />

      {/* Floating Inventory Boxes */}
      <InventoryNode position={[-4, 2, -2]} color="#00c49f" speed={1.5} floatIntensity={3} />
      <InventoryNode position={[5, -1.5, -3]} color="#ffbb28" speed={2} floatIntensity={2} />
      <InventoryNode position={[-3, -3, -1]} color="#8b5cf6" speed={1} floatIntensity={4} />
      <InventoryNode position={[4, 3, -4]} color="#ec4899" speed={2.5} floatIntensity={1.5} />

      <Stars radius={50} depth={20} count={2000} factor={4} saturation={0} fade speed={1} />
    </>
  );
};

// Reusable alternating feature section
const FeatureSection = ({ title, description, icon, align = 'left', color = 'indigo', children }: any) => {
  const isLeft = align === 'left';
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2, duration: 0.8 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: isLeft ? -50 : 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, type: 'spring' } }
  };

  const visualVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: isLeft ? -5 : 5 },
    visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 1, type: 'spring' } }
  };

  // Maps for colors to avoid dynamic tailwind classes failing
  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    teal: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    pink: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  };

  const glowMap: Record<string, string> = {
    indigo: 'bg-indigo-500/20',
    teal: 'bg-teal-500/20',
    pink: 'bg-pink-500/20',
    orange: 'bg-orange-500/20',
  };

  return (
    <section className="w-full min-h-[80vh] flex items-center py-20 px-6 md:px-12 lg:px-24">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-150px" }}
        className={`w-full max-w-7xl mx-auto flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 lg:gap-24`}
      >
        
        {/* Text Content */}
        <div className="flex-1 space-y-6 z-10 text-center md:text-left">
          <motion.div variants={itemVariants} className={`w-16 h-16 rounded-2xl mx-auto md:mx-0 flex items-center justify-center border backdrop-blur-md ${colorMap[color]}`}>
            {icon}
          </motion.div>
          <motion.h2 variants={itemVariants} style={{ fontFamily: "'Outfit', sans-serif" }} className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            {title}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto md:mx-0">
            {description}
          </motion.p>
        </div>

        {/* Visual Content */}
        <motion.div variants={visualVariants} className="flex-1 w-full relative z-10">
          <div className="relative w-full aspect-square md:aspect-[4/3] rounded-[40px] border border-white/10 bg-slate-900/50 backdrop-blur-2xl overflow-hidden shadow-2xl flex items-center justify-center p-8 group">
            {/* Background Glow */}
            <div className={`absolute inset-0 blur-3xl opacity-50 transition-transform duration-1000 group-hover:scale-150 ${glowMap[color]}`}></div>
            
            {/* Inner Content provided via children */}
            <div className="relative z-20 w-full h-full flex flex-col items-center justify-center">
              {children}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="relative w-full min-h-screen bg-slate-950 font-sans text-slate-50 overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* ---------------- FIXED BACKGROUNDS ---------------- */}
      
      {/* Video Background (Fixed & Parallax) */}
      <motion.div style={{ y: yBg }} className="fixed inset-0 z-0 w-full h-full">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-20 mix-blend-screen scale-110"
        >
          <source src="https://cdn.pixabay.com/video/2021/08/04/83863-584742614_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950"></div>
      </motion.div>

      {/* 3D Canvas (Fixed) */}
      <div className="fixed inset-0 z-10 pointer-events-none w-full h-full">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <AnimatedInventoryScene />
        </Canvas>
      </div>

      {/* ---------------- SCROLLING CONTENT ---------------- */}
      <main className="relative z-20 w-full pb-24">
        
        {/* HERO SECTION */}
        <section className="w-full min-h-[100dvh] flex flex-col justify-center items-center px-6 pt-20 pb-10 text-center relative">
          <motion.div
            style={{ opacity: opacityHero, scale: scaleHero }}
            className="flex flex-col items-center max-w-5xl z-30"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="inline-flex items-center gap-2 mb-8 px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/40 backdrop-blur-md text-indigo-200 text-sm font-bold tracking-widest uppercase shadow-[0_0_30px_rgba(99,102,241,0.3)] ring-1 ring-white/10"
            >
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
              The Next-Gen System
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, type: "spring", bounce: 0.4 }}
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 bg-gradient-to-b from-white via-indigo-50 to-indigo-300 bg-clip-text text-transparent leading-[1.1] pb-2"
            >
              Intelligent Logistics.<br/>Infinite Scale.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-2xl text-slate-300 max-w-3xl leading-relaxed font-light mb-12"
            >
              Track stock in real-time, forecast future demand, and manage your entire supply chain with cutting-edge artificial intelligence.
            </motion.p>

            {/* Guaranteed massive gap (more than one line) */}
            <div className="h-24 md:h-32 w-full flex-shrink-0"></div>

            {/* MASSIVE CENTERED LOGIN BUTTON */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6, type: "spring" }}
              className="relative group mt-24"
            >
              {/* Outer glowing pulse */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
              
              <button 
                onClick={() => navigate('/login')}
                className="relative inline-flex items-center justify-center px-12 py-5 font-bold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:from-indigo-500 hover:to-purple-500 hover:scale-105 border border-white/20 text-xl shadow-xl"
              >
                Access Dashboard
                <svg className="w-6 h-6 ml-3 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="mt-20 flex flex-col items-center z-20 pb-8"
          >
            <span className="text-xs uppercase tracking-[0.3em] mb-4 text-slate-400 opacity-60">Scroll to Explore</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <div className="w-[1px] h-12 bg-gradient-to-b from-indigo-500 to-transparent"></div>
            </motion.div>
          </motion.div>
        </section>

        {/* Spacer for transition */}
        <div className="w-full h-32 bg-gradient-to-b from-transparent to-slate-950/80"></div>

        {/* PROPER FORMAT: ALTERNATING Z-PATTERN SECTIONS */}
        <div className="bg-slate-950/80 backdrop-blur-xl border-t border-white/5 pt-10 relative z-30">
          
          {/* Section 1 */}
          <FeatureSection 
            title={<span>Real-Time <br/><span className="text-indigo-400">Inventory Sync</span></span>}
            description="Our AI continuously monitors your stock levels across all warehouses and storefronts simultaneously. Never oversell or run out of stock again."
            icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
            align="left"
            color="indigo"
          >
            {/* Animated Graph UI */}
            <div className="w-full h-full flex items-end justify-between px-6 pb-6 gap-3">
              {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                  className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                ></motion.div>
              ))}
            </div>
          </FeatureSection>

          {/* Section 2 */}
          <FeatureSection 
            title={<span>Predictive <br/><span className="text-teal-400">Demand Forecasting</span></span>}
            description="Leverage deep learning models to predict what your customers want before they even know it. Slash your holding costs and optimize your capital."
            icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            align="right"
            color="teal"
          >
            {/* Animated Target UI */}
            <div className="relative w-48 h-48">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-teal-500/50"
              ></motion.div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-4 rounded-full border border-teal-400/30 bg-teal-500/10 backdrop-blur flex items-center justify-center"
              >
                <span className="text-4xl font-bold text-teal-300">95%</span>
              </motion.div>
              <div className="absolute -top-4 -right-4 bg-teal-500 text-slate-900 font-bold px-3 py-1 rounded-full text-sm">Accuracy</div>
            </div>
          </FeatureSection>

          {/* Section 3 */}
          <FeatureSection 
            title={<span>Unified <br/><span className="text-pink-400">Supplier CRM</span></span>}
            description="Manage every relationship in one place. Automated purchase orders, communication logs, and vendor scoring all integrated directly with your stock."
            icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            align="left"
            color="pink"
          >
            {/* Animated Chat/CRM UI */}
            <div className="w-full flex flex-col gap-4 p-4">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-3/4 bg-slate-800/80 p-4 rounded-2xl rounded-tl-sm border border-slate-700 self-start"
              >
                <div className="h-2 w-20 bg-pink-500/50 rounded mb-2"></div>
                <div className="h-2 w-full bg-slate-600 rounded"></div>
              </motion.div>
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-3/4 bg-pink-600/20 p-4 rounded-2xl rounded-tr-sm border border-pink-500/30 self-end"
              >
                <div className="h-2 w-24 bg-pink-400 rounded mb-2"></div>
                <div className="h-2 w-full bg-pink-900/50 rounded"></div>
              </motion.div>
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="w-2/3 bg-slate-800/80 p-4 rounded-2xl rounded-tl-sm border border-slate-700 self-start"
              >
                <div className="h-2 w-full bg-slate-600 rounded"></div>
              </motion.div>
            </div>
          </FeatureSection>
          
        </div>

        {/* BOTTOM CTA SECTION */}
        <section className="w-full py-32 px-6 flex flex-col items-center text-center relative z-30 bg-slate-950 border-t border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="max-w-3xl"
          >
            <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-5xl md:text-6xl font-black mb-12 leading-tight">
              Ready to upgrade your operations?
            </h2>
            <p className="text-xl text-slate-400 mb-24">
              Join thousands of businesses scaling faster with AI.
            </p>
            <button 
                onClick={() => navigate('/login')}
                className="group relative inline-flex items-center justify-center px-12 py-5 font-bold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:from-indigo-500 hover:to-purple-500 hover:scale-105 shadow-[0_0_40px_rgba(99,102,241,0.5)] border border-white/20 text-xl"
              >
                Get Started Now
                <svg className="w-6 h-6 ml-3 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
            </button>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="w-full py-12 text-center text-slate-500 bg-slate-950 relative z-30 border-t border-white/5">
          <p className="text-sm font-medium tracking-wide uppercase">&copy; {new Date().getFullYear()} AI Mini Project. All rights reserved.</p>
        </footer>

      </main>
    </div>
  );
};

export default Landing;

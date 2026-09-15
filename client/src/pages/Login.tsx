import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, Box, Edges, MeshDistortMaterial, Stars } from '@react-three/drei';

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

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/auth/login', { email, password });
      
      setIsSuccess(true);
      
      setTimeout(() => {
        login(response.data.token, response.data.user);
        navigate('/dashboard');
      }, 1500);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center bg-slate-950 font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* ---------------- EXACT BACKGROUNDS AS LANDING PAGE ---------------- */}
      
      {/* Video Background */}
      <motion.div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
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

      {/* 3D Canvas */}
      <div className="fixed inset-0 z-0 pointer-events-none w-full h-full">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <AnimatedInventoryScene />
        </Canvas>
      </div>

      {/* ---------------- LOGIN FORM CONTAINER ---------------- */}
      <div className="relative z-10 w-full max-w-lg px-6 py-12 flex justify-center">
        
        <AnimatePresence mode="wait">
          
          {/* SUCCESS STATE ANIMATION */}
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8, rotateX: 90 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="w-full aspect-square rounded-[40px] border border-green-400/30 bg-green-500/10 backdrop-blur-3xl p-10 flex flex-col items-center justify-center text-center shadow-[0_0_100px_rgba(74,222,128,0.2)]"
            >
              <motion.div 
                initial={{ pathLength: 0, scale: 0 }}
                animate={{ pathLength: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(74,222,128,0.6)]"
              >
                <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" 
                  />
                </svg>
              </motion.div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-4xl font-bold text-white mb-3">Access Granted</h2>
              <p className="text-green-200 text-lg">Routing to command center...</p>
            </motion.div>
          ) : (
            
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md rounded-2xl bg-gradient-to-br from-fuchsia-600 to-rose-500 p-8 sm:p-10 shadow-2xl relative z-10 border border-white/10"
            >
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-8 text-center"
              >
                <h2 style={{ fontFamily: "'Inter', sans-serif" }} className="text-3xl font-bold text-white mb-2">
                  Sign in
                </h2>
                <p className="text-white/80 text-sm">Access your secure dashboard.</p>
              </motion.div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center flex items-center justify-center gap-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                
                {/* Neat and Clean Input */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col gap-1.5"
                >
                  <label className="text-sm font-semibold text-white">Email Address</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className="w-full bg-white/10 border border-white/20 px-4 py-3 rounded-lg text-white outline-none transition-all focus:ring-2 focus:ring-white/50 focus:border-white/50 placeholder-white/50 font-medium"
                  />
                </motion.div>

                {/* Neat and Clean Input */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col gap-1.5"
                >
                  <label className="text-sm font-semibold text-white">Password</label>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-white/10 border border-white/20 px-4 py-3 rounded-lg text-white outline-none transition-all focus:ring-2 focus:ring-white/50 focus:border-white/50 placeholder-white/50 font-medium"
                  />
                </motion.div>



                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="w-full mt-4"
                >
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3 font-bold text-fuchsia-600 bg-white hover:bg-slate-50 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-70 text-base shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-fuchsia-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </motion.div>
              </form>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-6 text-center"
              >
                <p className="text-white/80 text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-white font-semibold hover:underline hover:text-white/90">
                    Sign up
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;

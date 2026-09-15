import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import AIChatbot from './AIChatbot';
import DashboardScene from './DashboardScene';
import { motion } from 'framer-motion';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Inventory', path: '/dashboard/products', icon: '📦' },
    { name: '✨ AI Insights', path: '/dashboard/ai-insights', icon: '🧠', special: true },
    { name: 'Customers', path: '/dashboard/customers', icon: '👥' },
    { name: 'Suppliers', path: '/dashboard/suppliers', icon: '🏢' },
    { name: 'Orders (Restock)', path: '/dashboard/orders', icon: '🚚' },
    { name: 'Billing (POS)', path: '/dashboard/billing', icon: '💳' },
    { name: 'Profile', path: '/dashboard/profile', icon: '👤' },
  ];

  return (
    <div className="relative flex min-h-screen w-full bg-slate-950 font-sans text-white overflow-hidden selection:bg-indigo-500/30">
      <DashboardScene />
      
      <div className="relative z-10 flex min-h-screen w-full">
        <aside className="w-[280px] shrink-0 bg-slate-950/90 backdrop-blur-2xl border-r border-slate-800 p-8 flex flex-col shadow-2xl">
          <div className="pt-16">
            <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-fuchsia-500 bg-clip-text text-transparent mb-1">
              {user?.company_name || 'Inventory SaaS'}
            </h2>
            <p className="text-slate-400 text-sm font-medium truncate">Logged in as {user?.email}</p>
          </div>
          
          <nav className="flex flex-col gap-6 flex-1 justify-center pb-12">
            {navItems.map((item, i) => {
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard/');
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                >
                  <Link 
                    to={item.path} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      item.special 
                        ? isActive 
                          ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.2)]'
                          : 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 hover:bg-fuchsia-500/20'
                        : isActive
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={handleLogout} 
            className="mt-auto mb-12 py-3 px-4 rounded-xl font-bold text-white bg-slate-800 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 border border-slate-700 hover:border-red-500/30 flex items-center justify-center gap-2"
          >
            Log Out
          </motion.button>
        </aside>

        <main className="flex-1 flex flex-col h-screen overflow-y-auto">
          <header className="flex justify-end p-6 pb-2 sticky top-0 z-20">
            <NotificationBell />
          </header>
          <div className="flex-1 px-8 lg:px-12 pb-12 pt-4">
            <Outlet />
          </div>
        </main>
      </div>
      
      <AIChatbot />
    </div>
  );
};

export default Layout;

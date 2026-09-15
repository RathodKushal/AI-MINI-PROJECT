import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#f59e0b'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalProducts: 0, totalValue: 0, lowStockCount: 0 });
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [topSelling, setTopSelling] = useState<{name: string, total_sold: string} | null>(null);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [threshold, setThreshold] = useState<number>(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const compRes = await axios.get('/companies/me');
        const userThreshold = compRes.data.low_stock_threshold || 10;
        setThreshold(userThreshold);

        const res = await axios.get('/products');
        const products = res.data;
        const total = products.reduce((acc: number, p: any) => acc + (parseFloat(p.price) * p.stock), 0);
        
        const lowStock = products.filter((p: any) => p.stock <= userThreshold);
        
        const topRes = await axios.get('/orders/sales/top-selling');
        setTopSelling(topRes.data);

        const activityRes = await axios.get('/orders/activity');
        setActivityFeed(activityRes.data);

        // Calculate Stock Health
        let healthy = 0;
        let low = 0;
        let out = 0;
        
        products.forEach((p: any) => {
          if (p.stock === 0) out++;
          else if (p.stock <= userThreshold) low++;
          else healthy++;
        });

        const healthData = [];
        if (healthy > 0) healthData.push({ name: 'Healthy', value: healthy, color: '#10b981' }); // Emerald
        if (low > 0) healthData.push({ name: 'Low Stock', value: low, color: '#f59e0b' }); // Amber
        if (out > 0) healthData.push({ name: 'Out of Stock', value: out, color: '#f43f5e' }); // Rose
        
        setInventoryData(healthData);

        setStats({ 
          totalProducts: products.length, 
          totalValue: total, 
          lowStockCount: lowStock.length 
        });
        setLowStockProducts(lowStock);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[1150px] mx-auto"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Command Center
        </h1>
        <p className="text-slate-400 mt-1 text-sm font-medium">Real-time overview of your logistics and inventory operations.</p>
      </motion.div>
      
      <div className="flex flex-col gap-6 w-full">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <motion.div variants={itemVariants} className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-xl p-6 transition-all hover:border-indigo-500/50 hover:shadow-lg relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase">Total Products</h3>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight mt-4">{stats.totalProducts}</div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-xl p-6 transition-all hover:border-emerald-500/50 hover:shadow-lg relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase">Inventory Value</h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-400 tracking-tight mt-4">${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </motion.div>

        <motion.div variants={itemVariants} className={`bg-slate-900/80 backdrop-blur-xl border ${stats.lowStockCount > 0 ? 'border-rose-500/60' : 'border-slate-700/60'} rounded-xl p-6 transition-all relative overflow-hidden flex flex-col ${stats.lowStockCount > 0 ? 'hover:shadow-[0_4px_20px_rgba(244,63,94,0.15)]' : 'hover:border-slate-500/50'}`}>
          <div className={`absolute top-0 left-0 w-full h-1 ${stats.lowStockCount > 0 ? 'bg-rose-500' : 'bg-slate-500'}`}></div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase">Low Stock Alerts</h3>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stats.lowStockCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
          </div>
          <div className={`text-3xl font-bold tracking-tight mt-4 ${stats.lowStockCount > 0 ? 'text-rose-400' : 'text-white'}`}>
            {stats.lowStockCount}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-xl p-6 transition-all hover:border-fuchsia-500/50 hover:shadow-lg relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-fuchsia-500"></div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase truncate pr-2">Top Selling</h3>
            <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-bold text-white truncate w-full leading-tight" title={topSelling ? topSelling.name : 'No Sales Yet'}>
              {topSelling ? topSelling.name : 'No Sales Yet'}
            </div>
            {topSelling && (
              <div className="text-sm font-medium text-fuchsia-400 mt-1">
                {topSelling.total_sold} units sold
              </div>
            )}
          </div>
        </motion.div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          
          {/* Stock Health Pie Chart */}
          <motion.div variants={itemVariants} className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-xl p-6 flex flex-col h-[400px]">
            <div className="flex items-center gap-3 mb-6 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-white">Stock Health</h3>
          </div>
          
          {inventoryData.length > 0 ? (
            <div className="flex-1 min-h-0 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="60%"
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={true}
                    animationBegin={200}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <span className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">Status</span>
                <span className="text-xl font-bold text-white leading-tight">Total</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-700/50 rounded-lg">
              No product data available.
            </div>
          )}
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div variants={itemVariants} className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-xl p-6 flex flex-col h-[400px]">
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-white">Live Activity Feed</h3>
          </div>

          {activityFeed.length > 0 ? (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
              {activityFeed.map((activity, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1), duration: 0.4 }}
                  key={index} 
                  className="flex items-center gap-4 py-3 px-4 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                    activity.type === 'sale' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {activity.type === 'sale' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-slate-300 leading-snug">
                      {activity.type === 'sale' ? (
                        <>Sold <strong className="text-white font-semibold">{activity.quantity}x {activity.product_name}</strong> to <span className="text-emerald-400 font-medium">{activity.entity_name}</span></>
                      ) : (
                        <>Restocked <strong className="text-white font-semibold">{activity.quantity}x {activity.product_name}</strong> from <span className="text-indigo-400 font-medium">{activity.entity_name}</span></>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  <div className={`text-sm font-bold tracking-tight whitespace-nowrap ${activity.type === 'sale' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {activity.type === 'sale' ? '+' : '-'}${parseFloat(activity.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-700/50 rounded-lg">
              No recent activity.
            </div>
          )}
        </motion.div>

      </div>

      {lowStockProducts.length > 0 && (
        <motion.div variants={itemVariants} className="bg-rose-950/20 backdrop-blur-xl border border-rose-500/30 rounded-xl p-6 overflow-hidden relative shrink-0 mt-8">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-500/5 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
             <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-sm font-bold text-rose-400">
              Critical Stock Alerts <span className="text-rose-400/60 font-medium text-xs ml-1">(At or below {threshold} units)</span>
            </h3>
          </div>
          
          <div className="w-full overflow-x-auto relative z-10 custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-rose-500/20 sticky top-0 bg-slate-950/80 backdrop-blur">
                  <th className="py-2 px-3 text-[11px] font-semibold text-rose-300/70 uppercase tracking-wider">Product Name</th>
                  <th className="py-2 px-3 text-[11px] font-semibold text-rose-300/70 uppercase tracking-wider">SKU</th>
                  <th className="py-2 px-3 text-[11px] font-semibold text-rose-300/70 uppercase tracking-wider text-right">Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p, i) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    key={p.id} 
                    className="border-b border-rose-500/10 hover:bg-rose-500/5 transition-colors"
                  >
                    <td className="py-2 px-3 font-medium text-white text-xs">{p.name}</td>
                    <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{p.sku}</td>
                    <td className="py-2 px-3 text-right">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 text-[11px]">
                        {p.stock} units
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
      </div>
      
      {/* Scrollbar styling injected via a hidden style tag or global CSS - Using inline here for safety */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </motion.div>
  );
};

export default Dashboard;

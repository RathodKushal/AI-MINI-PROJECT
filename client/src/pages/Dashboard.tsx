import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
        // Fetch threshold
        const compRes = await axios.get('/companies/me');
        const userThreshold = compRes.data.low_stock_threshold || 10;
        setThreshold(userThreshold);

        // Fetch products
        const res = await axios.get('/products');
        const products = res.data;
        const total = products.reduce((acc: number, p: any) => acc + (parseFloat(p.price) * p.stock), 0);
        
        // Use custom threshold
        const lowStock = products.filter((p: any) => p.stock <= userThreshold);
        
        // Fetch top selling
        const topRes = await axios.get('/orders/sales/top-selling');
        setTopSelling(topRes.data);

        // Fetch activity feed
        const activityRes = await axios.get('/orders/activity');
        setActivityFeed(activityRes.data);

        // Calculate top 5 inventory items by value for the Pie Chart
        const invData = products
            .map((p: any) => ({ name: p.name, value: parseFloat(p.price) * p.stock }))
            .sort((a: any, b: any) => b.value - a.value)
            .slice(0, 5);
        setInventoryData(invData);

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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '32px' }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card">
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Products</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalProducts}</div>
        </div>
        <div className="glass-card">
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Inventory Value</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
            ${stats.totalValue.toFixed(2)}
          </div>
        </div>
        <div className="glass-card" style={{ borderColor: stats.lowStockCount > 0 ? 'var(--warning)' : '' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Low Stock Alerts</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: stats.lowStockCount > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
            {stats.lowStockCount}
          </div>
        </div>
        <div className="glass-card">
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Top Selling Product</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            {topSelling ? topSelling.name : 'No Sales Yet'}
          </div>
          {topSelling && (
             <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
               {topSelling.total_sold} units sold
             </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        {/* Recent Activity Feed */}
        <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Recent Activity</h3>
          {activityFeed.length > 0 ? (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activityFeed.map((activity, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    background: activity.type === 'sale' ? 'rgba(0,196,159,0.1)' : 'rgba(0,136,254,0.1)',
                    color: activity.type === 'sale' ? 'var(--success)' : '#0088FE',
                    padding: '12px',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {activity.type === 'sale' ? '📈' : '📦'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem' }}>
                      {activity.type === 'sale' ? (
                        <>Sold <strong style={{ color: 'var(--text-primary)' }}>{activity.quantity}x {activity.product_name}</strong> to {activity.entity_name}</>
                      ) : (
                        <>Restocked <strong style={{ color: 'var(--text-primary)' }}>{activity.quantity}x {activity.product_name}</strong> from {activity.entity_name}</>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: activity.type === 'sale' ? 'var(--success)' : 'var(--warning)' }}>
                    {activity.type === 'sale' ? '+' : '-'}${parseFloat(activity.total).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              No recent activity.
            </div>
          )}
        </div>

        {/* Inventory Pie Chart */}
        <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Inventory Value Breakdown (Top 5)</h3>
          {inventoryData.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              No inventory data available.
            </div>
          )}
        </div>

      </div>

      {lowStockProducts.length > 0 && (
        <div className="glass-card">
          <h3 style={{ color: 'var(--warning)', marginBottom: '16px' }}>⚠️ Items needing restock (at or below {threshold} units)</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td style={{ color: 'var(--warning)', fontWeight: 'bold' }}>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

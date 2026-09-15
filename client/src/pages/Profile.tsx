import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const [company, setCompany] = useState<any>(null);
  const [threshold, setThreshold] = useState<number>(10);
  const [loading, setLoading] = useState(true);

  const fetchCompanyData = async () => {
    try {
      const res = await axios.get('/companies/me');
      setCompany(res.data);
      setThreshold(res.data.low_stock_threshold);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const handleUpdateThreshold = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('/companies/threshold', { threshold });
      toast.success('Low stock threshold updated successfully!');
      fetchCompanyData(); // Refresh data
    } catch (error) {
      console.error(error);
      toast.error('Failed to update threshold');
    }
  };

  if (loading) return <div>Loading Profile...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '32px' }}>Profile Settings</h1>
      
      <div className="glass-card" style={{ maxWidth: '500px' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--primary-color)' }}>Company Details</h3>
        
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Company Name:</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{company?.name}</p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '24px 0' }} />

        <h3 style={{ marginBottom: '16px', color: 'var(--warning)' }}>Alert Settings</h3>
        <p style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Set the inventory level at which you want to receive low stock warnings and dashboard alerts.
        </p>

        <form onSubmit={handleUpdateThreshold}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Low Stock Alert Threshold</label>
            <input 
              type="number" 
              value={threshold} 
              onChange={e => setThreshold(parseInt(e.target.value, 10))} 
              required 
              min="0"
              style={{ maxWidth: '150px', fontSize: '1.2rem', padding: '12px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">Save Settings</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

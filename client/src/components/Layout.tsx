import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import AIChatbot from './AIChatbot';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '250px', background: 'var(--surface-color)', borderRight: '1px solid var(--surface-border)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: 'var(--primary-color)' }}>{user?.company_name || 'Inventory SaaS'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Logged in as {user?.email}</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          <Link to="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>Dashboard</Link>
          <Link to="/products" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>Inventory</Link>
          <Link to="/ai-insights" style={{ color: '#d8b4e2', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.3)' }}>✨ AI Insights</Link>
          <Link to="/customers" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>Customers</Link>
          <Link to="/suppliers" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>Suppliers</Link>
          <Link to="/orders" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>Orders (Restock)</Link>
          <Link to="/billing" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>Billing (POS)</Link>
          <Link to="/profile" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>Profile</Link>
        </nav>

        <button onClick={handleLogout} className="btn btn-secondary" style={{ marginTop: 'auto' }}>
          Logout
        </button>
      </aside>

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <NotificationBell />
        </header>
        <div className="animate-fade-in" style={{ flex: 1 }}>
          <Outlet />
        </div>
      </main>
      <AIChatbot />
    </div>
  );
};

export default Layout;

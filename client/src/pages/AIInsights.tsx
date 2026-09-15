import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Insight {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info';
}

const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await axios.get('/ai/insights');
        setInsights(res.data.insights);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || 'Failed to load AI Insights.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInsights();
  }, []);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return { color: 'var(--success)', border: '1px solid rgba(0, 196, 159, 0.3)', bg: 'rgba(0, 196, 159, 0.05)' };
      case 'warning':
        return { color: 'var(--warning)', border: '1px solid rgba(255, 187, 40, 0.3)', bg: 'rgba(255, 187, 40, 0.05)' };
      case 'info':
      default:
        return { color: '#d8b4e2', border: '1px solid rgba(138, 43, 226, 0.3)', bg: 'rgba(138, 43, 226, 0.05)' };
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>✨</span> AI Insights & Demand Forecasting
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.1rem' }}>
        Actionable business intelligence generated from your recent sales data.
      </p>
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Analyzing inventory data...</div>
        </div>
      ) : error ? (
        <div className="glass-card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
          <h3>Error generating insights</h3>
          <p>{error}</p>
        </div>
      ) : insights.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          No insights available. Generate some sales data first!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {insights.map((insight, idx) => {
            const styles = getTypeStyles(insight.type);
            return (
              <div key={idx} className="glass-card" style={{ 
                borderLeft: `4px solid ${styles.color}`,
                background: styles.bg,
                borderColor: styles.border,
                transition: 'transform 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h3 style={{ color: styles.color, marginBottom: '8px', fontSize: '1.3rem' }}>
                  {insight.title}
                </h3>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                  {insight.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIInsights;

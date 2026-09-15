import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 10 seconds for new notifications
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      try {
        await axios.put('/notifications/mark-read');
        // Instantly mark as read locally
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleApproveRestock = async (id: number) => {
    try {
      const res = await axios.post(`/notifications/${id}/approve-restock`);
      toast.success(res.data.message);
      // Locally mark as action taken
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, action_taken: 1 } : n));
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to auto-restock');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={handleOpen}
        style={{ 
          background: 'rgba(255,255,255,0.1)', 
          border: '1px solid var(--surface-border)', 
          borderRadius: '50%', 
          width: '40px', 
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{ 
            position: 'absolute', 
            top: '-2px', 
            right: '-2px', 
            background: 'var(--danger)', 
            color: 'white', 
            fontSize: '0.7rem', 
            borderRadius: '50%', 
            width: '18px', 
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="glass-card" style={{ 
          position: 'absolute', 
          top: '50px', 
          right: '0', 
          width: '320px',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 100,
          padding: '0'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--surface-border)', fontWeight: 'bold' }}>
            Notifications
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>No notifications yet.</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{ 
                  padding: '16px', 
                  borderBottom: '1px solid var(--surface-border)',
                  background: n.is_read ? 'transparent' : 'rgba(255,255,255,0.05)'
                }}>
                  <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>{n.message}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </div>
                    {n.type === 'low_stock' && !n.action_taken && n.product_id && (
                      <button 
                        onClick={() => handleApproveRestock(n.id)}
                        className="btn btn-primary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--success)' }}
                      >
                        Approve Restock
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

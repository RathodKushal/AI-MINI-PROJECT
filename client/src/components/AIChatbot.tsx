import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Hi! I am your AI Inventory Assistant. Ask me anything about your current stock or sales.' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post('/ai/chat', { message: userMessage });
      setChatHistory(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (error: any) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error connecting to the AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000
    }}>
      {isOpen ? (
        <div style={{
          width: '350px',
          height: '500px',
          background: 'var(--surface-color)',
          border: '1px solid var(--surface-border)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px',
            background: 'var(--primary-color)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>✨ AI Assistant</h3>
            <button onClick={toggleChat} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>
          
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {chatHistory.map((chat, idx) => (
              <div key={idx} style={{
                alignSelf: chat.role === 'user' ? 'flex-end' : 'flex-start',
                background: chat.role === 'user' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                padding: '10px 14px',
                borderRadius: '8px',
                maxWidth: '80%',
                wordWrap: 'break-word',
                fontSize: '0.9rem'
              }}>
                {chat.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }}>
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{
            padding: '16px',
            borderTop: '1px solid var(--surface-border)',
            display: 'flex',
            gap: '8px'
          }}>
            <input 
              type="text" 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              placeholder="Ask about your inventory..." 
              style={{ flex: 1 }} 
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !message.trim()} style={{ padding: '8px 16px' }}>
              Send
            </button>
          </form>
        </div>
      ) : (
        <button 
          onClick={toggleChat} 
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            fontSize: '1.5rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          ✨
        </button>
      )}
    </div>
  );
};

export default AIChatbot;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get('/suppliers');
      setSuppliers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/suppliers', { name, contact_info: contactInfo });
      setName(''); setContactInfo('');
      fetchSuppliers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '32px' }}>Suppliers</h1>
      <div className="glass-card" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>Add New Supplier</h3>
        <form onSubmit={handleAddSupplier} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Supplier Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Contact Info (Email/Phone)</label>
            <input type="text" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Add Supplier</button>
        </form>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact Info</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : suppliers.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center' }}>No suppliers found.</td></tr>
            ) : (
              suppliers.map(s => (
                <tr key={s.id}>
                  <td>#{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.contact_info}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Suppliers;

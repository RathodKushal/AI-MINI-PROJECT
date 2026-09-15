import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Orders: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  const [supplierId, setSupplierId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState('');

  const fetchData = async () => {
    try {
      const poRes = await axios.get('/orders/purchase');
      setPurchaseOrders(poRes.data);
      const prodRes = await axios.get('/products');
      setProducts(prodRes.data);
      const supRes = await axios.get('/suppliers');
      setSuppliers(supRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePurchaseOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/orders/purchase/fulfill', {
        supplier_id: supplierId,
        product_id: productId,
        quantity: parseInt(quantity, 10),
        cost: parseFloat(cost)
      });
      alert('Purchase order fulfilled! Stock increased.');
      setSupplierId(''); setProductId(''); setQuantity(''); setCost('');
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error fulfilling purchase order');
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '32px' }}>Order Tracking (Restock)</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        {/* Purchase Order Form */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', color: 'var(--primary-color)' }}>Restock (Purchase Order)</h3>
          <form onSubmit={handlePurchaseOrder} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Supplier</label>
              <select value={supplierId} onChange={e => setSupplierId(e.target.value)} required>
                <option value="">Select Supplier...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Product</label>
              <select value={productId} onChange={e => setProductId(e.target.value)} required>
                <option value="">Select Product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Qty</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required min="1" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Total Cost ($)</label>
                <input type="number" step="0.01" value={cost} onChange={e => setCost(e.target.value)} required min="0" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Fulfill & Restock</button>
          </form>
        </div>

      </div>

      <h3 style={{ marginBottom: '16px' }}>Recent Purchase Orders</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>No purchase orders found.</td></tr>
            ) : (
              purchaseOrders.map(po => (
                <tr key={po.id}>
                  <td>#{po.id}</td>
                  <td>{po.supplier_name}</td>
                  <td>
                    <span style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {po.status}
                    </span>
                  </td>
                  <td>{new Date(po.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/products/${editId}`, {
          name, sku, price: parseFloat(price), stock: parseInt(stock, 10)
        });
      } else {
        await axios.post('/products', {
          name, sku, price: parseFloat(price), stock: parseInt(stock, 10)
        });
      }
      handleCancel();
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (p: any) => {
    setEditId(p.id);
    setName(p.name);
    setSku(p.sku);
    setPrice(p.price);
    setStock(p.stock);
  };

  const handleCancel = () => {
    setEditId(null);
    setName(''); setSku(''); setPrice(''); setStock('');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Products</h1>
      </div>

      <div className="glass-card" style={{ marginBottom: '32px', borderColor: editId ? 'var(--primary-color)' : '' }}>
        <h3 style={{ marginBottom: '16px' }}>{editId ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div style={{ flex: 1, minWidth: '100px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>SKU</label>
            <input type="text" value={sku} onChange={e => setSku(e.target.value)} required />
          </div>
          <div style={{ flex: 1, minWidth: '100px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Price ($)</label>
            <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
          </div>
          <div style={{ flex: 1, minWidth: '100px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Stock</label>
            <input type="number" value={stock} onChange={e => setStock(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add'}</button>
          {editId && <button type="button" onClick={handleCancel} className="btn btn-secondary">Cancel</button>}
        </form>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>No products found. Add one above!</td></tr>
            ) : (
              products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>${parseFloat(p.price).toFixed(2)}</td>
                  <td>
                    <span style={{ 
                      color: p.stock < 10 ? 'var(--warning)' : 'var(--text-primary)',
                      fontWeight: p.stock < 10 ? 'bold' : 'normal'
                    }}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEdit(p)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;

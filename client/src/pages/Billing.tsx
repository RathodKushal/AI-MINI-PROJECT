import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { generateInvoice } from '../utils/pdfGenerator';

const Billing: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [threshold, setThreshold] = useState<number>(10);
  const [companyName, setCompanyName] = useState<string>('');
  
  const [salesCustomer, setSalesCustomer] = useState('');
  const [salesCustomerEmail, setSalesCustomerEmail] = useState('');
  const [salesCustomerPhone, setSalesCustomerPhone] = useState('');
  const [salesProductId, setSalesProductId] = useState('');
  const [salesQuantity, setSalesQuantity] = useState('');
  const [salesPrice, setSalesPrice] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const fetchData = async () => {
    try {
      const compRes = await axios.get('/companies/me');
      setThreshold(compRes.data.low_stock_threshold || 10);
      setCompanyName(compRes.data.name || 'My Company');

      const prodRes = await axios.get('/products');
      setProducts(prodRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (salesProductId) {
      const prod = products.find(p => p.id.toString() === salesProductId);
      setSelectedProduct(prod || null);
    } else {
      setSelectedProduct(null);
    }
  }, [salesProductId, products]);

  const handleSalesOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(salesQuantity, 10);

    if (selectedProduct) {
      if (selectedProduct.stock === 0) {
        toast.error('This product is out of stock!');
        return;
      }
      if (qty > selectedProduct.stock) {
        toast.error(`Cannot sell ${qty}. Only ${selectedProduct.stock} items available in stock.`);
        return;
      }
      
      const expectedTotal = parseFloat(selectedProduct.price) * qty;
      const enteredTotal = parseFloat(salesPrice);
      
      if (enteredTotal < expectedTotal) {
        const confirmSell = window.confirm(`Warning: The total price ($${enteredTotal}) is lower than the product's list price ($${expectedTotal}). Are you sure you want to proceed with this discount?`);
        if (!confirmSell) return;
      }
    }

    try {
      const res = await axios.post('/orders/sales/fulfill', {
        customer_name: salesCustomer,
        customer_email: salesCustomerEmail,
        customer_phone: salesCustomerPhone,
        product_id: salesProductId,
        quantity: qty,
        price: parseFloat(salesPrice)
      });
      
      toast.success('Bill generated successfully! Stock has been reduced.');
      
      if (res.data.emailPreview) {
        console.log("Email Preview URL:", res.data.emailPreview);
        toast.success(
          (t) => (
            <div>
              Email Sent! <a href={res.data.emailPreview} target="_blank" rel="noreferrer" style={{color: 'var(--primary-color)', textDecoration: 'underline'}}>Click to Preview</a>
            </div>
          ),
          { duration: 10000 }
        );
      }
      
      // Trigger PDF Invoice Download
      generateInvoice({
        companyName,
        customerName: salesCustomer || 'Walk-in Customer',
        productName: selectedProduct.name,
        quantity: qty,
        unitPrice: parseFloat(selectedProduct.price),
        totalPrice: parseFloat(salesPrice)
      });
      toast.success('Invoice downloaded!');
      
      // Trigger notification if stock drops below threshold
      if (selectedProduct && (selectedProduct.stock - qty) <= threshold) {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
            <span>⚠️ {selectedProduct.name} is running low on stock (Only {selectedProduct.stock - qty} left!)</span>
            <button 
              onClick={() => toast.dismiss(t.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', marginLeft: 'auto', fontSize: '1.2rem' }}
            >
              ✕
            </button>
          </div>
        ), {
          style: {
            border: '1px solid var(--warning)',
            padding: '16px',
            color: 'var(--warning)',
            minWidth: '350px'
          },
          duration: 10000, // Make it stay a bit longer since they can now close it manually
        });
      }

      setSalesCustomer(''); setSalesCustomerEmail(''); setSalesCustomerPhone(''); setSalesProductId(''); setSalesQuantity(''); setSalesPrice('');
      fetchData(); // Refresh stock
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Error processing the bill');
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '32px' }}>Point of Sale (Billing)</h1>

      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '24px', color: 'var(--success)' }}>New Sale / Bill</h3>
        
        <form onSubmit={handleSalesOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Customer Name (or Walk-in)</label>
              <input type="text" value={salesCustomer} onChange={e => setSalesCustomer(e.target.value)} required placeholder="John Doe" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Phone Number (Optional)</label>
              <input type="text" value={salesCustomerPhone} onChange={e => setSalesCustomerPhone(e.target.value)} placeholder="+1 234 567 8900" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Customer Email (For Receipt)</label>
            <input type="email" value={salesCustomerEmail} onChange={e => setSalesCustomerEmail(e.target.value)} placeholder="john@example.com (Optional)" />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Select Product</label>
            <select value={salesProductId} onChange={e => setSalesProductId(e.target.value)} required style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', borderRadius: '8px' }}>
              <option value="">-- Choose a Product --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} - ${parseFloat(p.price).toFixed(2)}</option>)}
            </select>
          </div>

          {selectedProduct && (
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Available Stock:</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: selectedProduct.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>
                {selectedProduct.stock} units
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Quantity to Sell</label>
              <input type="number" value={salesQuantity} onChange={e => setSalesQuantity(e.target.value)} required min="1" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Total Price ($)</label>
              <input type="number" step="0.01" value={salesPrice} onChange={e => setSalesPrice(e.target.value)} required min="0" />
              {selectedProduct && salesQuantity && salesPrice && (
                parseFloat(salesPrice) < parseFloat(selectedProduct.price) * parseInt(salesQuantity, 10)
              ) && (
                <div style={{ color: 'var(--warning)', fontSize: '0.8rem', marginTop: '4px' }}>
                  ⚠️ Selling below list price (${(parseFloat(selectedProduct.price) * parseInt(salesQuantity, 10)).toFixed(2)})
                </div>
              )}
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', background: 'var(--success)', fontSize: '1.1rem', padding: '14px' }}>
            Generate Bill
          </button>
        </form>
      </div>
    </div>
  );
};

export default Billing;

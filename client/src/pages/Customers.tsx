import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Customers: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    try {
      const res = await axios.get('/orders/sales');
      setSales(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '32px' }}>Customers & Sales History</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        A complete log of all customer purchases made through the Billing interface.
      </p>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Sale ID</th>
              <th>Customer Name</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total Price</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No sales history found.</td></tr>
            ) : (
              sales.map(sale => (
                <tr key={sale.id}>
                  <td>#{sale.id}</td>
                  <td style={{ fontWeight: 'bold' }}>{sale.customer_name}</td>
                  <td>{sale.product_name}</td>
                  <td>{sale.quantity}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                    ${parseFloat(sale.price).toFixed(2)}
                  </td>
                  <td>
                    {new Date(sale.created_at).toLocaleDateString(undefined, { 
                      year: 'numeric', month: 'short', day: 'numeric', 
                      hour: '2-digit', minute: '2-digit' 
                    })}
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

export default Customers;

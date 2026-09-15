import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { sendReceiptEmail } from '../utils/mailer';

const router = express.Router();

router.get('/purchase', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [orders] = await db.query(`
            SELECT po.*, s.name as supplier_name 
            FROM purchase_orders po 
            JOIN suppliers s ON po.supplier_id = s.id 
            WHERE po.company_id = ? ORDER BY po.created_at DESC
        `, [req.user.company_id]);
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/purchase/fulfill', authenticateToken, async (req: AuthRequest, res) => {
    const { supplier_id, product_id, quantity, cost } = req.body;
    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [poResult] = await connection.query<ResultSetHeader>(
                'INSERT INTO purchase_orders (company_id, supplier_id, status) VALUES (?, ?, ?)',
                [req.user.company_id, supplier_id, 'fulfilled']
            );
            
            await connection.query(
                'INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, cost) VALUES (?, ?, ?, ?)',
                [poResult.insertId, product_id, quantity, cost]
            );

            await connection.query(
                'UPDATE products SET stock = stock + ? WHERE id = ? AND company_id = ?',
                [quantity, product_id, req.user.company_id]
            );

            await connection.commit();
            res.status(201).json({ message: 'Purchase order fulfilled and stock updated' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/sales', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [orders] = await db.query(`
            SELECT so.id, so.customer_name, so.created_at, soi.quantity, soi.price, p.name as product_name
            FROM sales_orders so
            JOIN sales_order_items soi ON so.id = soi.sales_order_id
            JOIN products p ON soi.product_id = p.id
            WHERE so.company_id = ?
            ORDER BY so.created_at DESC
        `, [req.user.company_id]);
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/sales/top-selling', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [result] = await db.query(`
            SELECT p.name, SUM(soi.quantity) as total_sold
            FROM sales_order_items soi
            JOIN sales_orders so ON soi.sales_order_id = so.id
            JOIN products p ON soi.product_id = p.id
            WHERE so.company_id = ?
            GROUP BY soi.product_id
            ORDER BY total_sold DESC
            LIMIT 1
        `, [req.user.company_id]);
        
        res.json(result[0] || null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/activity', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [results] = await db.query(`
            (SELECT 'sale' as type, so.created_at, so.customer_name as entity_name, p.name as product_name, soi.quantity, soi.price as total 
             FROM sales_orders so 
             JOIN sales_order_items soi ON so.id = soi.sales_order_id 
             JOIN products p ON soi.product_id = p.id 
             WHERE so.company_id = ?)
            UNION ALL
            (SELECT 'purchase' as type, po.created_at, s.name as entity_name, p.name as product_name, poi.quantity, (poi.quantity * poi.cost) as total 
             FROM purchase_orders po 
             JOIN purchase_order_items poi ON po.id = poi.purchase_order_id 
             JOIN products p ON poi.product_id = p.id 
             JOIN suppliers s ON po.supplier_id = s.id 
             WHERE po.company_id = ?)
            ORDER BY created_at DESC
            LIMIT 6
        `, [req.user.company_id, req.user.company_id]);
        
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/sales/fulfill', authenticateToken, async (req: AuthRequest, res) => {
    const { customer_name, customer_email, customer_phone, product_id, quantity, price } = req.body;
    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [products] = await connection.query<RowDataPacket[]>('SELECT stock FROM products WHERE id = ? AND company_id = ?', [product_id, req.user.company_id]);
            if (products.length === 0 || products[0].stock < quantity) {
                throw new Error("Insufficient stock");
            }

            const [soResult] = await connection.query<ResultSetHeader>(
                'INSERT INTO sales_orders (company_id, customer_name, customer_email, customer_phone, status) VALUES (?, ?, ?, ?, ?)',
                [req.user.company_id, customer_name, customer_email || null, customer_phone || null, 'fulfilled']
            );
            
            await connection.query(
                'INSERT INTO sales_order_items (sales_order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [soResult.insertId, product_id, quantity, price]
            );

            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ? AND company_id = ?',
                [quantity, product_id, req.user.company_id]
            );

            // Fetch company threshold and product name to check for notification
            const [companies] = await connection.query<RowDataPacket[]>('SELECT name, low_stock_threshold FROM companies WHERE id = ?', [req.user.company_id]);
            const threshold = companies[0]?.low_stock_threshold || 10;
            const companyName = companies[0]?.name || 'My Company';
            
            const [updatedProducts] = await connection.query<RowDataPacket[]>('SELECT name, stock FROM products WHERE id = ? AND company_id = ?', [product_id, req.user.company_id]);
            const product = updatedProducts[0];
            
            if (product && product.stock <= threshold) {
                const message = `⚠️ ${product.name} is running low on stock (Only ${product.stock} left!)`;
                await connection.query(
                    'INSERT INTO notifications (company_id, message, type, product_id) VALUES (?, ?, ?, ?)',
                    [req.user.company_id, message, 'low_stock', product_id]
                );
            }

            await connection.commit();

            let previewUrl = null;
            if (customer_email) {
                previewUrl = await sendReceiptEmail(
                    customer_email,
                    customer_name || 'Customer',
                    companyName,
                    product.name,
                    quantity,
                    price
                );
            }

            res.status(201).json({ 
                message: 'Sales order fulfilled and stock reduced',
                emailPreview: previewUrl
            });
        } catch (err: any) {
            await connection.rollback();
            if (err.message === "Insufficient stock") {
                return res.status(400).json({ error: "Insufficient stock" });
            }
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

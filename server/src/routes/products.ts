import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products WHERE company_id = ? ORDER BY created_at DESC', [req.user.company_id]);
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    const { name, sku, price, stock } = req.body;
    try {
        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO products (company_id, name, sku, price, stock) VALUES (?, ?, ?, ?, ?)',
            [req.user.company_id, name, sku, price, stock]
        );
        res.status(201).json({ id: result.insertId, name, sku, price, stock });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a product
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ? AND company_id = ?', [req.params.id, req.user.company_id]);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Edit a product
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
    const { name, sku, price, stock } = req.body;
    try {
        await db.query(
            'UPDATE products SET name = ?, sku = ?, price = ?, stock = ? WHERE id = ? AND company_id = ?',
            [name, sku, price, stock, req.params.id, req.user.company_id]
        );
        res.json({ message: 'Product updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

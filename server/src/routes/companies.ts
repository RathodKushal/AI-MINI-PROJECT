import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [companies] = await db.query<RowDataPacket[]>('SELECT id, name, low_stock_threshold FROM companies WHERE id = ?', [req.user.company_id]);
        if (companies.length === 0) return res.status(404).json({ error: 'Company not found' });
        res.json(companies[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/threshold', authenticateToken, async (req: AuthRequest, res) => {
    const { threshold } = req.body;
    try {
        await db.query('UPDATE companies SET low_stock_threshold = ? WHERE id = ?', [threshold, req.user.company_id]);
        res.json({ message: 'Threshold updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

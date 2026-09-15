import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ResultSetHeader } from 'mysql2';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [suppliers] = await db.query('SELECT * FROM suppliers WHERE company_id = ?', [req.user.company_id]);
        res.json(suppliers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    const { name, contact_info } = req.body;
    try {
        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO suppliers (company_id, name, contact_info) VALUES (?, ?, ?)',
            [req.user.company_id, name, contact_info]
        );
        res.status(201).json({ id: result.insertId, name, contact_info });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { companyName, email, password } = req.body;

    try {
        const [users] = await db.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const [companyResult] = await db.query<ResultSetHeader>('INSERT INTO companies (name) VALUES (?)', [companyName]);
        const companyId = companyResult.insertId;

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (company_id, email, password_hash, role) VALUES (?, ?, ?, ?)', [companyId, email, hashedPassword, 'admin']);

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const [companies] = await db.query<RowDataPacket[]>('SELECT name FROM companies WHERE id = ?', [user.company_id]);
        const companyName = companies[0].name;

        const token = jwt.sign(
            { id: user.id, company_id: user.company_id, role: user.role, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user.id, email: user.email, role: user.role, company_id: user.company_id, company_name: companyName } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

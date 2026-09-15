import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all notifications for the company
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [notifications] = await db.query(
            'SELECT * FROM notifications WHERE company_id = ? ORDER BY created_at DESC', 
            [req.user.company_id]
        );
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Mark all as read
router.put('/mark-read', authenticateToken, async (req: AuthRequest, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = true WHERE company_id = ?', 
            [req.user.company_id]
        );
        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Approve auto-restock from notification
router.post('/:id/approve-restock', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Get the notification and product_id
            const [notifs] = await connection.query<any[]>(
                'SELECT * FROM notifications WHERE id = ? AND company_id = ? AND action_taken = false',
                [req.params.id, req.user.company_id]
            );
            
            const notification = notifs[0];
            if (!notification || !notification.product_id) {
                throw new Error("Notification not found, invalid, or already resolved.");
            }

            const productId = notification.product_id;

            // 2. Find the last purchase order for this product
            const [lastPurchases] = await connection.query<any[]>(`
                SELECT po.supplier_id, poi.quantity, poi.cost
                FROM purchase_order_items poi
                JOIN purchase_orders po ON poi.purchase_order_id = po.id
                WHERE poi.product_id = ? AND po.company_id = ?
                ORDER BY po.created_at DESC LIMIT 1
            `, [productId, req.user.company_id]);

            const lastPurchase = lastPurchases[0];
            if (!lastPurchase) {
                throw new Error("No previous purchase history found for this product. Please restock manually via the Orders tab.");
            }

            // 3. Create new purchase order
            const [poResult] = await connection.query<any>(
                'INSERT INTO purchase_orders (company_id, supplier_id, status) VALUES (?, ?, ?)',
                [req.user.company_id, lastPurchase.supplier_id, 'fulfilled']
            );
            
            // 4. Create new purchase order item
            await connection.query(
                'INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, cost) VALUES (?, ?, ?, ?)',
                [poResult.insertId, productId, lastPurchase.quantity, lastPurchase.cost]
            );

            // 5. Update stock
            await connection.query(
                'UPDATE products SET stock = stock + ? WHERE id = ? AND company_id = ?',
                [lastPurchase.quantity, productId, req.user.company_id]
            );

            // 6. Mark notification as action_taken
            await connection.query(
                'UPDATE notifications SET action_taken = true WHERE id = ?',
                [req.params.id]
            );

            await connection.commit();
            res.json({ message: 'Product successfully auto-restocked based on previous purchase!' });
        } catch (err: any) {
            await connection.rollback();
            if (err.message.includes("No previous purchase history") || err.message.includes("Notification not found")) {
                return res.status(400).json({ error: err.message });
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

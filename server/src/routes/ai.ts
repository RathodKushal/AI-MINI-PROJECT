import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Endpoint to handle chatbot queries
router.post('/chat', authenticateToken, async (req: AuthRequest, res) => {
    const { message } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    try {
        // Fetch context from database
        const [products] = await db.query('SELECT name, stock, price FROM products WHERE company_id = ?', [req.user.company_id]);
        
        const context = `
You are a helpful AI assistant for an inventory management SaaS.
Here is the user's current inventory data:
${JSON.stringify(products, null, 2)}

Answer the user's question accurately based ONLY on the inventory data provided.
If they ask something unrelated to their inventory or business, politely remind them of your purpose.
Keep answers concise and professional.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: [
                { role: 'user', parts: [{ text: context }] },
                { role: 'user', parts: [{ text: message }] }
            ],
            config: {
                systemInstruction: "You are an AI Inventory Assistant.",
                temperature: 0.2
            }
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error generating AI response.' });
    }
});


// Endpoint to generate demand forecasting & insights
router.get('/insights', authenticateToken, async (req: AuthRequest, res) => {
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    try {
        const [salesData] = await db.query(`
            SELECT p.name, SUM(soi.quantity) as total_sold, p.stock, p.price
            FROM sales_order_items soi
            JOIN sales_orders so ON soi.sales_order_id = so.id
            JOIN products p ON soi.product_id = p.id
            WHERE so.company_id = ?
            GROUP BY soi.product_id
            ORDER BY total_sold DESC
            LIMIT 10
        `, [req.user.company_id]);

        const prompt = `
Analyze the following recent sales data for my inventory:
${JSON.stringify(salesData, null, 2)}

Provide 3 actionable business insights. Focus on:
1. "best_selling": Which product is selling the best and what we should do about it (e.g. dynamic pricing to raise the price, or restocking soon).
2. "stock_warning": Which product might run out of stock soon based on its high sales vs current stock.
3. "general_trend": Any other interesting trend or pricing suggestion.

Return the result STRICTLY as a JSON array of objects, where each object has two properties:
- "title": A short, catchy title for the insight (e.g., "Raise Price on X").
- "description": A 1-2 sentence detailed explanation of the insight and recommendation.
- "type": One of "success", "warning", or "info" depending on the context.

Example format:
[
  { "title": "Raise price on Widget", "description": "Widget is selling very fast. Consider raising the price.", "type": "success" }
]
`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
            config: {
                temperature: 0.3,
                responseMimeType: "application/json"
            }
        });

        res.json({ insights: JSON.parse(response.text || '[]') });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error generating insights.' });
    }
});

export default router;

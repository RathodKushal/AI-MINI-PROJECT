import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ai_mini_project'
});

async function upgrade() {
    try {
        console.log("Checking for customer_email in sales_orders...");
        const [emailCols] = await pool.query(`SHOW COLUMNS FROM sales_orders LIKE 'customer_email'`);
        if ((emailCols as any[]).length === 0) {
            await pool.query(`ALTER TABLE sales_orders ADD COLUMN customer_email VARCHAR(255) NULL`);
            console.log("Added customer_email column.");
        } else {
            console.log("customer_email column already exists.");
        }

        console.log("Checking for customer_phone in sales_orders...");
        const [phoneCols] = await pool.query(`SHOW COLUMNS FROM sales_orders LIKE 'customer_phone'`);
        if ((phoneCols as any[]).length === 0) {
            await pool.query(`ALTER TABLE sales_orders ADD COLUMN customer_phone VARCHAR(50) NULL`);
            console.log("Added customer_phone column.");
        } else {
            console.log("customer_phone column already exists.");
        }

        console.log("Database upgrade completed successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        pool.end();
    }
}

upgrade();

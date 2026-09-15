const mysql = require('mysql2/promise');
require('dotenv').config();

async function upgrade() {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'inventory_saas'
        });

        console.log('Connected to the database. Running migration...');

        // Add description column to products table if it doesn't exist
        try {
            await conn.query('ALTER TABLE products ADD COLUMN description TEXT;');
            console.log('Successfully added "description" column to products table.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('The "description" column already exists in the products table.');
            } else {
                console.error('Error altering table:', err);
            }
        }

        conn.end();
        console.log('Migration completed.');
    } catch (err) {
        console.error('Database connection failed. Please ensure MySQL is running.', err.message);
    }
}

upgrade();

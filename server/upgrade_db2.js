const mysql = require('mysql2/promise');
require('dotenv').config();

async function upgradeDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log("Connected to MySQL server.");

        await connection.query(`
            ALTER TABLE companies ADD COLUMN low_stock_threshold INT DEFAULT 10;
        `);

        console.log("Added low_stock_threshold to companies table.");

        await connection.end();
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists. Skipping.");
        } else {
            console.error("Error upgrading database:", error);
        }
    }
}

upgradeDatabase();

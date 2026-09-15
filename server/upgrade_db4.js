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

        // Add product_id column
        try {
            await connection.query(`ALTER TABLE notifications ADD COLUMN product_id INT DEFAULT NULL;`);
            console.log("Added product_id to notifications.");
        } catch (e) {
            console.log("product_id column might already exist", e.message);
        }

        // Add action_taken column
        try {
            await connection.query(`ALTER TABLE notifications ADD COLUMN action_taken BOOLEAN DEFAULT false;`);
            console.log("Added action_taken to notifications.");
        } catch (e) {
            console.log("action_taken column might already exist", e.message);
        }

        await connection.end();
    } catch (error) {
        console.error("Error upgrading database:", error);
    }
}

upgradeDatabase();

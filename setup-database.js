import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "geofacts",
  password: process.env.DB_PASSWORD,
  port: 5432,
});

async function setupDatabase() {
  try {
    await db.connect();
    console.log('Connected to database');

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'database.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await db.query(schema);
    console.log('Database schema created successfully');

    console.log('Database setup completed!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await db.end();
  }
}

setupDatabase(); 
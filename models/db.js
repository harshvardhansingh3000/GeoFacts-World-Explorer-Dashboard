import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "geofacts",
  password: process.env.DB_PASSWORD,
  port: 5432,
});

db.connect();

export default db;
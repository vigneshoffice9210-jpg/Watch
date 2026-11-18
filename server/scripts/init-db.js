// Creates the database and all tables from sql/schema.sql
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbName = process.env.DB_NAME || 'everentia';
if (!/^[A-Za-z0-9_]+$/.test(dbName)) throw new Error('DB_NAME may only contain letters, numbers and underscores.');

const sql = fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8').replaceAll('__DB_NAME__', dbName);

const conn = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
});
await conn.query(sql);
await conn.end();
console.log(`Database "${dbName}" and tables are ready.`);

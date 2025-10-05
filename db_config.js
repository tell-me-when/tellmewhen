import mysql from 'mysql';
import dotenv from 'dotenv';
dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 10, 
  acquireTimeout: 60000, // 60 seconds
  timeout: 60000, // 60 seconds
  reconnect: true
});

// Helper function to execute queries 
export const executeQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });

export const closePool = () => {
  pool.end((err) => {
    if (err) {
      console.error('Error closing the connection pool:', err.message);
    } else {
      console.log('Connection pool closed.');
    }
  });
};

export default pool;
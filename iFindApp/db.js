const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise;

const getConnection = async () => {
  try {
    if (!poolPromise) {
      poolPromise = sql.connect(config);
    }
    return await poolPromise;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    throw error;
  }
};

const testConnection = async () => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT 1 as test");
    console.log("✅ Database connection successful!");
    return true;
  } catch (error) {
    console.error("❌ Test query failed:", error.message);
    return false;
  }
};

const closeConnection = async () => {
  try {
    if (poolPromise) {
      const pool = await poolPromise;
      await pool.close();
      poolPromise = null;
      console.log("Database connection closed");
    }
  } catch (error) {
    console.error("Error closing database connection:", error.message);
  }
};

console.log("ENV VALUES:", {
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_SERVER: process.env.DB_SERVER,
  DB_NAME: process.env.DB_NAME,
});

module.exports = {
  sql,
  getConnection,
  testConnection,
  closeConnection,
};

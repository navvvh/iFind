const sql = require("mssql")
require("dotenv").config()

// Database configuration
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // Set to true if using Azure SQL
    trustServerCertificate: true, // Set to true for local dev / self-signed certs
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

// Debug: Log configuration (without password)
console.log("Database Config:", {
  user: config.user,
  server: config.server,
  database: config.database,
  passwordSet: !!config.password,
})

let pool

async function getConnection() {
  try {
    if (!pool) {
      pool = await sql.connect(config)
      console.log("✅ Database connected successfully")
    }
    return pool
  } catch (error) {
    console.error("❌ Database connection error:", error.message)
    throw error
  }
}

async function testConnection() {
  try {
    console.log("🔍 Testing database connection...")

    // Check if required environment variables are set
    if (!process.env.DB_USER) {
      throw new Error("DB_USER environment variable is not set")
    }
    if (!process.env.DB_PASS) {
      throw new Error("DB_PASS environment variable is not set")
    }
    if (!process.env.DB_SERVER) {
      throw new Error("DB_SERVER environment variable is not set")
    }
    if (!process.env.DB_NAME) {
      throw new Error("DB_NAME environment variable is not set")
    }

    const pool = await getConnection()
    const result = await pool.request().query("SELECT 1 as test")
    console.log("✅ Test query successful:", result.recordset)
    return true
  } catch (error) {
    console.error("❌ Test query failed:", error.message)
    return false
  }
}

module.exports = {
  getConnection,
  testConnection,
  sql,
}

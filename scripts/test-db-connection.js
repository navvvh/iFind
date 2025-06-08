// Test database connection script
require("dotenv").config()
const sql = require("mssql")

async function testDatabaseConnection() {
  console.log("🔍 Testing Database Connection...\n")

  // Check environment variables
  console.log("Environment Variables:")
  console.log("DB_USER:", process.env.DB_USER || "NOT SET")
  console.log("DB_PASS:", process.env.DB_PASS ? "***SET***" : "NOT SET")
  console.log("DB_SERVER:", process.env.DB_SERVER || "NOT SET")
  console.log("DB_NAME:", process.env.DB_NAME || "NOT SET")
  console.log("")

  // Check if all required variables are set
  const requiredVars = ["DB_USER", "DB_PASS", "DB_SERVER", "DB_NAME"]
  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:", missingVars.join(", "))
    console.log("\n📝 Please check your .env file and make sure all variables are set.")
    return
  }

  // Test connection
  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
      connectionTimeout: 30000,
      requestTimeout: 30000,
    },
  }

  try {
    console.log("🔌 Attempting to connect to SQL Server...")
    const pool = await sql.connect(config)
    console.log("✅ Connected to SQL Server successfully!")

    console.log("🔍 Testing query execution...")
    const result = await pool.request().query("SELECT @@VERSION as version, DB_NAME() as database_name")
    console.log("✅ Query executed successfully!")
    console.log("Database Info:", result.recordset[0])

    console.log("🔍 Checking if tables exist...")
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `)

    if (tablesResult.recordset.length > 0) {
      console.log("✅ Found tables:", tablesResult.recordset.map((t) => t.TABLE_NAME).join(", "))
    } else {
      console.log("⚠️  No tables found. You may need to run the table creation scripts.")
    }

    await pool.close()
    console.log("\n🎉 Database connection test completed successfully!")
  } catch (error) {
    console.error("❌ Database connection failed:")
    console.error("Error:", error.message)

    if (error.message.includes("Login failed")) {
      console.log("\n💡 Troubleshooting tips for login failure:")
      console.log('1. Check if the user "pdm" exists in SQL Server')
      console.log("2. Verify the password is correct")
      console.log('3. Make sure the user has access to the "iFind" database')
      console.log("4. Run the setup-database.sql script as an administrator")
    }

    if (error.message.includes("server was not found")) {
      console.log("\n💡 Troubleshooting tips for server not found:")
      console.log("1. Check if SQL Server is running")
      console.log('2. Verify the server name (try "localhost" or ".\\SQLEXPRESS")')
      console.log("3. Check if TCP/IP is enabled in SQL Server Configuration Manager")
    }
  }
}

// Run the test
testDatabaseConnection()

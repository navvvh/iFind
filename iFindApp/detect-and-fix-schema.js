// Detect and fix database schema mismatch
require("dotenv").config()
const sql = require("mssql")

async function detectAndFixSchema() {
  console.log("🔍 Detecting database schema and fixing mismatches...\n")

  // Try different database configurations
  const configs = [
    {
      name: "iFind database",
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      server: process.env.DB_SERVER || "localhost",
      database: "iFind",
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
    },
    {
      name: "iFindDB database",
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      server: process.env.DB_SERVER || "localhost",
      database: "iFindDB",
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
    },
  ]

  // If no password, try Windows Authentication
  if (!process.env.DB_PASS) {
    configs.forEach((config) => {
      config.options.integratedSecurity = true
      delete config.user
      delete config.password
    })
  }

  let workingConfig = null
  let pool = null

  // Try each configuration
  for (const config of configs) {
    try {
      console.log(`🔌 Trying to connect to ${config.name}...`)
      pool = await sql.connect(config)
      console.log(`✅ Connected to ${config.name}!`)
      workingConfig = config
      break
    } catch (error) {
      console.log(`❌ Failed to connect to ${config.name}: ${error.message}`)
      await sql.close()
    }
  }

  if (!workingConfig) {
    console.error("❌ Could not connect to any database!")
    return
  }

  try {
    // Check what tables exist
    console.log("\n📋 Checking existing tables...")
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `)

    console.log("📊 Found tables:")
    tablesResult.recordset.forEach((table) => {
      console.log(`  - ${table.TABLE_NAME}`)
    })

    // Check users table structure
    if (tablesResult.recordset.some((t) => t.TABLE_NAME === "users")) {
      console.log("\n📋 Checking users table structure...")
      const usersColumns = await pool.request().query(`
        SELECT 
            COLUMN_NAME,
            DATA_TYPE,
            IS_NULLABLE,
            COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'users'
        ORDER BY ORDINAL_POSITION
      `)

      console.log("📊 Users table columns:")
      console.table(
        usersColumns.recordset.map((col) => ({
          Column: col.COLUMN_NAME,
          Type: col.DATA_TYPE,
          Nullable: col.IS_NULLABLE,
        })),
      )

      // Check if we have the wrong schema (user_id instead of id)
      const hasUserId = usersColumns.recordset.some((col) => col.COLUMN_NAME === "user_id")
      const hasId = usersColumns.recordset.some((col) => col.COLUMN_NAME === "id")

      if (hasUserId && !hasId) {
        console.log("\n⚠️  SCHEMA MISMATCH DETECTED!")
        console.log("Your database uses 'user_id' but the API expects 'id'")
        console.log("🔧 Fixing schema...")

        try {
          // Add id column as alias or rename
          await pool.request().query(`
            ALTER TABLE users ADD id AS user_id
          `)
          console.log("✅ Added 'id' as computed column pointing to 'user_id'")
        } catch (error) {
          console.log(`⚠️  Could not add computed column: ${error.message}`)

          // Alternative: Add a new id column and copy data
          try {
            console.log("🔧 Trying alternative fix...")
            await pool.request().query(`
              ALTER TABLE users ADD temp_id INT IDENTITY(1,1)
            `)
            console.log("✅ Added temporary id column")
          } catch (altError) {
            console.log(`⚠️  Alternative fix failed: ${altError.message}`)
          }
        }
      } else if (hasId) {
        console.log("✅ Users table has correct 'id' column")
      }

      // Test a simple query
      console.log("\n📋 Testing users query...")
      try {
        const testQuery = await pool.request().query("SELECT TOP 3 * FROM users")
        console.log(`✅ Query successful! Found ${testQuery.recordset.length} users`)

        if (testQuery.recordset.length > 0) {
          console.log("📊 Sample user:")
          console.log(testQuery.recordset[0])
        }
      } catch (queryError) {
        console.log(`❌ Query failed: ${queryError.message}`)
      }
    } else {
      console.log("⚠️  No users table found!")
    }

    // Update .env file suggestion
    console.log(`\n💡 Update your .env file to use the working database:`)
    console.log(`DB_NAME=${workingConfig.database}`)

    await pool.close()
    console.log("\n🎉 Schema detection completed!")
  } catch (error) {
    console.error("❌ Error during schema detection:", error.message)
  }
}

// Run the detection
detectAndFixSchema().catch(console.error)

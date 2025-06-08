// Add test data to the fixed database
require("dotenv").config()
const sql = require("mssql")

async function addTestData() {
  console.log("📊 Adding test data to the database...\n")

  // Database configuration
  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER || "localhost",
    database: "iFind",
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
    },
  }

  // If no password, try Windows Authentication
  if (!process.env.DB_PASS) {
    config.options.integratedSecurity = true
    delete config.user
    delete config.password
  }

  try {
    console.log("🔌 Connecting to iFind database...")
    const pool = await sql.connect(config)
    console.log("✅ Connected successfully!")

    // Check current user count
    const currentCount = await pool.request().query("SELECT COUNT(*) as count FROM users")
    console.log(`📊 Current users in database: ${currentCount.recordset[0].count}`)

    if (currentCount.recordset[0].count === 0) {
      console.log("📝 Adding test users...")

      // Insert test users
      await pool.request().query(`
        INSERT INTO users (full_name, email, password, user_type, username, completed_setup, created_at) VALUES
        ('John Doe', 'john@example.com', 'password123', 'Student', 'johndoe', 1, GETDATE()),
        ('Jane Smith', 'jane@example.com', 'password123', 'Staff', 'janesmith', 1, GETDATE()),
        ('Mike Johnson', 'mike@example.com', 'password123', 'Faculty', 'mikejohnson', 0, GETDATE()),
        ('Test User', 'test@example.com', 'password123', 'Student', 'testuser', 1, GETDATE())
      `)
      console.log("✅ Test users added!")

      // Check if posts table exists and has correct structure
      console.log("📋 Checking posts table...")
      try {
        const postsColumns = await pool.request().query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'posts'
          ORDER BY ORDINAL_POSITION
        `)

        console.log("📊 Posts table columns:")
        postsColumns.recordset.forEach((col) => {
          console.log(`  - ${col.COLUMN_NAME}`)
        })

        // Check if posts table has the right foreign key reference
        const hasUserId = postsColumns.recordset.some((col) => col.COLUMN_NAME === "user_id")
        const hasPostId = postsColumns.recordset.some((col) => col.COLUMN_NAME === "post_id")

        if (hasPostId && !postsColumns.recordset.some((col) => col.COLUMN_NAME === "id")) {
          console.log("🔧 Posts table also needs id column fix...")
          try {
            await pool.request().query(`ALTER TABLE posts ADD id AS post_id`)
            console.log("✅ Added 'id' computed column to posts table")
          } catch (error) {
            console.log(`⚠️  Could not fix posts table: ${error.message}`)
          }
        }

        // Add test posts if the table structure is compatible
        if (hasUserId) {
          console.log("📝 Adding test posts...")
          await pool.request().query(`
            INSERT INTO posts (user_id, title, description, campus, post_type, image_path, date_posted) VALUES
            (1, 'Lost Item: Blue Backpack', 'Lost my blue backpack in the library on the 2nd floor. It contains my laptop and textbooks.', 'Main Building', 'Lost', '/images/backpack.jpg', GETDATE()),
            (2, 'Found: Car Keys', 'Found a set of Toyota car keys in the parking lot near the Engineering building.', 'Engineering Building', 'Found', '/images/keys.jpg', GETDATE()),
            (1, 'Lost Phone: iPhone 13', 'Lost my black iPhone 13 somewhere between the cafeteria and the gym.', 'Student Center', 'Lost', NULL, GETDATE())
          `)
          console.log("✅ Test posts added!")
        }
      } catch (postsError) {
        console.log(`⚠️  Could not work with posts table: ${postsError.message}`)
      }

      // Check comments table
      console.log("📋 Checking comments table...")
      try {
        const commentsColumns = await pool.request().query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'comments'
          ORDER BY ORDINAL_POSITION
        `)

        const hasCommentId = commentsColumns.recordset.some((col) => col.COLUMN_NAME === "comment_id")
        if (hasCommentId && !commentsColumns.recordset.some((col) => col.COLUMN_NAME === "id")) {
          console.log("🔧 Comments table also needs id column fix...")
          try {
            await pool.request().query(`ALTER TABLE comments ADD id AS comment_id`)
            console.log("✅ Added 'id' computed column to comments table")
          } catch (error) {
            console.log(`⚠️  Could not fix comments table: ${error.message}`)
          }
        }
      } catch (commentsError) {
        console.log(`⚠️  Could not work with comments table: ${commentsError.message}`)
      }
    } else {
      console.log("✅ Users already exist in database")
    }

    // Test the API-expected query
    console.log("\n🔍 Testing API-compatible queries...")
    try {
      const apiTest = await pool.request().query(`
        SELECT id, full_name, email, user_type, username, completed_setup, created_at 
        FROM users 
        ORDER BY id DESC
      `)
      console.log(`✅ API query successful! Found ${apiTest.recordset.length} users`)

      if (apiTest.recordset.length > 0) {
        console.log("📊 Sample user (API format):")
        console.log(apiTest.recordset[0])
      }
    } catch (apiError) {
      console.log(`❌ API query failed: ${apiError.message}`)
    }

    await pool.close()
    console.log("\n🎉 Test data setup completed!")
    console.log("\n🚀 Now try starting your server:")
    console.log("   node server.js")
    console.log("\n🌐 Then test the API:")
    console.log("   http://localhost:3001/api/users")
  } catch (error) {
    console.error("❌ Error adding test data:", error.message)
  }
}

// Run the test data addition
addTestData().catch(console.error)

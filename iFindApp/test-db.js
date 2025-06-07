const { testConnection, closeConnection } = require("./db")

const runTest = async () => {
  console.log("Testing database connection...")

  const isConnected = await testConnection()

  if (isConnected) {
    console.log("🎉 Ready to use the database!")
  } else {
    console.log("❌ Please check your database configuration")
  }

  await closeConnection()
  process.exit(0)
}

runTest()

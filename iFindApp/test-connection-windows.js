const testConnection = async () => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT 
        @@SERVERNAME AS ServerName,
        DB_NAME() AS DatabaseName,
        SYSTEM_USER AS LoggedInUser
    `);
    
    console.log("✅ Connected to:");
    console.table(result.recordset);
    return true;
  } catch (error) {
    console.error("❌ Test query failed:", error.message);
    return false;
  }
};

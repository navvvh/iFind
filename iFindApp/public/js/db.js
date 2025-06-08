// db.js
const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'iFind',
  options: {
    trustServerCertificate: true, 
  },
  authentication: {
    type: 'ntlm',        
    options: {
      domain: '',      
      userName: '',          
      password: ''
    }
  }
};

sql.connect(config)
  .then(pool => {
    console.log('✅ Connected to SQL Server using Windows Authentication');
    module.exports = pool;
  })
  .catch(err => {
    console.error('❌ SQL connection error:', err);
  });

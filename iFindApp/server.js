const app = require('./app'); // if you're using app.js
const { testConnection } = require('./db');
require("dotenv").config();

const PORT = process.env.PORT || 3001;

testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});

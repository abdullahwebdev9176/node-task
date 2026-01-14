const express = require('express');
const app = express();
const port = process.env.PORT || 3000;  
const connectDB = require('./config/db');

connectDB();




app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
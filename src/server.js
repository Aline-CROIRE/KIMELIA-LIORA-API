require('dotenv').config();
const app = require('./app.js');
const connectDB = require('./config/db.js');

const PORT = process.env.PORT || 5000;

// Connect to Database, then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
  });
});
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();

// Security and Utility Middleware
app.use(helmet()); // Sets HTTP headers for security
app.use(cors()); // Enables Cross-Origin Resource Sharing
app.use(express.json()); // Parses incoming JSON payloads
app.use(morgan('dev')); // HTTP request logger

// Swagger Setup
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Add this import at the top
const authRoutes = require('./routes/auth.routes');

// Base Health Route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Kimelia Liora API is running' });
});

app.use('/api/v1/auth', authRoutes);

// We will add modular routes here in the next steps...

// Global 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

module.exports = app;
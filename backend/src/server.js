const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const officerRoutes = require('./routes/officer');
const invigilatorRoutes = require('./routes/invigilator');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Health check
app.get('/api/health', async (req, res) => {
  await db.initDatabase();
  res.json({
    status: 'ok',
    institution: 'University of Kigali (UoK)',
    system: 'Booklet Verification Management System (BVMS)',
    database: db.getDbStatus(),
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/invigilator', invigilatorRoutes);
// Public barcode endpoint also accessible at /api/barcode
app.use('/api', invigilatorRoutes);

async function startServer() {
  try {
    await db.initDatabase();
    app.listen(PORT, () => {
      console.log(`====================================================================`);
      console.log(`🎓 University of Kigali (UoK) - BVMS Backend API running on port ${PORT}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

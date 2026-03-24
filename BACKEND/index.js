require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

// Connect to Database
connectDB();

// Start SLA Escalation Cron Job
const startSLAEscalationJob = require('./jobs/slaEscalation');
startSLAEscalationJob();

const app = express();

// Trust proxies (required for Vercel/Render rate limiting)
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());
app.use(cors("*"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/complaint', require('./routes/complaintRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/lostfound', require('./routes/lostFoundRoutes'));

// New Routes
app.use('/api/exam', require('./routes/examRoutes'));
app.use('/api/noc', require('./routes/nocRoutes'));
app.use('/api/superadmin', require('./routes/superAdminRoutes'));
app.use('/api/head', require('./routes/headRoutes'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error', error: err.message });
});
app.get('/', (req, res) => {
  res.send('Hello World!');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

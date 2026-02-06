const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars/
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));
app.use(fileUpload());

// Set static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic route/
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const classeRoutes = require('./routes/classeRoutes');
const matiereRoutes = require('./routes/matiereRoutes');
const classeMatiereRoutes = require('./routes/classeMatiereRoutes');
const schedules = require('./routes/schedules');
const grades = require('./routes/grades');
const settings = require('./routes/settings');
const dashboard = require('./routes/dashboardRoutes');
const attendance = require('./routes/attendanceRoutes');
const events = require('./routes/eventRoutes');
const incidents = require('./routes/incidentRoutes');
const notifications = require('./routes/notificationRoutes');
const statsRoutes = require('./routes/statsRoutes');
const evaluations = require('./routes/evaluations');
const notes = require('./routes/notes');
const bulletins = require('./routes/bulletins');
const noteColumns = require('./routes/noteColumns');
const unlockRequests = require('./routes/unlockRequests');
const parentRoutes = require('./routes/parentRoutes');

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/classes', classeRoutes);
app.use('/api/v1/matieres', matiereRoutes);
app.use('/api/v1/classe-matieres', classeMatiereRoutes);
app.use('/api/v1/schedules', schedules);
app.use('/api/v1/grades', grades);
app.use('/api/v1/settings', settings);
app.use('/api/v1/dashboard', dashboard);
app.use('/api/v1/attendance', attendance);
app.use('/api/v1/events', events);
app.use('/api/v1/incidents', incidents);
app.use('/api/v1/notifications', notifications);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/evaluations', evaluations);
app.use('/api/v1/notes', notes);
app.use('/api/v1/bulletins', bulletins);
app.use('/api/v1/note-columns', noteColumns);
app.use('/api/v1/unlock-requests', unlockRequests);
app.use('/api/v1/parents', parentRoutes);

// Error Handler Middleware
const errorHandler = require('./middleware/error');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
    console.error('❌ CRITICAL ERROR: JWT_SECRET is not defined in environment variables');
    console.error('Please add JWT_SECRET to your .env file');
    process.exit(1);
}

if (!process.env.MONGO_URI) {
    console.error('❌ CRITICAL ERROR: MONGO_URI is not defined in environment variables');
    console.error('Please add MONGO_URI to your .env file');
    process.exit(1);
}

console.log('✅ Environment variables validated successfully');

// Connect to Database
const Setting = require('./models/Setting');

// Connect to Database
connectDB().then(async () => {
    // Seed Default Settings
    try {
        const upi = await Setting.findOne({ key: 'upiId' });
        if (!upi) await Setting.create({ key: 'upiId', value: 'free@paytm' });

        const qr = await Setting.findOne({ key: 'qrCodeUrl' });
        if (!qr) await Setting.create({ key: 'qrCodeUrl', value: 'https://i.ibb.co/9H86gqzY/zenith-qr-only.png' });

        console.log("System Settings Synchronized.");
    } catch (err) { console.error("Settings Sync Failed:", err.message); }
});

const app = express();

// ========================================
// CORS Configuration - Allow Frontend URLs
// ========================================
const allowedOrigins = [
    'http://localhost:5000',           // Local development
    'http://127.0.0.1:5000',           // Local development (alternative)
    'https://getzenithos.netlify.app', // Final Netlify frontend
    'https://getzenithos.onrender.com', // Render backend URL
    'http://127.0.0.1:5500',           // VS Code Live Server
    'http://localhost:5500'            // VS Code Live Server (localhost)
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin only in development (like mobile apps or curl requests)
        if (!origin) {
            if (process.env.NODE_ENV === 'development') {
                return callback(null, true);
            } else {
                return callback(new Error('Origin header required in production'), false);
            }
        }

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};
// ========================================

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/public', express.static(path.join(__dirname, '../public'))); // Serve static frontend files from root public
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'))); // Serve uploads statically

// Basic Routes - Serve index.html for both / and /index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/user.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../user.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin.html'));
});

app.get('/explore-tree.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../explore-tree.html'));
});

// Define Routes
app.use(require('./middleware/activityMiddleware')); // Track global activity
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/academic', require('./routes/academicRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/professional', require('./routes/professionalRoutes'));
app.use('/api/personal', require('./routes/personalRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/explore', require('./routes/exploreRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

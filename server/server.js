// Zenith OS Core Server - v1.09.0 - Routing Protocol Cleanup
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from root directory
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });

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
connectDB().then(async (isConnected) => {
    if (!isConnected) return;
    // Seed Default Settings
    try {
        const upi = await Setting.findOne({ key: 'upiId' });
        if (!upi) await Setting.create({ key: 'upiId', value: 'free@paytm' });

        const qr = await Setting.findOne({ key: 'qrCodeUrl' });
        if (!qr) await Setting.create({ key: 'qrCodeUrl', value: 'https://i.ibb.co/9H86gqzY/zenith-qr-only.png' });

        // Branding Seeds
        const name = await Setting.findOne({ key: 'systemName' });
        if (!name) await Setting.create({ key: 'systemName', value: 'Zenith' });

        const ver = await Setting.findOne({ key: 'systemVersion' });
        if (!ver) await Setting.create({ key: 'systemVersion', value: 'v1.09.0' });

        const accent = await Setting.findOne({ key: 'accent' });
        if (!accent) await Setting.create({ key: 'accent', value: '#3b82f6' });

        console.log("System Settings Synchronized.");
    } catch (err) { console.error("Settings Sync Failed:", err.message); }
});

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// ========================================
// Security Middleware
// ========================================
app.use(helmet());

// Apply rate limiting to all requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Increased limit for dev
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', limiter);

// Stricter limiter for Auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // Temporarily increased for intensive local testing
    message: { message: 'Too many authentication attempts, please try again later' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// System Reset Limiter
app.use('/api/admin/reset-system', rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10,
    message: { message: 'Critical system reset attempts exceeded' }
}));

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
            // Allow requests with no origin during development/local work
            return callback(null, true);
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

// ========================================
// Security Headers (CSP) - Fix DevTools Blocking
// ========================================
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' * data: blob:; " +
        "connect-src 'self' * ws: wss:; " +
        "img-src 'self' * data: blob:; " +
        "font-src 'self' * data:; " +
        "style-src 'self' 'unsafe-inline' *; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' *;"
    );
    next();
});

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/public', express.static(path.join(__dirname, '../public'))); // Serve static frontend files from root public
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'))); // Serve uploads statically

// Basic Routes - Serve landing/dashboard for both / and /index.html
app.get('/', (req, res) => {
    // Try to serve index.html, fallback to user.html
    const indexPath = path.join(__dirname, '../index.html');
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.sendFile(path.join(__dirname, '../user.html'));
    }
});

app.get('/index.html', (req, res) => {
    const indexPath = path.join(__dirname, '../index.html');
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.sendFile(path.join(__dirname, '../user.html'));
    }
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

app.get('/groups.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../groups.html'));
});

app.get('/invite.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../invite.html'));
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
app.use('/api/groups', require('./routes/groupRoutes'));

const PORT = process.env.PORT || 5000;
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

// Initialize Socket Handlers
require('./socketHandlers')(io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

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
        const Setting = require('./models/Setting');
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

        // DSA Arena Auto-Seed
        const Problem = require('./models/Problem');
        const problemCount = await Problem.countDocuments();
        if (problemCount === 0) {
            console.log("DSA Arena is empty. Initializing neural challenges...");
            const problems = [
                { title: "Two Sum", description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.", difficulty: "Easy", xpReward: 10, tags: ["Array", "Hash Table"], examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }], testCases: [{ input: "4\n2 7 11 15\n9", expectedOutput: "0 1" }] },
                { title: "Reverse String", description: "Write a function that reverses a string. The input string is given as an array of characters `s`.", difficulty: "Easy", xpReward: 5, tags: ["String", "Two Pointers"], examples: [{ input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }], testCases: [{ input: "5\nh e l l o", expectedOutput: "o l l e h" }] },
                { title: "Palindrome Number", description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.", difficulty: "Easy", xpReward: 10, tags: ["Math"], examples: [{ input: "x = 121", output: "true" }], testCases: [{ input: "121", expectedOutput: "true" }, { input: "-121", expectedOutput: "false" }] },
                { title: "Longest Substring Without Repeating Characters", description: "Given a string `s`, find the length of the longest substring without repeating characters.", difficulty: "Medium", xpReward: 20, tags: ["String", "Sliding Window"], examples: [{ input: 's = "abcabcbb"', output: "3" }], testCases: [{ input: "abcabcbb", expectedOutput: "3" }] },
                { title: "Merge Two Sorted Lists", description: "Merge two sorted linked lists and return it as a sorted list.", difficulty: "Easy", xpReward: 15, tags: ["Linked List"], examples: [{ input: "l1 = [1,2,4], l2 = [1,3,4]", output: "[1,1,2,3,4,4]" }], testCases: [{ input: "1 2 4\n1 3 4", expectedOutput: "1 1 2 3 4 4" }] },
                { title: "Valid Parentheses", description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.", difficulty: "Easy", xpReward: 10, tags: ["Stack", "String"], examples: [{ input: 's = "()"', output: "true" }], testCases: [{ input: "()", expectedOutput: "true" }, { input: "([)]", expectedOutput: "false" }] },
                { title: "Best Time to Buy and Sell Stock", description: "Find the maximum profit you can achieve by buying on one day and selling on another day in the future.", difficulty: "Easy", xpReward: 15, tags: ["Array", "Dynamic Programming"], examples: [{ input: "prices = [7,1,5,3,6,4]", output: "5" }], testCases: [{ input: "6\n7 1 5 3 6 4", expectedOutput: "5" }] },
                { title: "Binary Tree Inorder Traversal", description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.", difficulty: "Easy", xpReward: 15, tags: ["Tree", "DFS"], examples: [{ input: "root = [1,null,2,3]", output: "[1,3,2]" }], testCases: [{ input: "1 null 2 3", expectedOutput: "1 3 2" }] },
                { title: "Kth Largest Element in an Array", description: "Find the kth largest element in an unsorted array.", difficulty: "Medium", xpReward: 25, tags: ["Heap", "Divide and Conquer"], examples: [{ input: "[3,2,3,1,2,4,5,5,6], k = 4", output: "4" }], testCases: [{ input: "9 4\n3 2 3 1 2 4 5 5 6", expectedOutput: "4" }] },
                { title: "Climbing Stairs", description: "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?", difficulty: "Easy", xpReward: 15, tags: ["Math", "Dynamic Programming"], examples: [{ input: "n = 3", output: "3" }], testCases: [{ input: "3", expectedOutput: "3" }] },
                { title: "Invert Binary Tree", description: "Given the root of a binary tree, invert the tree, and return its root.", difficulty: "Easy", xpReward: 10, tags: ["Tree", "BFS"], examples: [{ input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]" }], testCases: [{ input: "4 2 7 1 3 6 9", expectedOutput: "4 7 2 9 6 3 1" }] },
                { title: "Group Anagrams", description: "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.", difficulty: "Medium", xpReward: 30, tags: ["Array", "Hash Table", "String"], examples: [{ input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }], testCases: [{ input: "6\neat tea tan ate nat bat", expectedOutput: "bat nat tan ate eat tea" }] },
                { title: "Search in Rotated Sorted Array", description: "Given the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or -1 if it is not in `nums`.", difficulty: "Medium", xpReward: 35, tags: ["Array", "Binary Search"], examples: [{ input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" }], testCases: [{ input: "7 0\n4 5 6 7 0 1 2", expectedOutput: "4" }] },
                { title: "Trapping Rain Water", description: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.", difficulty: "Hard", xpReward: 100, tags: ["Array", "Two Pointers", "Stack"], examples: [{ input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" }], testCases: [{ input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6" }] },
                { title: "3Sum", description: "Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.", difficulty: "Medium", xpReward: 40, tags: ["Array", "Two Pointers"], examples: [{ input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" }], testCases: [{ input: "6\n-1 0 1 2 -1 -4", expectedOutput: "-1 -1 2 -1 0 1" }] },
                { title: "Product of Array Except Self", description: "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.", difficulty: "Medium", xpReward: 30, tags: ["Array", "Prefix Sum"], examples: [{ input: "nums = [1,2,3,4]", output: "[24,12,8,6]" }], testCases: [{ input: "4\n1 2 3 4", expectedOutput: "24 12 8 6" }] },
                { title: "House Robber", description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed.", difficulty: "Medium", xpReward: 25, tags: ["Dynamic Programming"], examples: [{ input: "nums = [1,2,3,1]", output: "4" }], testCases: [{ input: "4\n1 2 3 1", expectedOutput: "4" }] },
                { title: "Container With Most Water", description: "Find two lines that together with the x-axis form a container, such that the container contains the most water.", difficulty: "Medium", xpReward: 25, tags: ["Array", "Two Pointers"], examples: [{ input: "[1,8,6,2,5,4,8,3,7]", output: "49" }], testCases: [{ input: "9\n1 8 6 2 5 4 8 3 7", expectedOutput: "49" }] },
                { title: "Number of Islands", description: "Given an `m x n` 2D binary grid `grid`, return the number of islands.", difficulty: "Medium", xpReward: 45, tags: ["BFS", "DFS", "Union Find"], examples: [{ input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","0","1","1"]]', output: "3" }], testCases: [{ input: "3 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 0 1 1", expectedOutput: "3" }] },
                { title: "Word Search", description: "Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid.", difficulty: "Medium", xpReward: 50, tags: ["Backtracking", "Matrix"], examples: [{ input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: "true" }], testCases: [{ input: "3 4 ABCCED\nA B C E\nS F C S\nA D E E", expectedOutput: "true" }] }
            ];
            await Problem.insertMany(problems);
            console.log("20 Matrix Challenges seeded successfully.");
        }

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
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' *; " +
        "worker-src 'self' blob: data:;"
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

app.get('/login.html', (req, res) => {
    res.redirect('/');
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

app.get('/code-nexus.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../code-nexus.html'));
});

app.get('/arena-solver.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../arena-solver.html'));
});

app.get('/arena.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../arena.html'));
});

app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../profile.html'));
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
app.use('/api/code', require('./routes/codeRoutes'));
app.use('/api/problems', require('./routes/problemRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

const PORT = process.env.PORT || 5000;
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

// Initialize Socket Handlers
app.set('io', io);
require('./socketHandlers')(io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

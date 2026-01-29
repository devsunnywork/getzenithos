# 🚀 Zenith OS - Life Operating System

> A comprehensive platform to manage your academic, professional, health, and personal development journey.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://getzenithos.netlify.app)
[![Backend](https://img.shields.io/badge/backend-railway-blueviolet)](https://zenithos-production.up.railway.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Features

### 📚 Academic Management
- Course enrollment and tracking
- Progress monitoring with visual analytics
- Certificate generation and management
- Skill tree visualization with interactive roadmaps

### 💼 Professional Development
- Resume and portfolio management
- Placement tracking and applications
- GitHub and LinkedIn integration
- Interview preparation resources

### 🎯 Goal & Task Management
- Personal goal setting and tracking
- Task management with priorities
- Progress visualization
- Achievement milestones

### 💪 Health & Wellness
- Health metrics tracking
- Workout planning and logging
- Nutrition monitoring
- Wellness insights

### 🎓 Learning Hub
- Interactive course catalog
- Skill-based learning paths
- Progress tracking
- Leaderboard and gamification

### 🛠️ Admin Panel
- User management
- Course and content administration
- Analytics dashboard
- System settings and branding

## 🏗️ Tech Stack

### Frontend
- **HTML5/CSS3** - Modern, responsive UI
- **Vanilla JavaScript** - No framework dependencies
- **Tailwind CSS** - Utility-first styling
- **Font Awesome** - Icon library
- **D3.js** - Data visualization (skill trees)

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Deployment
- **Frontend:** Netlify
- **Backend:** Railway
- **Database:** MongoDB Atlas

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/zenith-os.git
cd zenith-os
```

2. **Install dependencies**
```bash
cd server
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

4. **Start the server**
```bash
cd server
node server.js
```

5. **Access the application**
- Open browser: `http://localhost:5000`
- Default admin credentials will be created on first run

## 📁 Project Structure

```
zenith-os/
├── index.html              # Landing page
├── public/                 # Frontend files
│   ├── js/                 # JavaScript files
│   │   ├── app.js         # Main application logic
│   │   ├── landing.js     # Landing page logic
│   │   ├── admin.js       # Admin panel logic
│   │   └── explore-tree.js # Skill tree visualization
│   ├── user.html          # User dashboard
│   ├── admin.html         # Admin panel
│   └── explore-tree.html  # Skill tree explorer
├── server/                 # Backend files
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration files
│   └── server.js          # Entry point
└── README.md              # This file
```

## 🔧 Configuration

### API Configuration
Update `API_BASE_URL` in these files for deployment:
- `public/js/landing.js` (line 6)
- `public/js/app.js` (line 6)

**Local Development:**
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

**Production:**
```javascript
const API_BASE_URL = 'https://zenithos-production.up.railway.app';
```

### CORS Configuration
Update allowed origins in `server/server.js` (line 34):
```javascript
const allowedOrigins = [
    'http://localhost:5000',
    'https://getzenithos.netlify.app'
];
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses/enroll` - Enroll in course
- `PUT /api/courses/progress` - Update progress

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/courses` - Create course
- `PUT /api/admin/settings` - Update settings

## 🌐 Deployment

### Deploy Backend to Railway
1. Push code to GitHub
2. Connect Railway to repository
3. Add environment variables
4. Deploy automatically

### Deploy Frontend to Netlify
1. Update API URLs to Railway backend
2. Push to GitHub or drag & drop
3. Configure custom domain (optional)

See detailed guides:
- [Railway Deployment](RAILWAY_DEPLOYMENT.md)
- [Netlify Deployment](NETLIFY_DEPLOYMENT.md)
- [Git Setup](GIT_SETUP.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Advik**
- GitHub: @devsunnywokr(https://github.com/devsunnywork)
- Live Demo: [Zenith OS](https://getzenithos.netlify.app)

## 🙏 Acknowledgments

- Font Awesome for icons
- Tailwind CSS for styling
- MongoDB Atlas for database hosting
- Railway for backend hosting
- Netlify for frontend hosting

## 📧 Support

For support, email sunnyrajput0247@gmail.com or open an issue in the repository.

---

**Made with ❤️ by Advik**

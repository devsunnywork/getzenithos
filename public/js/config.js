// ========================================
// ZENITH OS - API Configuration
// ========================================
// 
// DEPLOYMENT INSTRUCTIONS:
// 
// 1. Deploy backend to Railway
// 2. Get your Railway app URL (e.g., https://your-app-name.railway.app)
// 3. Replace the API_BASE_URL below with your Railway URL
// 4. Deploy frontend to Netlify/Vercel
//
// LOCAL DEVELOPMENT:
// Keep as 'http://localhost:5000'
//
// PRODUCTION:
// Change to your Railway URL (without trailing slash)
// Example: 'https://zenith-os-backend.railway.app'
// ========================================

const API_BASE_URL = 'https://getzenithos.onrender.com';

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_BASE_URL };
}

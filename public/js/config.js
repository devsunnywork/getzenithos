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

const API_BASE_URL = 'https://zenithos-production.up.railway.app';

// Z-LOADER SYSTEM v1.0
const ZLoader = {
    show: (msg = "Syncing Intelligence...") => {
        const loader = document.getElementById('zenith-loader');
        if (loader) {
            const msgEl = loader.querySelector('.loader-msg');
            if (msgEl) msgEl.innerText = msg.toUpperCase();
            loader.classList.remove('opacity-0', 'pointer-events-none');
            loader.classList.add('opacity-100');
        }
    },
    hide: () => {
        const loader = document.getElementById('zenith-loader');
        if (loader) {
            loader.classList.add('opacity-0', 'pointer-events-none');
            loader.classList.remove('opacity-100');
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_BASE_URL, ZLoader };
}

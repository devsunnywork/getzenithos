// ========================================
// ZENITH OS - API Configuration
// ========================================
// Auto-detects environment and switches between local and production
// ========================================

var API_BASE_URL = (() => {
    const hostname = window.location.hostname;

    // Production environment
    if (hostname === 'getzenithos.netlify.app' || hostname.includes('netlify.app')) {
        return 'https://getzenithos.onrender.com';
    }

    // Local development
    return 'http://localhost:5000';
})();

// console.log('🌐 API Environment:', API_BASE_URL);

// Z-LOADER SYSTEM v1.0
var ZLoader = {
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

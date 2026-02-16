// ========================================
// ZENITH OS - OFFLINE DETECTION SYSTEM
// ========================================

(function () {
    // Create offline banner
    const offlineBanner = document.createElement('div');
    offlineBanner.id = 'zenith-offline-banner';
    offlineBanner.className = 'fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-6 flex items-center justify-center gap-3 transform -translate-y-full transition-transform duration-500 shadow-2xl';
    offlineBanner.innerHTML = `
        <i class="fas fa-wifi-slash text-xl animate-pulse"></i>
        <span class="font-black uppercase tracking-[0.2em] text-xs">You're Offline - Using Cached Data</span>
    `;
    document.body.appendChild(offlineBanner);

    // Create online banner (reconnected)
    const onlineBanner = document.createElement('div');
    onlineBanner.id = 'zenith-online-banner';
    onlineBanner.className = 'fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 flex items-center justify-center gap-3 transform -translate-y-full transition-transform duration-500 shadow-2xl';
    onlineBanner.innerHTML = `
        <i class="fas fa-wifi text-xl"></i>
        <span class="font-black uppercase tracking-[0.2em] text-xs">Back Online - Connection Restored</span>
    `;
    document.body.appendChild(onlineBanner);

    let wasOffline = false;

    // Check online/offline status
    function updateOnlineStatus() {
        if (!navigator.onLine) {
            // User is offline
            offlineBanner.style.transform = 'translateY(0)';
            wasOffline = true;

            // Enable offline mode flag
            window.isOffline = true;
            console.warn('📡 Offline Mode: Using cached data');
        } else {
            // User is online
            offlineBanner.style.transform = 'translateY(-100%)';
            window.isOffline = false;

            // Show "Back Online" message only if was previously offline
            if (wasOffline) {
                onlineBanner.style.transform = 'translateY(0)';
                setTimeout(() => {
                    onlineBanner.style.transform = 'translateY(-100%)';
                    wasOffline = false;
                }, 3000); // Hide after 3 seconds

                console.log('✅ Back Online: Syncing data...');
            }
        }
    }

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Check status on page load
    updateOnlineStatus();

    // Periodic check (every 5 seconds) as backup
    setInterval(updateOnlineStatus, 5000);

    // Cache helper functions
    window.ZenithCache = {
        set: (key, data) => {
            try {
                localStorage.setItem(`zenith_cache_${key}`, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.error('Cache set error:', e);
            }
        },
        get: (key, maxAge = 3600000) => { // Default 1 hour
            try {
                const cached = localStorage.getItem(`zenith_cache_${key}`);
                if (!cached) return null;

                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp > maxAge) {
                    localStorage.removeItem(`zenith_cache_${key}`);
                    return null;
                }
                return data;
            } catch (e) {
                console.error('Cache get error:', e);
                return null;
            }
        },
        clear: () => {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('zenith_cache_')) {
                    localStorage.removeItem(key);
                }
            });
        }
    };

    // console.log('✅ Offline Detection System Initialized');
})();

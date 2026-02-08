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
        <span class="font-black uppercase tracking-[0.2em] text-xs">You're Offline - Check Your Connection</span>
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
        } else {
            // User is online
            offlineBanner.style.transform = 'translateY(-100%)';

            // Show "Back Online" message only if was previously offline
            if (wasOffline) {
                onlineBanner.style.transform = 'translateY(0)';
                setTimeout(() => {
                    onlineBanner.style.transform = 'translateY(-100%)';
                    wasOffline = false;
                }, 3000); // Hide after 3 seconds
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
})();

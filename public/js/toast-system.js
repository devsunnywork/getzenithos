// ========================================
// ZENITH OS - TOAST NOTIFICATION SYSTEM
// ========================================

class ZenithToast {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create toast container
        this.container = document.createElement('div');
        this.container.id = 'zenith-toast-container';
        this.container.className = 'fixed top-24 right-6 z-[9998] flex flex-col gap-3 pointer-events-none';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `pointer-events-auto transform translate-x-full transition-all duration-500 ease-out`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const colors = {
            success: 'from-green-600 to-emerald-600',
            error: 'from-red-600 to-orange-600',
            warning: 'from-amber-600 to-yellow-600',
            info: 'from-blue-600 to-indigo-600'
        };

        toast.innerHTML = `
            <div class="bg-gradient-to-r ${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px] max-w-md backdrop-blur-xl border border-white/20">
                <i class="fas ${icons[type]} text-xl"></i>
                <span class="font-bold text-sm flex-1">${message}</span>
                <button onclick="this.closest('.pointer-events-auto').remove()" class="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
        `;

        this.container.appendChild(toast);

        // Slide in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
            toast.classList.add('translate-x-0');
        }, 10);

        // Auto remove
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 500);
        }, duration);
    }

    success(message, duration) {
        this.show(message, 'success', duration);
    }

    error(message, duration) {
        this.show(message, 'error', duration);
    }

    warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    info(message, duration) {
        this.show(message, 'info', duration);
    }
}

// Global instance
window.ZToast = new ZenithToast();

// Convenience methods
window.showToast = (message, type, duration) => window.ZToast.show(message, type, duration);

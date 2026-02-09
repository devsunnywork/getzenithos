/**
 * Global Error Handler for Zenith OS
 * Catches unhandled errors and provides user-friendly feedback
 */

// Global error boundary
window.addEventListener('error', (event) => {
    console.error('💥 Global Error:', event.error);

    // Show user-friendly error UI
    showErrorUI({
        title: 'Something Went Wrong',
        message: 'We encountered an unexpected error. Please refresh the page.',
        technical: event.error?.message || 'Unknown error',
        stack: event.error?.stack
    });

    // Prevent default browser error handling
    event.preventDefault();
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Unhandled Promise Rejection:', event.reason);

    showErrorUI({
        title: 'Network Error',
        message: 'Failed to connect to the server. Please check your connection.',
        technical: event.reason?.message || 'Promise rejection',
        stack: event.reason?.stack
    });

    event.preventDefault();
});

/**
 * Show error UI overlay
 */
function showErrorUI({ title, message, technical, stack }) {
    // Check if error UI already exists
    if (document.getElementById('zenith-error-overlay')) return;

    const errorOverlay = document.createElement('div');
    errorOverlay.id = 'zenith-error-overlay';
    errorOverlay.className = 'fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8';
    errorOverlay.innerHTML = `
        <div class="max-w-2xl w-full bg-gradient-to-br from-red-950/50 to-black border border-red-500/20 rounded-3xl p-12 text-center">
            <div class="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500"></i>
            </div>
            
            <h2 class="text-3xl font-black text-white uppercase tracking-tight mb-4">${title}</h2>
            <p class="text-slate-300 text-lg mb-8 leading-relaxed">${message}</p>
            
            <details class="text-left mb-8">
                <summary class="text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-400 transition">
                    Technical Details
                </summary>
                <div class="mt-4 p-4 bg-black/50 rounded-xl border border-white/5">
                    <p class="text-xs font-mono text-red-400 mb-2">${technical}</p>
                    ${stack ? `<pre class="text-[10px] text-slate-600 overflow-x-auto">${stack}</pre>` : ''}
                </div>
            </details>
            
            <div class="flex gap-4 justify-center">
                <button onclick="window.location.reload()" 
                    class="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl uppercase tracking-widest text-xs transition shadow-lg shadow-red-900/20">
                    <i class="fas fa-redo mr-2"></i> Reload Page
                </button>
                <button onclick="document.getElementById('zenith-error-overlay').remove()" 
                    class="px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl uppercase tracking-widest text-xs transition border border-white/10">
                    Dismiss
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(errorOverlay);
}

/**
 * Safe async wrapper for error handling
 */
window.safeAsync = async (fn, fallback = null) => {
    try {
        return await fn();
    } catch (error) {
        console.error('Safe Async Error:', error);
        showErrorUI({
            title: 'Operation Failed',
            message: 'This action could not be completed. Please try again.',
            technical: error.message,
            stack: error.stack
        });
        return fallback;
    }
};

console.log('✅ Global Error Handler Initialized');

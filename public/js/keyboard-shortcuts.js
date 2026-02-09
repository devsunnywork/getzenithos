/**
 * Keyboard Shortcuts for Zenith OS
 * Global keyboard shortcuts for power users
 */

window.KeyboardShortcuts = {
    init: () => {
        document.addEventListener('keydown', (e) => {
            // Escape - Close modals
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('[id*="modal"]:not(.hidden)');
                openModals.forEach(modal => {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                });
                document.body.classList.remove('modal-open');
            }

            // Ctrl/Cmd + K - Search (if search exists)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }

            // Ctrl/Cmd + / - Show shortcuts help
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                KeyboardShortcuts.showHelp();
            }
        });

        console.log('✅ Keyboard Shortcuts Initialized');
        console.log('   - ESC: Close modals');
        console.log('   - Ctrl+K: Focus search');
        console.log('   - Ctrl+/: Show shortcuts');
    },

    showHelp: () => {
        showToast('Keyboard Shortcuts: ESC (close), Ctrl+K (search), Ctrl+/ (help)', 'info', 5000);
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    KeyboardShortcuts.init();
});

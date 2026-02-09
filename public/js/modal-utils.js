/**
 * Modal Utilities for Zenith OS
 * Handles modal scroll locking and backdrop clicks
 */

window.ModalUtils = {
    /**
     * Open a modal and lock body scroll
     */
    open: (modalId) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Lock body scroll
        document.body.classList.add('modal-open');

        // Show modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        // Trap focus in modal
        ModalUtils.trapFocus(modal);

        console.log(`✅ Modal opened: ${modalId}`);
    },

    /**
     * Close a modal and unlock body scroll
     */
    close: (modalId) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Hide modal
        modal.classList.add('hidden');
        modal.classList.remove('flex');

        // Unlock body scroll only if no other modals are open
        const openModals = document.querySelectorAll('[id*="modal"]:not(.hidden)');
        if (openModals.length === 0) {
            document.body.classList.remove('modal-open');
        }

        console.log(`✅ Modal closed: ${modalId}`);
    },

    /**
     * Setup backdrop click to close
     */
    setupBackdropClose: (modalId) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.addEventListener('click', (e) => {
            // Close if clicking the backdrop (not the modal content)
            if (e.target === modal) {
                ModalUtils.close(modalId);
            }
        });
    },

    /**
     * Trap focus within modal for accessibility
     */
    trapFocus: (modal) => {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Focus first element
        firstElement.focus();

        // Trap focus
        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        });
    },

    /**
     * Setup Escape key to close modal
     */
    setupEscapeClose: (modalId) => {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById(modalId);
                if (modal && !modal.classList.contains('hidden')) {
                    ModalUtils.close(modalId);
                }
            }
        });
    }
};

// Auto-setup all modals on page load
document.addEventListener('DOMContentLoaded', () => {
    const modals = document.querySelectorAll('[id*="modal"]');
    modals.forEach(modal => {
        ModalUtils.setupBackdropClose(modal.id);
        ModalUtils.setupEscapeClose(modal.id);
    });

    console.log(`✅ Modal utilities initialized for ${modals.length} modals`);
});

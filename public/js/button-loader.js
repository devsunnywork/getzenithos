/**
 * Button Loading State Utility
 * Shows loading spinner on buttons during async operations
 */

window.ButtonLoader = {
    /**
     * Show loading state on button
     */
    show: (button) => {
        if (typeof button === 'string') {
            button = document.getElementById(button) || document.querySelector(button);
        }

        if (!button) return;

        // Store original content
        button.dataset.originalContent = button.innerHTML;
        button.dataset.originalDisabled = button.disabled;

        // Disable button
        button.disabled = true;
        button.classList.add('opacity-75', 'cursor-not-allowed');

        // Show spinner
        button.innerHTML = `
            <i class="fas fa-spinner fa-spin mr-2"></i>
            ${button.dataset.loadingText || 'Loading...'}
        `;
    },

    /**
     * Hide loading state and restore button
     */
    hide: (button) => {
        if (typeof button === 'string') {
            button = document.getElementById(button) || document.querySelector(button);
        }

        if (!button || !button.dataset.originalContent) return;

        // Restore original content
        button.innerHTML = button.dataset.originalContent;
        button.disabled = button.dataset.originalDisabled === 'true';
        button.classList.remove('opacity-75', 'cursor-not-allowed');

        // Clean up
        delete button.dataset.originalContent;
        delete button.dataset.originalDisabled;
    },

    /**
     * Wrap async function with loading state
     */
    wrap: async (button, asyncFn) => {
        ButtonLoader.show(button);
        try {
            return await asyncFn();
        } finally {
            ButtonLoader.hide(button);
        }
    }
};

console.log('✅ Button Loader Initialized');

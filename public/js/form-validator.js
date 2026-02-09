/**
 * Form Validation Utilities for Zenith OS
 * Real-time inline validation with visual feedback
 */

window.FormValidator = {
    /**
     * Validate email format
     */
    isValidEmail: (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Validate password strength
     */
    isValidPassword: (password) => {
        return password.length >= 6;
    },

    /**
     * Show error message on input
     */
    showError: (input, message) => {
        // Remove existing error
        FormValidator.clearError(input);

        // Add error class
        input.classList.add('border-red-500', 'bg-red-500/5');
        input.classList.remove('border-white/10');

        // Create error message
        const error = document.createElement('div');
        error.className = 'text-red-400 text-xs mt-2 font-bold uppercase tracking-wide';
        error.textContent = message;
        error.setAttribute('role', 'alert');
        error.id = `${input.id}-error`;

        // Insert after input
        input.parentNode.insertBefore(error, input.nextSibling);
    },

    /**
     * Show success state on input
     */
    showSuccess: (input) => {
        // Remove error
        FormValidator.clearError(input);

        // Add success class
        input.classList.add('border-green-500', 'bg-green-500/5');
        input.classList.remove('border-white/10', 'border-red-500');
    },

    /**
     * Clear error/success state
     */
    clearError: (input) => {
        // Remove error message
        const error = document.getElementById(`${input.id}-error`);
        if (error) error.remove();

        // Reset classes
        input.classList.remove('border-red-500', 'bg-red-500/5', 'border-green-500', 'bg-green-500/5');
        input.classList.add('border-white/10');
    },

    /**
     * Setup real-time validation for email input
     */
    setupEmailValidation: (inputId) => {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('blur', () => {
            const value = input.value.trim();
            if (!value) {
                FormValidator.clearError(input);
                return;
            }

            if (!FormValidator.isValidEmail(value)) {
                FormValidator.showError(input, 'Invalid email format');
            } else {
                FormValidator.showSuccess(input);
            }
        });

        input.addEventListener('input', () => {
            if (input.classList.contains('border-red-500')) {
                const value = input.value.trim();
                if (FormValidator.isValidEmail(value)) {
                    FormValidator.showSuccess(input);
                }
            }
        });
    },

    /**
     * Setup real-time validation for password input
     */
    setupPasswordValidation: (inputId) => {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('blur', () => {
            const value = input.value;
            if (!value) {
                FormValidator.clearError(input);
                return;
            }

            if (!FormValidator.isValidPassword(value)) {
                FormValidator.showError(input, 'Password must be at least 6 characters');
            } else {
                FormValidator.showSuccess(input);
            }
        });

        input.addEventListener('input', () => {
            if (input.classList.contains('border-red-500')) {
                const value = input.value;
                if (FormValidator.isValidPassword(value)) {
                    FormValidator.showSuccess(input);
                }
            }
        });
    },

    /**
     * Setup required field validation
     */
    setupRequiredValidation: (inputId) => {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('blur', () => {
            const value = input.value.trim();
            if (!value) {
                FormValidator.showError(input, 'This field is required');
            } else {
                FormValidator.showSuccess(input);
            }
        });
    }
};

console.log('✅ Form Validator Initialized');

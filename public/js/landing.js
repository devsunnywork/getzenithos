// Zenith OS Landing Logic - v1.09.0

// API Base URL is loaded from public/js/config.js
// ========================================

// Check if already logged in
(function () {
    const token = localStorage.getItem('token');
    if (token) {
        // Simple sanity check or just redirect
        window.location.replace('/user.html');
    }
})();

async function fetchBranding() {
    ZLoader.show("Syncing Branding...");
    try {
        const res = await fetch(`${API_BASE_URL}/api/settings/branding`);
        const data = await res.json();
        if (data.systemName) {
            const el = document.getElementById('logo-text');
            if (el) el.innerText = data.systemName;
        }
        if (data.systemVersion) {
            const el = document.getElementById('ver-text');
            if (el) el.innerText = data.systemVersion;
        }

        // Inject Smooth Interaction Styles
        const style = document.createElement('style');
        style.innerHTML = `
            button, a, .glass-card, [onclick] {
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
            }
            button:active, a:active, .glass-card:active {
                transform: scale(0.97) !important;
                filter: brightness(0.9) !important;
            }
        `;
        document.head.appendChild(style);
    } catch (e) {
    } finally {
        ZLoader.hide();
    }
}
fetchBranding();

// Scroll Tracking for Navbar
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav'); // Updated selector to be safer
    if (nav) {
        if (window.scrollY > 50) {
            nav.classList.add('bg-black/80', 'backdrop-blur-xl', 'shadow-2xl');
            nav.classList.remove('bg-black/50', 'backdrop-blur-md');
        } else {
            nav.classList.add('bg-black/50', 'backdrop-blur-md');
            nav.classList.remove('bg-black/80', 'backdrop-blur-xl', 'shadow-2xl');
        }
    }
});

// Handle Login and Register Form Submissions
async function handleAuth(event, mode) {
    event.preventDefault();

    // Hide any previous errors
    hideError(mode);

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "PROCESSING...";
    submitBtn.disabled = true;
    ZLoader.show(mode === 'login' ? "Authenticating Identity..." : "Initializing Neural Link...");

    const payload = {};
    let endpoint = '';

    if (mode === 'login') {
        payload.email = document.getElementById('l-email').value;
        payload.password = document.getElementById('l-password').value;
        endpoint = '/api/auth/login';
    } else {
        payload.username = document.getElementById('r-username').value;
        payload.email = document.getElementById('r-email').value;
        payload.password = document.getElementById('r-password').value;
        endpoint = '/api/auth/register';
    }

    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            // Success
            localStorage.setItem('token', data.token);
            if (data.username) localStorage.setItem('username', data.username);

            // Handle Deep Link Redirects (e.g. from Group Invites)
            const inviteRedirect = localStorage.getItem('inviteRedirect');
            if (inviteRedirect && data.role !== 'admin') {
                window.location.replace(inviteRedirect);
                return;
            }

            // Redirect based on role
            // Backend returns { token, username, role }
            if (data.role === 'admin') {
                window.location.replace('/admin.html');
            } else {
                window.location.replace('/user.html');
            }
        } else {
            // Show error below form
            showError(mode, data.message || 'AUTHENTICATION FAILED');
        }
    } catch (err) {
        console.error(err);
        showError(mode, 'CONNECTION FAILURE. SERVER UNREACHABLE.');
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        ZLoader.hide();
    }
}

// Show error message below form
function showError(mode, message) {
    const errorDiv = document.getElementById(`${mode}-error`);
    const errorText = document.getElementById(`${mode}-error-text`);

    if (errorDiv && errorText) {
        errorText.innerText = message;
        errorDiv.classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideError(mode);
        }, 5000);
    }
}

// Hide error message
function hideError(mode) {
    const errorDiv = document.getElementById(`${mode}-error`);
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

// Ensure global scope access if needed
window.handleAuth = handleAuth;

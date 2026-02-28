
    (function checkAdmin() {
        const token = localStorage.getItem('token');
        if (!token) return window.location.href = '/';

        // Use the global API_BASE_URL from config.js
        fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => {
            if (!res.ok) return window.location.href = '/';
            return res.json();
        }).then(user => {
            if (user.role !== 'admin') {
                alert("UNAUTHORIZED ACCESS DETECTED. REDIRECTING.");
                window.location.href = '/user.html';
            }
        }).catch(() => window.location.href = '/');
    })();

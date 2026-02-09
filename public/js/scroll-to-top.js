/**
 * Scroll to Top Feature
 * Automatically adds a floating button to scroll to the top of the page.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Create the button element
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.id = 'scroll-to-top';
    scrollBtn.title = 'Scroll to Top';

    // Styles
    Object.assign(scrollBtn.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#0070ff', // Zenith Blue
        color: '#ffffff',
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
        display: 'none', // Hidden by default
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9999',
        boxShadow: '0 10px 20px rgba(0, 112, 255, 0.3)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: '0',
        transform: 'translateY(20px)',
        fontSize: '20px'
    });

    // Check if we are on mobile to adjust position (avoid overlap with mobile toggles if any)
    if (window.innerWidth <= 768) {
        scrollBtn.style.bottom = '80px'; // Higher up to avoid bottom bars
        scrollBtn.style.right = '20px';
    }

    // Hover effect
    scrollBtn.onmouseenter = () => {
        scrollBtn.style.transform = 'translateY(-5px) scale(1.1)';
        scrollBtn.style.boxShadow = '0 15px 30px rgba(0, 112, 255, 0.5)';
        scrollBtn.style.backgroundColor = '#3b82f6'; // Lighten on hover
    };
    scrollBtn.onmouseleave = () => {
        if (scrollBtn.style.opacity === '1') {
            scrollBtn.style.transform = 'translateY(0) scale(1)';
        }
        scrollBtn.style.boxShadow = '0 10px 20px rgba(0, 112, 255, 0.3)';
        scrollBtn.style.backgroundColor = '#0070ff';
    };

    // Append to body
    document.body.appendChild(scrollBtn);

    // Scroll Logic
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            if (scrollBtn.style.display !== 'flex') {
                scrollBtn.style.display = 'flex';
                // Trigger reflow
                void scrollBtn.offsetWidth;
                scrollBtn.style.opacity = '1';
                scrollBtn.style.transform = 'translateY(0) scale(1)';
            }
        } else {
            if (scrollBtn.style.opacity === '1') {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    if (window.scrollY <= 300) scrollBtn.style.display = 'none';
                }, 300);
            }
        }
    });

    // Click Logic
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

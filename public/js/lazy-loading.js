// ========================================
// ZENITH OS - LAZY LOADING SYSTEM
// ========================================

(function () {
    // Intersection Observer for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;

                // Load the image
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }

                // Add fade-in effect
                img.classList.add('lazy-loaded');

                // Stop observing this image
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px' // Start loading 50px before image enters viewport
    });

    // Observe all images with data-src attribute
    function observeImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            // Add placeholder blur effect
            img.style.filter = 'blur(10px)';
            img.style.transition = 'filter 0.3s ease-out';

            imageObserver.observe(img);
        });
    }

    // Add CSS for lazy loaded images
    const style = document.createElement('style');
    style.textContent = `
        img[data-src] {
            background: rgba(255, 255, 255, 0.05);
            min-height: 100px;
        }
        
        img.lazy-loaded {
            filter: blur(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeImages);
    } else {
        observeImages();
    }

    // Re-observe when new images are added dynamically
    window.initLazyLoading = observeImages;

    // Fallback for browsers without IntersectionObserver
    if (!('IntersectionObserver' in window)) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
})();

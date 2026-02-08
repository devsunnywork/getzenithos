// ========================================
// ZENITH OS - SKELETON LOADER SYSTEM
// ========================================

// Skeleton CSS (inject into head)
const skeletonStyles = `
<style id="zenith-skeleton-styles">
    .skeleton {
        background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.03) 25%, 
            rgba(255, 255, 255, 0.08) 50%, 
            rgba(255, 255, 255, 0.03) 75%
        );
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s ease-in-out infinite;
        border-radius: 8px;
    }

    @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }

    .skeleton-text {
        height: 16px;
        margin-bottom: 8px;
    }

    .skeleton-title {
        height: 24px;
        width: 60%;
        margin-bottom: 12px;
    }

    .skeleton-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
    }

    .skeleton-card {
        height: 200px;
        border-radius: 16px;
    }

    .skeleton-button {
        height: 40px;
        width: 120px;
        border-radius: 12px;
    }
</style>
`;

// Inject styles
if (!document.getElementById('zenith-skeleton-styles')) {
    document.head.insertAdjacentHTML('beforeend', skeletonStyles);
}

// Skeleton Templates
window.ZenithSkeleton = {
    // Dashboard card skeleton
    dashboardCard: () => `
        <div class="glass-card p-8 rounded-[2rem] border border-white/5">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 80%;"></div>
            <div class="skeleton skeleton-text" style="width: 90%;"></div>
            <div class="mt-6 skeleton skeleton-button"></div>
        </div>
    `,

    // Course card skeleton
    courseCard: () => `
        <div class="glass-card p-6 rounded-2xl border border-white/5">
            <div class="skeleton skeleton-card mb-4"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 70%;"></div>
        </div>
    `,

    // User profile skeleton
    userProfile: () => `
        <div class="flex items-center gap-4">
            <div class="skeleton skeleton-avatar"></div>
            <div class="flex-1">
                <div class="skeleton skeleton-title" style="width: 150px;"></div>
                <div class="skeleton skeleton-text" style="width: 100px;"></div>
            </div>
        </div>
    `,

    // Table row skeleton
    tableRow: () => `
        <div class="flex items-center gap-4 p-4 border-b border-white/5">
            <div class="skeleton skeleton-text flex-1"></div>
            <div class="skeleton skeleton-text flex-1"></div>
            <div class="skeleton skeleton-text flex-1"></div>
            <div class="skeleton skeleton-button"></div>
        </div>
    `,

    // Generic text skeleton
    text: (lines = 3) => {
        let html = '';
        for (let i = 0; i < lines; i++) {
            const width = i === lines - 1 ? '60%' : '100%';
            html += `<div class="skeleton skeleton-text" style="width: ${width};"></div>`;
        }
        return html;
    }
};

// Helper to show skeleton in element
window.showSkeleton = (elementId, template = 'dashboardCard', count = 1) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    let html = '';
    for (let i = 0; i < count; i++) {
        html += window.ZenithSkeleton[template]();
    }
    element.innerHTML = html;
};

// Helper to hide skeleton
window.hideSkeleton = (elementId, content) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.innerHTML = content;
};

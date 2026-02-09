/**
 * Empty State Component for Zenith OS
 * Displays user-friendly empty states for data displays
 */

window.EmptyState = {
    /**
     * Render empty state HTML
     */
    render: ({ icon = 'fa-inbox', title = 'No Data', message = 'Nothing to display yet', actionText = null, actionCallback = null }) => {
        return `
            <div class="empty-state py-20 px-8">
                <div class="empty-state-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <h3 class="text-2xl font-black text-white mb-3 uppercase tracking-tight">${title}</h3>
                <p class="text-slate-400 text-sm mb-8 max-w-md mx-auto">${message}</p>
                ${actionText ? `
                    <button onclick="${actionCallback}" 
                        class="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-widest text-xs transition shadow-lg shadow-blue-900/20">
                        ${actionText}
                    </button>
                ` : ''}
            </div>
        `;
    },

    /**
     * Common empty states
     */
    noCourses: () => EmptyState.render({
        icon: 'fa-graduation-cap',
        title: 'No Courses Yet',
        message: 'Start your learning journey by enrolling in a course',
        actionText: 'Browse Courses',
        actionCallback: 'loadPage("academic")'
    }),

    noTransactions: () => EmptyState.render({
        icon: 'fa-receipt',
        title: 'No Transactions',
        message: 'Your transaction history will appear here',
    }),

    noMissions: () => EmptyState.render({
        icon: 'fa-tasks',
        title: 'No Missions',
        message: 'Create your first mission to get started',
        actionText: 'Create Mission',
        actionCallback: 'openMissionModal()'
    }),

    noResults: () => EmptyState.render({
        icon: 'fa-search',
        title: 'No Results Found',
        message: 'Try adjusting your search or filters',
    }),

    offline: () => EmptyState.render({
        icon: 'fa-wifi-slash',
        title: 'You\'re Offline',
        message: 'Check your internet connection to load this content',
    })
};

console.log('✅ Empty State Component Initialized');

// Zenith OS Core Logic — Intelligence Hub v5.0

// API Base URL is loaded from public/js/config.js
// ========================================

const token = localStorage.getItem('token');
// If no token, redirect to Landing (now at /)
if (!token && !window.location.pathname.includes('index.html') && window.location.pathname !== '/' && window.location.pathname !== '/index.html') window.location.href = '/index.html';

window.navigate = (page) => loadPage(page);

const state = {
    activePage: 'dashboard',
    user: null,
    courses: [],
    enrolledCourses: [],
    goals: [],
    profileTab: 'identity',
    settings: {}
};

// ========================================
// CORE INITIALIZATION
// ========================================

async function init() {
    // Initial Desktop Lock Check
    checkDesktopLock();
    window.addEventListener('resize', checkDesktopLock);

    // If locked, don't proceed with neural link
    if (window.innerWidth < 1000) return;

    ZLoader.show("Initializing Neural Link...");
    try {
        initToastSystem();
        initInactivityTracker();
        await fetchUser();
        await fetchCourses();
        await fetchTasks();
        await fetchSettings();
        applyTheme();
        loadPage('dashboard');
        lucide.createIcons();

        // Check for Welcome Bonus
        if (state.user && !state.user.bonusClaimed) {
            renderBonusPopup();
        }
    } catch (err) {
        console.error("Critical System Failure:", err);
        if (window.showToast) showToast("Neural Link Failure: System Offline", "error");
    } finally {
        ZLoader.hide();
    }
}

async function fetchCourses() {
    try {
        const res = await fetch(API_BASE_URL + '/api/courses', { headers: { 'Authorization': `Bearer ${token}` } });
        state.courses = await res.json();
    } catch (e) { console.error("Course Matrix Offline"); }
}

async function fetchTasks() {
    try {
        const res = await fetch(API_BASE_URL + '/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } });
        state.tasks = await res.json();
    } catch (e) { state.tasks = []; }
}

// --- MOBILE NAVIGATION FUNCTIONS ---
function toggleMobileMenu() {
    const menu = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.mobile-nav-overlay');

    if (menu && overlay) {
        const isActive = menu.classList.contains('active');

        if (isActive) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }
}

function openMobileMenu() {
    const menu = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.mobile-nav-overlay');

    if (menu && overlay) {
        menu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeMobileMenu() {
    const menu = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.mobile-nav-overlay');

    if (menu && overlay) {
        menu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.querySelector('.mobile-nav');
    const hamburger = document.querySelector('.hamburger-btn');

    if (menu && menu.classList.contains('active')) {
        if (!menu.contains(e.target) && !hamburger?.contains(e.target)) {
            closeMobileMenu();
        }
    }
});

// Close mobile menu on window resize to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
});

// --- NOTIFICATION SYSTEM (TOAST) ---
function initToastSystem() {
    // Create Container
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        z-index: 9999;
        pointer-events: none;
    `;
    document.body.appendChild(container);

    // Inject Styles for Animation & Smooth Interaction
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideInToast {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOutToast {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        .zenith-toast {
            animation: slideInToast 0.4s ease-out forwards;
        }
        .zenith-toast.hiding {
            animation: fadeOutToast 0.3s ease-in forwards;
        }

        /* Smooth Interactive System */
        button, a, .sidebar-item, .glass-card, [onclick] {
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        
        button:active, a:active, .sidebar-item:active, .glass-card:active {
            transform: scale(0.97) !important;
            filter: brightness(0.9) !important;
        }

        .page-transition {
            animation: pageFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes pageFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');

    // Colors based on type
    const colors = {
        success: 'border-green-500 text-green-500 bg-green-500/10',
        error: 'border-red-500 text-red-500 bg-red-600/10',
        info: 'border-blue-500 text-blue-500 bg-blue-600/10'
    };

    // Auto-detect type from message content if generic 'info'
    if (type === 'info') {
        const msg = message.toLowerCase();
        if (msg.includes('success') || msg.includes('updated') || msg.includes('synchronized')) type = 'success';
        if (msg.includes('fail') || msg.includes('error') || msg.includes('denied') || msg.includes('large')) type = 'error';
    }

    const colorClass = colors[type] || colors.info;
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle';

    toast.className = `zenith-toast glass-card min-w-[300px] p-5 rounded-2xl border ${colorClass.split(' ')[0]} backdrop-blur-xl flex items-center gap-4 shadow-2xl relative overflow-hidden pointer-events-auto`;
    toast.style.background = "#05060f"; // Dark background override for legibility

    toast.innerHTML = `
        <div class="h-full absolute left-0 top-0 w-1 ${colorClass.split(' ')[2].replace('/10', '')}"></div>
        <div class="w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center shrink-0">
            <i class="fas ${icon} text-lg"></i>
        </div>
        <div>
            <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">System Notification</h4>
            <p class="text-xs font-bold text-white uppercase tracking-wider">${message}</p>
        </div>
    `;

    container.appendChild(toast);

    // Remove after 4 seconds
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- DESKTOP LOCK SYSTEM ---
function checkDesktopLock() {
    const existingLock = document.getElementById('zenith-desktop-lock');

    if (window.innerWidth < 1000) {
        if (!existingLock) {
            renderDesktopLock();
        } else {
            // Update resolution display if already showing
            const resDisplay = existingLock.querySelector('.resolution-val');
            if (resDisplay) resDisplay.innerText = `${window.innerWidth}px`;
        }
        // Ensure app content is hidden
        document.body.style.overflow = 'hidden';
    } else {
        if (existingLock) {
            existingLock.remove();
            document.body.style.overflow = '';
            // If the app wasn't initialized because it started small, we need to reload to trigger init()
            if (!state.user) window.location.reload();
        }
    }
}

function renderDesktopLock() {
    const lock = document.createElement('div');
    lock.id = 'zenith-desktop-lock';
    lock.style.cssText = `
        position: fixed; inset: 0; background: #000; z-index: 10000;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        text-align: center; padding: 40px; font-family: 'Syne', sans-serif;
    `;
    lock.innerHTML = `
        <div class="w-24 h-24 bg-blue-600/10 rounded-3xl flex items-center justify-center border border-blue-500/20 mb-8 animate-bounce">
            <i class="fas fa-desktop text-4xl text-blue-500"></i>
        </div>
        <h1 class="text-4xl font-black text-white uppercase tracking-tighter mb-4">Command Center Restricted</h1>
        <p class="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-8 max-w-sm">
            Zenith.OS requires ultra-wide neural bandwidth. Please switch to a Desktop display (min 1000px) to initialize connection.
        </p>
        <div class="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-blue-500 text-[10px] font-black uppercase tracking-widest">
            Current Resolution: <span class="resolution-val">${window.innerWidth}px</span>
        </div>
    `;
    document.body.appendChild(lock);
}

// --- WELCOME BONUS SYSTEM ---
function renderBonusPopup() {
    const overlay = document.createElement('div');
    overlay.id = 'bonus-overlay';
    overlay.className = 'fixed inset-0 z-[5000] bg-black/80 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-500';

    overlay.innerHTML = `
        <div class="glass-card max-w-xl w-full p-12 rounded-[4rem] border-blue-500/30 bg-gradient-to-br from-blue-600/10 to-transparent relative overflow-hidden text-center shadow-[0_0_100px_rgba(37,99,235,0.2)]">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            
            <div class="w-20 h-20 mx-auto bg-blue-600/20 rounded-3xl flex items-center justify-center text-blue-400 mb-8 border border-blue-500/30 animate-pulse">
                <i class="fas fa-gift text-3xl"></i>
            </div>
            
            <h2 class="text-4xl font-black syne text-white uppercase tracking-tighter mb-4">Welcome Operative</h2>
            <p class="text-slate-400 font-medium text-sm leading-relaxed mb-10 uppercase tracking-wide">
                Neural link established. Your specialized account has been pre-authorized for an immediate resource credit.
            </p>
            
            <div class="bg-white/5 p-8 rounded-3xl border border-white/10 mb-10 flex items-center justify-center gap-6 group hover:bg-white/10 transition-all">
                <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Allocation:</div>
                <div class="text-5xl font-black syne text-white tracking-tighter group-hover:scale-110 transition-transform">₹500</div>
                <div class="text-[10px] font-black text-blue-500 uppercase tracking-widest border border-blue-500/30 px-3 py-1 rounded-lg">FREE</div>
            </div>

            <button id="claim-bonus-btn" onclick="claimWelcomeBonus()" 
                class="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.4em] transition-all active:scale-95 shadow-2xl shadow-blue-600/30 group">
                Synchronize Credit <i class="fas fa-arrow-right ml-4 group-hover:translate-x-2 transition-transform"></i>
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
}

window.claimWelcomeBonus = async function () {
    const btn = document.getElementById('claim-bonus-btn');
    if (btn.disabled) return;

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> SYNCING...';

    try {
        const res = await fetch(API_BASE_URL + '/api/auth/claim-bonus', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await res.json();

        if (res.ok) {
            if (window.showToast) showToast(data.message, 'success');

            // Update UI Balance
            const balanceEl = document.getElementById('balance-display');
            const topBalanceEl = document.getElementById('top-balance-display');
            if (balanceEl) {
                balanceEl.innerText = `₹${data.newBalance.toLocaleString()}`;
            }
            if (topBalanceEl) {
                topBalanceEl.innerText = `₹${data.newBalance.toLocaleString()}`;
            }
            // Update mobile balance too just in case
            const mobileBalance = document.getElementById('mobile-balance-display');
            if (mobileBalance) mobileBalance.innerText = `₹${data.newBalance.toLocaleString()}`;

            // Remove Overlay
            const overlay = document.getElementById('bonus-overlay');
            overlay.classList.add('animate-out', 'fade-out', 'duration-500');
            setTimeout(() => overlay.remove(), 500);

            // Update state so it doesn't show again in current session
            state.user.bonusClaimed = true;
        } else {
            throw new Error(data.message);
        }
    } catch (err) {
        if (window.showToast) showToast(err.message, 'error');
        btn.disabled = false;
        btn.innerHTML = 'RETRY SYNCHRONIZATION';
    }
}

// Override native alert for quick migration, or manually replace calls.
// Since the code uses alert() extensively, wrapping it is safer and cleaner than regex replacing all.
window.legacyAlert = window.alert;
window.alert = function (msg) {
    showToast(msg);
};

async function fetchSettings() {
    try {
        const res = await fetch(API_BASE_URL + '/api/settings/branding');
        state.settings = await res.json();
    } catch (e) { }
}

function applyTheme() {
    if (state.settings.accent) {
        document.documentElement.style.setProperty('--zenith-blue', state.settings.accent);
    }
    if (state.settings.systemName) {
        const logo = document.getElementById('logo-branding-text');
        if (logo) logo.innerHTML = `${state.settings.systemName.toUpperCase()}<span class="text-blue-500">.OS</span>`;
    }
    if (state.settings.systemVersion) {
        // Update all version indicators
        const ver = document.getElementById('ver-branding');
        if (ver) ver.innerText = state.settings.systemVersion;

        const badge = document.getElementById('version-badge');
        if (badge) badge.innerText = `${state.settings.systemName?.toUpperCase() || 'ZENITH'}.OS // ${state.settings.systemVersion}`;

        // Sidebar Version Text
        const sidebarVer = document.getElementById('sidebar-version');
        if (sidebarVer) sidebarVer.innerText = `${state.settings.systemVersion} // Stable`;
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar-main');
    sidebar.classList.toggle('mobile-active');
    const toggle = document.getElementById('mobile-nav-toggle');
    toggle.innerHTML = sidebar.classList.contains('mobile-active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
}

async function fetchUser() {
    try {
        const res = await fetch(API_BASE_URL + '/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        state.user = await res.json();

        // Normalize enrolledCourses to expected [{ courseId: ... }] format if backend returns flat array
        if (state.user.enrolledCourses && state.user.enrolledCourses.length > 0) {
            if (!state.user.enrolledCourses[0].courseId) {
                state.user.enrolledCourses = state.user.enrolledCourses.map(c => ({ courseId: c }));
            }
        }

        const userNameEl = document.getElementById('user-name');
        const topUserNameEl = document.getElementById('top-user-name');
        if (userNameEl && state.user.username) {
            userNameEl.innerText = state.user.username.toUpperCase();
        }
        if (topUserNameEl && state.user.username) {
            topUserNameEl.innerText = state.user.username.toUpperCase();
        }

        const initials = state.user.username.substring(0, 2).toUpperCase();
        const initialEl = document.getElementById('user-initials');
        const topAvatarEl = document.getElementById('top-user-avatar');

        if (state.user.profile?.avatar) {
            let avatarUrl = state.user.profile.avatar;
            if (avatarUrl.startsWith('/uploads')) {
                avatarUrl = API_BASE_URL + avatarUrl;
            }
            const imgHtml = `<img src="${avatarUrl}" class="w-full h-full object-cover rounded-xl">`;
            const topImgHtml = `<img src="${avatarUrl}" class="w-full h-full object-cover">`;

            if (initialEl) {
                initialEl.innerHTML = imgHtml;
                initialEl.classList.remove('bg-blue-600/10', 'border', 'border-blue-500/20', 'text-blue-500');
                initialEl.classList.add('p-0', 'overflow-hidden');
            }
            if (topAvatarEl) {
                topAvatarEl.innerHTML = topImgHtml;
                topAvatarEl.classList.remove('bg-slate-950');
            }
        } else {
            if (initialEl) initialEl.innerText = initials;
            if (topAvatarEl) topAvatarEl.innerHTML = `<span class="font-black text-blue-500 text-sm">${initials}</span>`;
        }

        const formattedBalance = `₹${(state.user.balance || 0).toLocaleString()}`;
        if (document.getElementById('balance-display')) {
            document.getElementById('balance-display').innerText = formattedBalance;
        }
        if (document.getElementById('top-balance-display')) {
            document.getElementById('top-balance-display').innerText = formattedBalance;
        }

        // Update mobile balance display
        const mobileBalance = document.getElementById('mobile-balance-display');
        if (mobileBalance) {
            mobileBalance.innerText = formattedBalance;
        }
        state.enrolledCourses = state.user.enrolledCourses || [];
        // Robust extraction of flat IDs for comparisons
        state.enrolledIds = state.enrolledCourses.map(c => {
            const cid = c.courseId || c;
            return String(cid._id || cid);
        });

        if (state.user.role === 'admin') {
            const logoutSection = document.querySelector('.p-10.border-t');
            if (logoutSection && !document.getElementById('admin-hub-btn')) {
                const adminBtn = document.createElement('button');
                adminBtn.id = 'admin-hub-btn';
                adminBtn.onclick = () => window.location.href = '/admin.html';
                adminBtn.className = "flex items-center gap-4 text-red-500 font-black p-4 bg-red-600/10 rounded-2xl w-full transition text-[10px] uppercase tracking-[0.2em] mb-6 hover:bg-red-600 hover:text-white group";
                adminBtn.innerHTML = '<i class="fas fa-user-shield group-hover:rotate-12 transition"></i> Launch Command Center';
                logoutSection.prepend(adminBtn);
            }
        }
    } catch (err) {
        console.error("fetchUser Error:", err);
        if (window.showToast) showToast("Neural Link Failure: Session Invalid", "error");
        setTimeout(() => logout(), 2000);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.replace('/index.html');
}

// --- INACTIVITY TRACKING SYSTEM (30 MIN) ---
function initInactivityTracker() {
    let timeout;
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 Minutes

    function resetTimer() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            console.warn("System Idle: Inactivity limit reached. Synchronizing logout.");
            logout();
        }, INACTIVITY_LIMIT);
    }

    // Monitor common user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(name => {
        document.addEventListener(name, resetTimer, true);
    });

    resetTimer(); // Start the initial timer
}

const PAGE_META = {
    dashboard: ["Dashboard", "Overview of your activity"],
    academic: ["Courses", "Manage your learning modules"],
    missions: ["Tasks", "Daily goals and assignments"],
    professional: ["Careers", "Track your professional growth"],
    health: ["Health", "Monitor your vital statistics"],
    store: ["Store", "Browse and buy new modules"],
    profile: ["Profile", "Account Hub & Neural Support"],
    leaderboard: ["Rankings", "See how you compare to others"],
    roadmap: ["Roadmap", "Your skill development path"],
    explore: ["Explore", "Visual skill and career map"]
};

async function loadPage(page, subTab = null) {
    state.activePage = page;
    if (subTab) {
        if (page === 'helpdesk') state.supportTab = subTab;
        if (page === 'profile') state.profileTab = subTab;
    }
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    document.getElementById(`nav-${page}`)?.classList.add('active');

    // Refresh critical data in background
    if (page === 'dashboard' || page === 'academic') {
        fetchUser();
        fetchCourses();
        if (page === 'dashboard') fetchTasks();
    }

    const title = document.getElementById('page-title');
    const desc = document.getElementById('page-desc-sub');
    if (title) title.innerText = PAGE_META[page][0];
    if (desc) desc.innerText = PAGE_META[page][1];

    // Smooth transition
    const content = document.getElementById('app-content');
    content.classList.remove('page-transition');
    void content.offsetWidth; // Trigger reflow
    content.classList.add('page-transition');

    renderView(page, content);
    lucide.createIcons();
}

function renderView(page, container) {
    switch (page) {
        case 'dashboard': renderOverview(container); break;
        case 'academic': renderEnrolledCatalog(container, 'Academic'); break;
        case 'missions': renderMissionControl(container); break;
        case 'professional': renderSkillConstellation(container); break;
        case 'health': renderHealth(container); break;
        case 'store': renderStoreCatalog(container); break;
        case 'profile': renderProfile(container); break;
        case 'helpdesk': renderHelpDesk(container); break;
        case 'leaderboard': renderLeaderboard(container); break;
        case 'explore': renderExploreTreeLayout(container); break;
        case 'roadmap': renderRoadmap(container); break;
    }
}

function renderRoadmap(container) {
    // Redirecting Roadmap to the new Immersive Explorer experience
    renderExploreTreeLayout(container, "ROADMAP");
}


function renderExploreTreeLayout(container, mode = "EXPLORE") {
    container.innerHTML = `
        <div class="w-full h-full flex flex-col items-center justify-center relative p-8 animate-in fade-in duration-700">
            <!-- Background Decoration -->
            <div class="absolute inset-0 bg-[#020308] rounded-[2rem] border border-white/5 -z-10"></div>
            
            <div class="glass-card p-12 max-w-lg w-full rounded-[3rem] border border-white/5 text-center relative overflow-hidden group shadow-2xl">
                
                <!-- Glow -->
                <div class="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-600/10 rounded-full blur-[60px] group-hover:bg-blue-600/20 transition-all duration-700"></div>

                <div class="relative z-10 font-syne">
                    <div class="w-20 h-20 mx-auto bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 mb-8 border border-white/5 shadow-lg backdrop-blur-md">
                        <i class="fas fa-network-wired text-3xl"></i>
                    </div>

                    <h3 class="text-3xl font-black text-white uppercase tracking-tighter mb-4">Neural Matrix</h3>
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-10 leading-relaxed">
                        Access the immersive skill visualization engine.<br>
                        Launch in a new protocol window for full capability.
                    </p>

                    <button onclick="window.open('/explore-tree.html', '_blank')" 
                        class="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group/btn">
                        Launch System <i class="fas fa-external-link-alt group-hover/btn:translate-x-1 transition-transform"></i>
                    </button>
                    
                    <div class="mt-8 flex items-center justify-center gap-2">
                        <span class="relative flex h-2 w-2">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span class="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Protocol Active</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Academic Course Player Function
async function renderEnrolledCatalog(container, category) {
    const enrolledIds = state.user.enrolledCourses?.map(c => String(c.courseId._id || c.courseId)) || [];
    const academicCourses = state.courses.filter(c =>
        enrolledIds.includes(String(c._id)) && c.category === category
    );

    /* console.log('Academic Course Debug:', {
        totalCourses: state.courses.length,
        enrolledIds: enrolledIds.length,
        academicCourses: academicCourses.length,
        category: category,
        allCategories: state.courses.map(c => c.category)
    }); */

    if (academicCourses.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-20 rounded-[4rem] text-center border-white/5">
                <i class="fas fa-graduation-cap text-6xl text-slate-700 mb-6"></i>
                <h3 class="text-2xl font-black syne text-white mb-4">NO ACADEMIC MODULES DETECTED</h3>
                <p class="text-slate-400 mb-8 max-w-md mx-auto">Your neural pathway is currently focused on professional development. Academic modules will appear here once enrolled.</p>
                <button onclick="loadPage('store')" class="px-8 py-4 bg-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition shadow-lg shadow-blue-600/20">
                    Browse Catalog
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="space-y-8">
            <div class="flex items-center justify-between mb-10">
                <div>
                    <h2 class="text-4xl font-black syne tracking-tighter uppercase text-white mb-2">Academic Core</h2>
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Institutional Knowledge Matrix</p>
                </div>
                <div class="px-6 py-3 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                    <span class="text-2xl font-black text-blue-500">${academicCourses.length}</span>
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Active Modules</span>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${academicCourses.map(course => {
        const progress = state.user.courseProgress?.find(p => String(p.courseId) === String(course._id));
        const completedCount = progress?.completedLectures?.length || 0;
        const totalLectures = course.lectureCount || 0;
        const progressPercent = totalLectures > 0 ? Math.floor((completedCount / totalLectures) * 100) : 0;

        return `
                        <div onclick="openCoursePlayer('${course._id}')" class="glass-card p-8 rounded-[2.5rem] border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-all"></div>
                            
                            <div class="relative z-10">
                                <div class="flex items-start justify-between mb-6">
                                    <div class="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-600 group-hover:scale-110 transition-all">
                                        <i class="fas fa-book text-2xl text-blue-500 group-hover:text-white transition"></i>
                                    </div>
                                    <span class="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500">${course.category}</span>
                                </div>

                                <h3 class="text-xl font-black text-white mb-3 uppercase tracking-tight group-hover:text-blue-400 transition">${course.title}</h3>
                                <p class="text-xs text-slate-400 mb-6 line-clamp-2">${course.description || 'Comprehensive academic module'}</p>

                                <div class="space-y-3">
                                    <div class="flex justify-between items-end">
                                        <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Progress</span>
                                        <span class="text-xs font-black text-blue-500">${progressPercent}%</span>
                                    </div>
                                    <div class="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                        <div class="h-full bg-blue-600 transition-all duration-1000" style="width: ${progressPercent}%"></div>
                                    </div>
                                    <div class="flex items-center justify-between text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                        <span>${completedCount} / ${totalLectures} Lectures</span>
                                        <i class="fas fa-arrow-right text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;
}

function renderOverview(container) {
    const enrolledIds = state.user.enrolledCourses?.map(c => String(c.courseId._id || c.courseId)) || [];
    const enrolledData = state.courses.filter(c => enrolledIds.includes(String(c._id)));

    const totalCourses = enrolledIds.length;
    let completedLecs = 0;
    state.user.courseProgress?.forEach(p => completedLecs += (p.completedLectures?.length || 0));

    // ACCURATE LECTURE COUNT: Sum of ALL lectures in ALL enrolled courses (Academic + Skill-based)
    let totalPossibleLecs = 0;
    enrolledData.forEach(c => totalPossibleLecs += (c.lectureCount || 0));

    /* console.log('Dashboard Lecture Count Debug:', {
        enrolledCourses: enrolledData.length,
        completedLectures: completedLecs,
        totalPossibleLectures: totalPossibleLecs,
        courseDetails: enrolledData.map(c => ({
            title: c.title,
            lectureCount: c.lectureCount,
            units: c.units?.length || 0
        }))
    }); */

    // XP AND LEVELING SYSTEM (1000 XP per level, max 100)
    const currentXP = state.user.xp || 0;
    const level = Math.floor(currentXP / 1000) + 1;
    const displayLevel = Math.min(100, level);
    const xpInCurrentLevel = currentXP % 1000;
    const xpLeft = 1000 - xpInCurrentLevel;
    const levelProgress = (xpInCurrentLevel / 1000) * 100;

    // Efficiency Calculation
    const efficiency = totalPossibleLecs > 0 ? Math.min(100, Math.floor((completedLecs / totalPossibleLecs) * 100)) : 0;

    const activeMissions = (state.tasks || []).filter(t => t.status === 'active').slice(0, 3);
    const missionFeedHtml = activeMissions.length > 0 ? activeMissions.map(m => `
        <div class="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
            <div class="flex items-center gap-4">
                <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <div class="text-xs font-bold text-white uppercase tracking-tight">${m.title}</div>
            </div>
            <span class="text-[8px] font-black text-blue-500 uppercase tracking-widest px-2 py-1 bg-blue-500/10 rounded">In Progress</span>
        </div>
    `).join('') : `<p class="text-center py-10 text-slate-700 font-black uppercase text-[9px] tracking-[0.2em]">No active operations. Initiate a mission via control.</p>`;

    container.innerHTML = `
        <!-- Top Metrics: XP & Progress -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <!-- XP Accumulator -->
            <div class="glass-card p-10 rounded-[3.5rem] group border-white/5 relative overflow-hidden">
                <div class="absolute inset-0 bg-yellow-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div class="flex justify-between items-start mb-6 relative z-10">
                    <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Progression</h4>
                    <i class="fas fa-crown text-yellow-500 animate-bounce"></i>
                </div>
                <div class="flex items-baseline gap-2 mb-4 relative z-10">
                    <div class="text-6xl font-black syne tracking-tighter text-white">${currentXP}</div>
                    <div class="text-xs font-black text-slate-600 uppercase tracking-widest">Total XP</div>
                </div>
                <div class="space-y-3 relative z-10">
                    <div class="flex justify-between items-end">
                        <span class="text-[9px] font-black text-yellow-500 uppercase tracking-[0.2em]">Level ${displayLevel}</span>
                        <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">${xpLeft} XP LEFT</span>
                    </div>
                    <div class="h-2 bg-slate-900 rounded-full overflow-hidden p-[1px] border border-white/5">
                        <div class="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all duration-1000" style="width: ${levelProgress}%"></div>
                    </div>
                </div>
            </div>

            <!-- Lecture Pipeline -->
            <div class="glass-card p-10 rounded-[3.5rem] group border-white/5 relative overflow-hidden">
                <div class="flex justify-between items-start mb-8">
                    <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lecture Pipeline</h4>
                    <i class="fas fa-brain text-slate-700 group-hover:text-blue-500 transition-colors"></i>
                </div>
                <div class="flex items-baseline gap-2 mb-4">
                    <div class="text-6xl font-black syne tracking-tighter text-white">${completedLecs}</div>
                    <div class="text-xl text-slate-800 font-black italic">/ ${totalPossibleLecs}</div>
                </div>
                <p class="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">System tracking ${totalPossibleLecs} tactical linkstreams across ${totalCourses} active modules.</p>
            </div>
        </div>

        <!-- Middle Hub: Wallet & Recent Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
             <!-- Strategic Wallet Hub -->
             <div class="glass-card p-10 rounded-[3.5rem] border-white/5 bg-gradient-to-br from-blue-600/5 to-transparent flex flex-col justify-between group overflow-hidden relative">
                 <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all">
                     <i class="fas fa-wallet text-7xl -rotate-12"></i>
                 </div>
                 <div>
                    <h4 class="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">Neural Wallet</h4>
                    <div class="text-5xl font-black syne tracking-tighter text-white mb-2">₹${(state.user.balance || 0).toLocaleString()}</div>
                    <p class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Available Procurement Funds</p>
                 </div>
                 <button onclick="state.supportTab='topup'; loadPage('profile', 'support')" class="mt-6 w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] shadow-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-95">
                     <i class="fas fa-plus mr-3"></i> Top-up
                 </button>
             </div>

             <!-- Recent Activity Card (Dynamic Hub) -->
             <div id="recent-course-hub" class="lg:col-span-2">
                 <!-- Populated by renderRecentDashboard() -->
                 <div class="glass-card p-10 rounded-[3.5rem] border-white/5 animate-pulse flex items-center justify-center h-full">
                     <p class="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">Awaiting Module Data...</p>
                 </div>
             </div>
        </div>

        <!-- Bottom Intelligence Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="glass-card p-10 rounded-[3.5rem] border-white/5 flex flex-col justify-between group">
                <h4 class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-6">Neural Day Streak</h4>
                <div class="flex items-baseline gap-4 mb-4">
                    <span class="text-6xl font-black syne text-white">${state.user.learningStreak?.current || 0}</span>
                    <i class="fas fa-fire text-3xl text-orange-500 animate-pulse"></i>
                </div>
                <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Sustained Daily Synchronization</div>
            </div>

            <div class="glass-card p-10 rounded-[3.5rem] border-white/5 flex flex-col justify-between group">
                <h4 class="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] mb-6">Active Presence</h4>
                <div class="flex items-baseline gap-3 mb-2">
                    <span class="text-5xl font-black syne text-white">${Math.floor((state.user.totalWatchTime || 0) / 3600)}h</span>
                    <span class="text-4xl font-black syne text-slate-700">${Math.floor(((state.user.totalWatchTime || 0) % 3600) / 60)}m</span>
                </div>
                <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Sync Duration</div>
            </div>

            <div class="glass-card p-10 rounded-[3.5rem] border-white/5 flex flex-col justify-between group bg-gradient-to-tr from-yellow-500/[0.02] to-transparent">
                <div class="flex justify-between items-start">
                    <h4 class="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em] mb-6">Global standing</h4>
                    <i class="fas fa-globe text-yellow-500/20 text-2xl"></i>
                </div>
                <div class="text-5xl font-black syne tracking-tighter text-white mb-2">#5</div>
                <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Neural Grid Ranking</div>
            </div>
        </div>
    `;
    renderRecentDashboard();
}

async function renderRecentDashboard() {
    const hub = document.getElementById('recent-course-hub');
    if (!state.enrolledCourses.length) {
        hub.innerHTML = `
            <div class="h-full glass-card p-12 rounded-[4rem] border-white/5 border-dashed bg-blue-600/[0.02] flex flex-col items-center justify-center text-center group hover:bg-blue-600/[0.04] transition-all duration-700">
                <div class="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <i class="fas fa-plus text-3xl text-blue-500"></i>
                </div>
                <h5 class="text-3xl font-black syne tracking-tighter text-white mb-4 uppercase">Strategic Initialization</h5>
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-10 max-w-sm">No tactical linkstreams detected. Access the Resource Store to authorize new learning modules.</p>
                <button onclick="loadPage('store')" class="px-12 py-5 bg-blue-600 rounded-3xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-blue-600/40 active:scale-95 transition-all">
                    Explore Store Catalog
                </button>
            </div>`;
        return;
    }

    try {
        const res = await fetch(API_BASE_URL + '/api/courses', { headers: { 'Authorization': `Bearer ${token}` } });
        const courses = await res.json();
        const recent = courses.filter(c => state.enrolledIds.includes(String(c._id))).pop();

        if (recent) {
            hub.innerHTML = `
                <div class="h-full glass-card p-12 rounded-[4rem] border-white/5 group hover:bg-white/10 hover:border-blue-500/30 transition-all duration-700 cursor-pointer flex flex-col justify-between relative overflow-hidden" onclick="openPlayer('${recent._id}')">
                    <div class="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all">
                        <i class="fas fa-graduation-cap text-9xl"></i>
                    </div>
                    <div class="flex justify-between items-start mb-6 relative z-10">
                        <div class="flex items-center gap-4">
                            <span class="px-4 py-2 bg-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest">Module Synchronization</span>
                            <span class="text-[9px] font-black text-emerald-500 uppercase tracking-widest blink">Live Link</span>
                        </div>
                        <i class="fas fa-play-circle text-2xl text-slate-700 group-hover:text-blue-500 transition-colors"></i>
                    </div>
                    <div class="relative z-10">
                        <h5 class="text-5xl font-black syne tracking-tighter text-white mb-6 leading-none group-hover:text-blue-400 transition-colors">${recent.title.toUpperCase()}</h5>
                        <div class="flex items-center gap-6">
                            <div class="flex flex-col">
                                <span class="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Category</span>
                                <span class="text-[10px] font-black text-white uppercase tracking-widest">${recent.category}</span>
                            </div>
                            <div class="w-px h-8 bg-white/10"></div>
                            <div class="flex flex-col">
                                <span class="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Decryption Progress</span>
                                <span class="text-[10px] font-black text-white uppercase tracking-widest">SYNC IN PROGRESS</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (e) { }
}

async function fetchRecentCourse() {
    if (state.enrolledCourses.length === 0) {
        document.getElementById('recent-course').innerHTML = `<div class="flex-grow text-center py-6"><p class="text-slate-500 text-sm mb-6 font-bold uppercase tracking-widest">No active modules found.</p><button onclick="loadPage('store')" class="px-10 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20">Browse Catalog</button></div>`;
        return;
    }
    try {
        const res = await fetch(API_BASE_URL + `/api/courses`, { headers: { 'Authorization': `Bearer ${token}` } });
        const courses = await res.json();
        const recent = courses.find(c => state.enrolledCourses.includes(c._id));
        if (recent) {
            document.getElementById('recent-course').innerHTML = `
                <div class="w-20 h-20 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 shadow-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                    <i class="fas fa-graduation-cap text-3xl text-blue-500 group-hover:text-white"></i>
                </div>
                <div class="flex-grow">
                    <div class="font-black text-2xl tracking-tighter leading-tight mb-4">${recent.title.toUpperCase()}</div>
                    <button onclick="openPlayer('${recent._id}')" class="px-8 py-3 bg-blue-600/10 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all">Launch Phase</button>
                </div>
            `;
        }
    } catch (e) { }
}

async function renderEnrolledCatalog(container, type) {
    container.innerHTML = `<div id="course-list" class="grid grid-cols-1 md:grid-cols-2 gap-10"></div>`;
    const list = document.getElementById('course-list');
    try {
        const enrolledIds = (state.user.enrolledCourses || []).map(c => {
            const cid = c.courseId || c;
            return String(cid._id || cid);
        });
        const filtered = state.courses.filter(c => enrolledIds.includes(String(c._id)) && (c.category === type || !type));

        if (filtered.length === 0) {
            list.innerHTML = `<div class="col-span-2 p-24 text-center glass-card rounded-[4rem] border-dashed border-white/5"><p class="text-slate-500 mb-10 font-black text-xs tracking-widest uppercase">No active ${type} modules detected.</p><button onclick="loadPage('store')" class="px-12 py-5 bg-blue-600 rounded-3xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-blue-600/30">Acquire Resources</button></div>`;
            return;
        }
        list.innerHTML = filtered.map(c => `
            <div class="glass-card p-12 rounded-[4rem] hover:border-blue-500/20 transition-all duration-500 group cursor-pointer" onclick="openPlayer('${c._id}')">
                <div class="flex justify-between items-start mb-8">
                    <span class="px-5 py-2 bg-blue-600/10 text-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">${c.category || 'MODULE'} UNIT</span>
                    <i class="fas fa-chevron-right text-slate-800 group-hover:translate-x-2 group-hover:text-blue-500 transition-all"></i>
                </div>
                <h4 class="text-3xl font-black mb-6 syne tracking-tighter leading-none">${c.title.toUpperCase()}</h4>
                <div class="flex items-center gap-4 text-slate-500 text-[10px] font-bold tracking-widest uppercase">
                    <i class="fas fa-database"></i> ENCRYPTED DATA LINK ACTIVE
                </div>
            </div>
        `).join('');
    } catch (e) { list.innerHTML = `<p class="col-span-2 text-center text-red-500">Database offline.</p>`; }
}

async function renderStoreCatalog(container) {
    container.innerHTML = `<div id="course-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"></div>`;
    const list = document.getElementById('course-list');
    try {
        const res = await fetch(API_BASE_URL + '/api/courses', { headers: { 'Authorization': `Bearer ${token}` } });
        const courses = await res.json();
        list.innerHTML = courses.map(c => {
            const courseId = String(c._id);
            const isEnrolled = (state.enrolledIds || []).includes(courseId);
            const displayPrice = c.isFree ? 0 : (c.price || 0);

            return `
                <div class="glass-card rounded-[4rem] overflow-hidden group border border-white/5 hover:border-blue-500/30 transition-all duration-700 hover:-translate-y-2">
                    <div class="h-56 bg-gradient-to-br from-slate-900 to-black relative overflow-hidden">
                        <div class="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-all"></div>
                        <div class="absolute bottom-10 left-10 right-10">
                            <span class="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 inline-block">${c.category}</span>
                            <h4 class="text-3xl font-black syne tracking-tighter leading-none mb-2">${c.title.toUpperCase()}</h4>
                        </div>
                    </div>
                    <div class="p-10 flex justify-between items-center">
                        ${isEnrolled ? `<span class="text-green-500 font-black uppercase text-[10px] tracking-widest"><i class="fas fa-check-circle mr-2"></i> SYNCED</span>` : `<span class="text-3xl font-black syne tracking-tighter">₹${displayPrice.toLocaleString()}</span>`}
                        <button onclick="${isEnrolled ? `openPlayer('${c._id}')` : `promptEnroll('${c._id}', '${c.title}', ${displayPrice})`}" class="px-8 py-4 ${isEnrolled ? 'bg-slate-900 text-slate-400' : 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30'} rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-110 transition-all">
                            ${isEnrolled ? 'Launch' : 'Acquire'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) { list.innerHTML = `<p class="col-span-3 text-center text-red-500 uppercase font-black text-xs tracking-widest">Access Denied: Database Offline</p>`; }
}

async function promptEnroll(id, title, price) {
    console.log(`[Neural Link] Initiating procurement for: ${title} (${id})`);
    showZenithConfirm(
        "Authorize Transaction",
        `Acquire ${title.toUpperCase()} for ₹${price}? This will sync the module to your neural stack.`,
        async () => {
            try {
                ZLoader.show("Syncing Module...");
                const res = await fetch(API_BASE_URL + `/api/courses/${id}/enroll`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                if (res.ok) {
                    await fetchUser();
                    loadPage(state.activePage);
                } else {
                    const d = await res.json();
                    console.error('[SYNC_ERROR]:', d);
                    alert(d.message.toUpperCase());
                }
            } catch (e) {
                console.error('[SYNC_FAILURE]:', e);
                alert('SYNC FAILURE. CONNECTION LOST.');
            } finally {
                ZLoader.hide();
            }
        }
    );
}

function renderHealth(container) {
    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16 animate-in fade-in transition duration-700">
            <div class="glass-card p-12 rounded-[4rem] border-red-500/10">
                <h3 class="syne text-xl font-black mb-8 flex items-center gap-4"><i class="fas fa-fire text-red-500"></i> METABOLIC HUD</h3>
                <div class="text-7xl font-black mb-2 syne tracking-tighter">1,840</div>
                <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">KCAL Remaining</div>
                <button onclick="addCalorie()" class="w-full py-5 bg-red-600 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-red-600/30 active:scale-95 transition-all">Log Intake</button>
            </div>
            <div class="glass-card p-12 rounded-[4rem] border-cyan-500/10 col-span-2">
                <h3 class="syne text-xl font-black mb-10 flex items-center gap-4"><i class="fas fa-heartbeat text-cyan-400"></i> BIOMETRIC STATUS</h3>
                <div class="grid grid-cols-2 gap-16">
                    <div>
                        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Neural Hydration</div>
                        <div class="text-4xl font-black syne tracking-tighter text-cyan-400">2.5L / 4.0L</div>
                        <div class="w-full bg-slate-900 h-1.5 rounded-full mt-4 overflow-hidden"><div class="bg-cyan-500 h-full" style="width: 60%"></div></div>
                    </div>
                    <div>
                        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">REM RECOVERY</div>
                        <div class="text-4xl font-black syne tracking-tighter text-blue-400">7.5 HRS</div>
                        <div class="w-full bg-slate-900 h-1.5 rounded-full mt-4 overflow-hidden"><div class="bg-blue-500 h-full" style="width: 85%"></div></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderProfile(container) {
    container.innerHTML = renderProfileTab();
}

function setProfileTab(tab) { state.profileTab = tab; renderProfile(document.getElementById('app-content')); }

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function renderProfileTab() {
    return `
    <div class="max-w-4xl mx-auto">
        <!-- Tabs -->
        <div class="flex justify-center gap-4 mb-6">
            <button onclick="setProfileTab('identity')" class="px-6 py-2 rounded-full text-[9px] font-black tracking-[0.2em] uppercase transition-all ${state.profileTab === 'identity' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/5 text-slate-500 hover:text-white'}">
                Identity Core
            </button>
            <button onclick="setProfileTab('wallet')" class="px-6 py-2 rounded-full text-[9px] font-black tracking-[0.2em] uppercase transition-all ${state.profileTab === 'wallet' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/5 text-slate-500 hover:text-white'}">
                Neural Wallet
            </button>
            <button onclick="setProfileTab('protocols')" class="px-6 py-2 rounded-full text-[9px] font-black tracking-[0.2em] uppercase transition-all ${state.profileTab === 'protocols' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/5 text-slate-500 hover:text-white'}">
                Protocols
            </button>
            <button onclick="setProfileTab('support')" class="px-6 py-2 rounded-full text-[9px] font-black tracking-[0.2em] uppercase transition-all ${state.profileTab === 'support' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/5 text-slate-500 hover:text-white'}">
                Support
            </button>
        </div>

        <!-- Tab Content -->
        ${state.profileTab === 'identity' ? `
        <div class="glass-card p-8 rounded-[2rem] border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-50"></div>
            
            <div class="flex flex-col md:flex-row gap-8 items-start">
                <div class="w-full md:w-1/3 flex flex-col items-center text-center">
                    <input type="file" id="avatar-input" hidden accept="image/*" onchange="handleAvatarFile(this)">
                    <div class="relative group cursor-pointer inline-block" onclick="document.getElementById('avatar-input').click()">
                        <div class="w-32 h-32 rounded-full border-4 border-blue-500/30 overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.2)] hover:border-blue-500 transition-all bg-black relative">
                            <img id="avatar-preview" src="${state.user.profile?.avatar || 'https://ui-avatars.com/api/?name=' + state.user.username + '&background=0b0c15&color=3b82f6&bold=true'}" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all font-black text-[9px] uppercase tracking-widest text-white backdrop-blur-sm">
                                <i class="fas fa-camera text-xl mb-1 block"></i><br>Update ID
                            </div>
                        </div>
                        <div class="absolute bottom-1 right-1 bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center border-2 border-black text-white text-xs shadow-lg">
                            <i class="fas fa-pencil-alt"></i>
                        </div>
                    </div>
                    
                    <h2 class="text-xl font-black mt-4 syne text-white">${state.user.profile?.personalInfo?.fullName || state.user.username}</h2>
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 mb-4">${state.user.profile?.personalInfo?.jobTitle || 'Operative Level 1'}</p>

                    <div class="flex justify-center gap-3 mb-6">
                        ${state.user.profile?.personalInfo?.github ? `<button onclick="window.open('https://github.com/${state.user.profile.personalInfo.github}', '_blank')" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#333] hover:text-white transition flex items-center justify-center text-slate-400 text-xs"><i class="fab fa-github"></i></button>` : ''}
                        ${state.user.profile?.personalInfo?.linkedin ? `<button onclick="window.open('https://linkedin.com/in/${state.user.profile.personalInfo.linkedin}', '_blank')" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#0077b5] hover:text-white transition flex items-center justify-center text-slate-400 text-xs"><i class="fab fa-linkedin-in"></i></button>` : ''}
                        ${state.user.profile?.personalInfo?.website ? `<button onclick="window.open('${state.user.profile.personalInfo.website}', '_blank')" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500 hover:text-white transition flex items-center justify-center text-slate-400 text-xs"><i class="fas fa-globe"></i></button>` : ''}
                    </div>

                    <div class="w-full text-left">
                        <label class="lbl-zenith">Operative Bio</label>
                        <textarea id="p-bio" class="input-zenith h-20 resize-none text-xs" placeholder="System overview...">${state.user.profile?.bio || ''}</textarea>
                    </div>
                </div>

                <div class="w-full md:w-2/3">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <h5 class="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 border-b border-white/5 pb-2">Personal Data</h5>
                             <div class="space-y-3">
                                <div><label class="lbl-zenith">Full Name</label><input id="p-fullname" type="text" class="input-zenith py-2 text-xs" value="${state.user.profile?.personalInfo?.fullName || ''}"></div>
                                <div><label class="lbl-zenith">Job Title</label><input id="p-title" type="text" class="input-zenith py-2 text-xs" value="${state.user.profile?.personalInfo?.jobTitle || ''}"></div>
                                <div><label class="lbl-zenith">Phone</label><input id="p-phone" type="text" class="input-zenith py-2 text-xs" value="${state.user.profile?.personalInfo?.phone || ''}"></div>
                                <div><label class="lbl-zenith">Location</label><input id="p-city" type="text" class="input-zenith py-2 text-xs" value="${state.user.profile?.personalInfo?.city || ''}"></div>
                             </div>
                        </div>
                        <div>
                             <h5 class="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 border-b border-white/5 pb-2">Digital Matrix</h5>
                             <div class="space-y-3">
                                <div><label class="lbl-zenith">GitHub User</label><input id="p-github" type="text" class="input-zenith py-2 text-xs" value="${state.user.profile?.personalInfo?.github || ''}"></div>
                                <div><label class="lbl-zenith">LinkedIn User</label><input id="p-linkedin" type="text" class="input-zenith py-2 text-xs" value="${state.user.profile?.personalInfo?.linkedin || ''}"></div>
                                <div><label class="lbl-zenith">Website URL</label><input id="p-website" type="text" class="input-zenith py-2 text-xs" value="${state.user.profile?.personalInfo?.website || ''}"></div>
                                <div><label class="lbl-zenith">Skills (CSV)</label><input id="p-skills" type="text" class="input-zenith py-2 text-xs" value="${state.user.profile?.personalInfo?.skills || ''}"></div>
                             </div>
                        </div>
                    </div>
                    <form onsubmit="event.preventDefault(); updateProfile();">
                        <div class="mt-6 space-y-4">
                             <h5 class="text-[9px] font-black text-red-500 uppercase tracking-[0.3em] mb-4 border-b border-white/5 pb-2">Security & Encryption</h5>
                             <div>
                                <label class="lbl-zenith">Current Password</label>
                                <input id="p-current-password" type="password" class="input-zenith py-2 text-xs" placeholder="Required only if changing password...">
                             </div>
                             <div>
                                <label class="lbl-zenith">New Link Key (Password)</label>
                                <input id="p-password" type="password" class="input-zenith py-2 text-xs" placeholder="Enter new password to update...">
                             </div>
                        </div>
                        <div class="mt-8 flex justify-end">
                             <button type="submit" class="px-8 py-3 bg-blue-600 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-blue-600/40 hover:scale-[1.02] transition-all">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        ` : state.profileTab === 'wallet' ? `
        <div class="glass-card p-12 rounded-[3rem] border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-500 text-center">
             <div class="inline-block p-6 rounded-full bg-blue-600/10 text-blue-500 mb-8 border border-blue-500/20"><i class="fas fa-wallet text-4xl"></i></div>
             <h3 class="text-3xl font-black syne text-white mb-2">Neural Wallet</h3>
             <p class="text-xs text-slate-500 font-bold uppercase tracking-widest mb-10">Available Strategic Balance</p>
             <div class="text-8xl font-black syne tracking-tighter text-white glow-text mb-12">₹${(state.user.balance || 0).toLocaleString()}</div>
             <button onclick="setProfileTab('support')" class="px-12 py-5 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl">Add Funds</button>
        </div>
        ` : state.profileTab === 'protocols' ? `
        <div class="glass-card p-12 rounded-[3rem] border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div class="flex items-center justify-between mb-10">
                <div>
                    <h3 class="text-3xl font-black syne text-white uppercase italic tracking-tighter">Active Protocols</h3>
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Manage your skill trajectories</p>
                </div>
             </div>
             <div class="space-y-6">
                ${(state.user.activeCareers || []).length > 0 ?
                state.user.activeCareers.map(career => `
                        <div class="p-8 bg-white/5 border border-white/5 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-blue-500/30 transition-all">
                            <div class="flex items-center gap-6">
                                <div class="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-600 transition-all">
                                    <i class="fas fa-project-diagram text-2xl text-blue-500 group-hover:text-white"></i>
                                </div>
                                <div>
                                    <h4 class="text-xl font-black text-white uppercase tracking-tight mb-1">${career.name || career.title}</h4>
                                    <div class="flex items-center gap-3">
                                        <span class="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-[8px] font-black uppercase tracking-widest">Active Link</span>
                                        <span class="text-[9px] font-bold text-slate-600 uppercase tracking-widest">ID: ${(career._id || career).toString().substring(0, 8)}...</span>
                                    </div>
                                </div>
                            </div>
                            <button onclick="terminateProtocol('${career._id || career}')" class="px-8 py-4 bg-red-600/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95">
                                <i class="fas fa-trash-alt mr-2"></i> Terminate Protocol
                            </button>
                        </div>
                `).join('')
                : `
                <div class="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
                    <i class="fas fa-ghost text-5xl text-slate-800 mb-6"></i>
                    <p class="text-slate-600 font-black uppercase text-[10px] tracking-widest">No active protocols detected in neural stack.</p>
                    <button onclick="loadPage('explore')" class="mt-8 px-10 py-4 bg-blue-600 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">Initialize Protocol</button>
                </div>
                `}
             </div>
        </div>
        ` : state.profileTab === 'support' ? `
        <div class="glass-card p-10 rounded-[3rem] border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <div class="lg:col-span-1 border-r border-white/5 pr-8 space-y-3">
                    <button onclick="setSupportTabInProfile('topup')" class="w-full py-4 px-6 rounded-xl text-left text-[9px] font-black tracking-[0.2em] uppercase transition-all ${state.supportTab === 'topup' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white/5 text-slate-500 hover:text-white'}">
                        <i class="fas fa-coins mr-3"></i> Top-up
                    </button>
                    <button onclick="setSupportTabInProfile('complaint')" class="w-full py-4 px-6 rounded-xl text-left text-[9px] font-black tracking-[0.2em] uppercase transition-all ${state.supportTab === 'complaint' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white/5 text-slate-500 hover:text-white'}">
                        <i class="fas fa-ticket-alt mr-3"></i> Ticket
                    </button>
                    <button onclick="setSupportTabInProfile('history')" class="w-full py-4 px-6 rounded-xl text-left text-[9px] font-black tracking-[0.2em] uppercase transition-all ${state.supportTab === 'history' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white/5 text-slate-500 hover:text-white'}">
                        <i class="fas fa-history mr-3"></i> History
                    </button>
                </div>
                <div class="lg:col-span-3 min-h-[400px]">
                    ${renderSupportTab()}
                </div>
             </div>
        </div>
        ` : ''}
    </div>`;
}
async function updateProfile() {
    const data = {
        bio: document.getElementById('p-bio').value,
        personalInfo: {
            fullName: document.getElementById('p-fullname').value,
            jobTitle: document.getElementById('p-title').value,
            phone: document.getElementById('p-phone').value,
            city: document.getElementById('p-city').value,
            github: document.getElementById('p-github').value,
            linkedin: document.getElementById('p-linkedin').value,
            website: document.getElementById('p-website').value,
            skills: document.getElementById('p-skills').value
        },
        currentPassword: document.getElementById('p-current-password').value ? document.getElementById('p-current-password').value : undefined,
        password: document.getElementById('p-password').value ? document.getElementById('p-password').value : undefined
    };

    try {
        const res = await fetch(API_BASE_URL + '/api/auth/profile', {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token} `, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            state.user = await res.json();
            alert("IDENTITY SYNCHRONIZED.");
            renderProfile(document.getElementById('app-content'));
        }
    } catch (e) { alert("SYNC FAILED."); }
}

function handleAvatarFile(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.size > MAX_FILE_SIZE) {
            alert("FILE TOO LARGE. Maximum size: 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            // Preview
            document.getElementById('avatar-preview').src = e.target.result;
            showZenithConfirm(
                "Update Visual Identity",
                "Do you want to authorize this avatar update for your operative profile?",
                () => {
                    updateAvatar(file);
                }
            );
        }
        reader.readAsDataURL(file);
    }
}

async function updateAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const res = await fetch(API_BASE_URL + '/api/auth/profile', {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token} ` }, // Content-Type is auto-set with FormData
            body: formData
        });
        if (res.ok) {
            state.user = await res.json();
            alert("VISUAL IDENTITY UPDATED.");
            renderProfile(document.getElementById('app-content'));
        } else {
            const d = await res.json();
            alert(d.message || "UPLOAD FAILED");
        }
    } catch (e) { alert("UPLOAD FAILED."); }
}

// --- SYSTEM UTILS & UI HELPERS ---

function showZenithConfirm(title, message, onConfirm) {
    const modal = document.getElementById('zenith-confirm-modal');
    const titleEl = document.getElementById('z-confirm-title');
    const msgEl = document.getElementById('z-confirm-message');
    const proceedBtn = document.getElementById('z-confirm-proceed');
    const cancelBtn = document.getElementById('z-confirm-cancel');

    titleEl.innerText = title.toUpperCase();
    msgEl.innerText = message.toUpperCase();
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const handleConfirm = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        proceedBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
        onConfirm();
    };

    const handleCancel = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        proceedBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
    };

    proceedBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
}

async function terminateProtocol(skillId) {
    showZenithConfirm(
        "Protocol Termination Warning",
        "Abandoning this career will remove it from your active neural stack. You will lose active synchronization but your progress data is preserved. Proceed?",
        async () => {
            ZLoader.show("De-linking Protocol...");
            try {
                const res = await fetch(API_BASE_URL + '/api/explore/careermode/select', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token} `,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ skillId, action: 'remove' })
                });

                if (res.ok) {
                    showToast("PROTOCOL TERMINATED SUCCESSFULLY", "success");
                    await fetchUser();
                    renderProfile(document.getElementById('app-content'));
                } else {
                    const d = await res.json();
                    showToast(d.message || "TERMINATION FAILED", "error");
                }
            } catch (e) {
                showToast("PROTOCOL LINK FAILURE", "error");
            } finally {
                ZLoader.hide();
            }
        }
    );
}


// --- LEADERBOARD & CAREER CONSTELLATION ---

async function renderLeaderboard(container) {
    container.innerHTML = `<div class="p-20 text-center"><p class="text-slate-500 font-bold uppercase tracking-widest animate-pulse">Establishing Global Uplink...</p></div>`;

    try {
        const res = await fetch(API_BASE_URL + '/api/auth/leaderboard');
        const leaders = await res.json();

        container.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            ${leaders.map((l, index) => {
            const isTop3 = index < 3;
            const rankColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-slate-600';
            const borderClass = isTop3 ? 'border-blue-500/30 bg-blue-600/5' : 'border-white/5 bg-white/[0.02]';

            return `
                    <div class="p-6 rounded-3xl border ${borderClass} flex items-center justify-between group hover:bg-white/5 transition-all">
                        <div class="flex items-center gap-6">
                            <div class="w-16 h-16 flex items-center justify-center font-black text-3xl italic syne ${rankColor}">#${index + 1}</div>
                            <div class="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden">
                                <img src="${l.profile?.avatar || `https://ui-avatars.com/api/?name=${l.username}&background=0f172a&color=3b82f6`}" class="w-full h-full object-cover">
                            </div>
                            <div>
                                <div class="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Operative</div>
                                <div class="text-xl font-bold text-white uppercase tracking-tight">${l.username}</div>
                            </div>
                        </div>
                        <div class="text-right">
                             <div class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">XP Earned</div>
                             <div class="text-2xl font-black syne text-white">${l.xp.toLocaleString()}</div>
                        </div>
                    </div>
                    `;
        }).join('')
            }
            </div>
        `;
    } catch (e) {
        container.innerHTML = `<div class="text-center text-red-500 font-black uppercase tracking-widest">Uplink Failed</div>`;
    }
}

function renderSkillConstellation(container) {
    // Career Nodes Data
    const ranks = [
        { id: 'r1', title: 'Initiate', xp: 0, perks: 'Basic Access', icon: 'fa-user-astronaut' },
        { id: 'r2', title: 'Novice', xp: 500, perks: '+5% XP Boost', icon: 'fa-book-reader' },
        { id: 'r3', title: 'Apprentice', xp: 1500, perks: 'Avatar Customization', icon: 'fa-laptop-code' },
        { id: 'r4', title: 'Specialist', xp: 3500, perks: 'Priority Support', icon: 'fa-microchip' },
        { id: 'r5', title: 'Architect', xp: 7000, perks: 'Mentor Badge', icon: 'fa-drafting-compass' },
        { id: 'r6', title: 'Apex Operative', xp: 15000, perks: 'System Override', icon: 'fa-crown' }
    ];

    const currentXP = state.user.xp || 0;

    container.innerHTML = `
        < div class="relative min-h-[800px] overflow-hidden rounded-[4rem] bg-[#020308] border border-white/5" >
            < !--Background Grid-- >
            <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px); background-size: 50px 50px; background-position: center;"></div>
            
            <div class="relative z-10 p-12 h-full flex flex-col items-center justify-center">
                 <h3 class="text-6xl font-black syne italic text-center mb-20 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">CAREER TRAJECTORY</h3>
                 
                 <div class="relative w-full max-w-4xl h-[600px] flex flex-col justify-between items-center">
                    <!-- Vertical Line -->
                    <div class="absolute top-0 bottom-0 left-1/2 w-1 bg-slate-800 -translate-x-1/2 z-0"></div>
                    <div class="absolute top-0 bottom-0 left-1/2 w-1 bg-blue-600 -translate-x-1/2 z-0 transition-all duration-[2s]" style="height: ${Math.min(100, (currentXP / 15000) * 100)}%"></div>

                    ${ranks.map((rank, i) => {
        const isUnlocked = currentXP >= rank.xp;
        const isNext = !isUnlocked && (i === 0 || currentXP >= ranks[i - 1].xp);

        return `
                        <div class="relative z-10 flex items-center w-full ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'} justify-center gap-20 group">
                            <!-- Label Side -->
                            <div class="w-1/3 text-${i % 2 === 0 ? 'left' : 'right'} ${isUnlocked ? 'opacity-100' : 'opacity-30'} transition-all duration-500">
                                <h4 class="text-2xl font-black syne uppercase text-white">${rank.title}</h4>
                                <p class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Target: ${rank.xp} XP</p>
                            </div>

                            <!-- Node -->
                            <div class="w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-[#020308]
                                ${isUnlocked ? 'border-blue-500 text-white shadow-[0_0_50px_rgba(37,99,235,0.6)] scale-110' : 'border-slate-800 text-slate-700 grayscale'}">
                                <i class="fas ${rank.icon}"></i>
                            </div>

                            <!-- Info Side -->
                            <div class="w-1/3 text-${i % 2 === 0 ? 'right' : 'left'} ${isUnlocked ? 'opacity-100' : 'opacity-30'} transition-all duration-500">
                                <div class="inline-block px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-[10px] uppercase tracking-widest text-slate-400">
                                    ${rank.perks}
                                </div>
                            </div>
                        </div>
                        `;
    }).join('')}
                 </div>
            </div>
        </div>
        `;
}

// --- HELP DESK RENDERER ---

function renderHelpDesk(container) {
    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
            <div class="lg:col-span-1 border-r border-white/5 pr-12 h-screen overflow-y-auto custom-scrollbar">
                <div class="space-y-4">
                    <button onclick="setSupportTab('topup')" class="w-full py-5 px-8 rounded-2xl text-left text-[10px] font-black tracking-[0.2em] uppercase transition-all ${state.supportTab === 'topup' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white/5 text-slate-500 hover:text-white'}">
                        <i class="fas fa-coins mr-4"></i> Credit Top-up
                    </button>
                    <button onclick="setSupportTab('complaint')" class="w-full py-5 px-8 rounded-2xl text-left text-[10px] font-black tracking-[0.2em] uppercase transition-all ${state.supportTab === 'complaint' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white/5 text-slate-500 hover:text-white'}">
                        <i class="fas fa-exclamation-triangle mr-4"></i> Support Ticket
                    </button>
                    <button onclick="setSupportTab('history')" class="w-full py-5 px-8 rounded-2xl text-left text-[10px] font-black tracking-[0.2em] uppercase transition-all ${state.supportTab === 'history' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white/5 text-slate-500 hover:text-white'}">
                        <i class="fas fa-history mr-4"></i> Log History
                    </button>
                </div>
            </div>
            <div class="lg:col-span-3"><div class="glass-card p-16 rounded-[4rem] min-h-[600px] border-white/5">${renderSupportTab()}</div></div>
        </div>
        `;
}

function setSupportTab(tab) { state.supportTab = tab; if (state.activePage === 'helpdesk') renderHelpDesk(document.getElementById('app-content')); }
function setSupportTabInProfile(tab) { state.supportTab = tab; renderProfile(document.getElementById('app-content')); }

function renderSupportTab() {
    if (state.supportTab === 'topup') {
        return `
            <div class="animate-in fade-in slide-in-from-right-10 duration-500">
                <h4 class="text-4xl font-black mb-6 syne tracking-tighter uppercase">Credit Sync Request</h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
                    <div class="bg-white/5 p-8 rounded-3xl border border-white/5 text-center">
                        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Scan to Pay</div>
                        ${state.settings.qrCodeUrl ? `<img src="${state.settings.qrCodeUrl}" class="w-48 h-48 mx-auto rounded-xl shadow-2xl mb-4">` : '<div class="w-48 h-48 mx-auto bg-slate-900 rounded-xl flex items-center justify-center text-xs text-slate-500 font-bold mb-4">QR NOT CONFIGURED</div>'}
                        <div class="text-xs font-black text-white bg-blue-600/20 py-2 rounded-lg break-all select-all cursor-pointer hover:bg-blue-600 hover:text-white transition">${state.settings.upiId || 'UPI NOT SET'}</div>
                    </div>
                    <div class="space-y-8">
                         <div>
                            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Sync Amount (₹)</label>
                            <input id="topup-amount" type="number" class="w-full bg-black/40 border border-white/10 p-6 rounded-2xl outline-none font-black text-xl text-blue-500" placeholder="0.00">
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Transaction Ref (UTR)</label>
                            <input id="topup-msg" type="text" class="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none text-xs font-bold" placeholder="Enter 12-digit UTR...">
                        </div>
                        <button onclick="submitRequest('topup')" class="w-full py-6 bg-blue-600 rounded-3xl font-black uppercase text-sm tracking-[0.4em] shadow-2xl shadow-blue-600/40">Authorize Request</button>
                    </div>
                </div>
            </div>`;
    }
    if (state.supportTab === 'complaint') {
        return `
            <div class="animate-in fade-in slide-in-from-right-10 duration-500">
                <h4 class="text-4xl font-black mb-10 syne tracking-tighter uppercase">Neural Support Ticket</h4>
                <div class="space-y-8 max-w-xl">
                    <div>
                        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Subject Hub</label>
                        <input id="ticket-subject" type="text" class="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none text-xs font-bold" placeholder="E.g., Module access issue...">
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Message Transmission</label>
                        <textarea id="ticket-msg" class="w-full bg-black/40 border border-white/10 p-6 rounded-2xl outline-none text-xs font-bold" rows="6" placeholder="Describe the anomaly..."></textarea>
                    </div>
                    <button onclick="submitRequest('complaint')" class="w-full py-6 bg-blue-600 rounded-3xl font-black uppercase text-sm tracking-[0.4em] shadow-2xl shadow-blue-600/40">Transmit Ticket</button>
                </div>
            </div>`;
    }
    fetchMyRequests();
    return `<div id="request-history" class="animate-in fade-in slide-in-from-right-10 duration-500"><p class="text-center text-slate-600 italic py-20 uppercase font-black tracking-widest">Accessing secure logs...</p></div>`;
}

async function submitRequest(type) {
    const data = type === 'topup' ? {
        type: 'topup',
        subject: 'Credit Top-up Request',
        amount: document.getElementById('topup-amount').value,
        message: document.getElementById('topup-msg').value || 'Requested via dashboard.'
    } : {
        type: 'complaint',
        subject: document.getElementById('ticket-subject').value,
        message: document.getElementById('ticket-msg').value
    };

    if (!data.subject || (type === 'topup' && !data.amount)) return alert("INCOMPLETE DATA STREAM.");

    const res = await fetch(API_BASE_URL + '/api/support/request', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token} `, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) {
        alert("TRANSMISSION SUCCESSFUL.");
        setSupportTab('history');
    }
}

async function fetchMyRequests() {
    const res = await fetch(API_BASE_URL + '/api/support/my-requests', { headers: { 'Authorization': `Bearer ${token} ` } });
    const data = await res.json();
    const container = document.getElementById('request-history');
    if (!container) return;

    container.innerHTML = `
        <h4 class="text-4xl font-black mb-10 syne tracking-tighter uppercase">Transmission Logs</h4>
            <div class="space-y-6">
                ${data.map(r => `
                <div class="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex justify-between items-center group">
                    <div>
                        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">${r.type} // ${new Date(r.createdAt).toLocaleDateString()}</div>
                        <h5 class="text-xl font-black tracking-tight uppercase">${r.subject}</h5>
                    </div>
                    <div class="flex items-center gap-6">
                        ${r.amount ? `<span class="text-2xl font-black syne text-blue-500">₹${r.amount}</span>` : ''}
                        <span class="px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] ${r.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : r.status === 'resolved' ? 'bg-green-500/10 text-green-500' : 'bg-red-600/10 text-red-500'}">${r.status}</span>
                    </div>
                </div>
            `).join('') || '<p class="text-center text-slate-700 py-10 uppercase font-black tracking-widest">No previous transmissions detected.</p>'}
            </div>
    `;
}

// --- LMS PLAYER v6.0 ---

// Fix: Delegate to Zenith Player if available
async function openPlayer(courseId) {
    if (window.openCoursePlayer && window.openCoursePlayer.name !== 'openCoursePlayer') {
        // This check is a bit tricky if function names are stripped/minified, 
        // but since zenith-player overrides it, we can just try calling it.
        // Better yet, check if ImmersiveEngine exists.
    }

    if (window.ImmersiveEngine) {
        // Use the new player from zenith-player.js
        if (typeof window.openCoursePlayer === 'function') {
            return window.openCoursePlayer(courseId);
        }
    }

    // Fallback or Error if new player not loaded
    console.error("Zenith Player not loaded");
    alert("System Error: Media Protocol Failed");
}

// Keep this for backward compatibility if needed, but it should be overridden by zenith-player.js
function openCoursePlayer(courseId) {
    return openPlayer(courseId);
}

// [LEGACY MODAL LOGIC REMOVED - USING ZENITH PLAYER]

// Assuming renderLeaderboard is defined elsewhere or will be added.
// async function renderLeaderboard(container) {
//     // ... existing leaderboard code ...
// }


async function launchProPlayer(lecId, unitId) {
    const course = window.activeCourseContent;
    const unit = course.units.find(u => u._id === unitId);
    const lecture = unit.lectures.find(l => l._id === lecId);

    // Switch to Full Video Player View (Separate Logic)
    const content = `
        < div class="h-screen flex flex-col bg-[#050505] overflow-hidden" >
            < !--Player Nav-- >
            <div class="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md z-40">
                <div class="flex items-center gap-6">
                    <button onclick="renderCourseCurriculum()" class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition"><i class="fas fa-chevron-left text-slate-400"></i></button>
                    <div>
                        <div class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Link</div>
                        <div class="text-xs font-bold text-white uppercase tracking-tight">${course.title}</div>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                     <button id="mark-complete-btn-player" onclick="toggleLectureComplete('${lecture._id}', '${course._id}')" class="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${state.user.courseProgress?.find(p => p.courseId === course._id)?.completedLectures.includes(lecture._id) ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-blue-600 text-white hover:bg-blue-500'}">
                        ${state.user.courseProgress?.find(p => p.courseId === course._id)?.completedLectures.includes(lecture._id) ? '<i class="fas fa-check mr-2"></i> Synced' : 'Mark Complete'}
                     </button>
                </div>
            </div>

            <!--Main Stage-- >
        <div class="flex-grow flex overflow-hidden">
            <!-- Video Stage -->
            <div class="flex-grow bg-black relative flex flex-col">
                <div class="flex-grow relative">
                    ${renderMediaAsset(lecture)}
                </div>
                <div class="h-24 border-t border-white/5 p-6 flex items-center justify-between bg-[#080808]">
                    <div>
                        <h2 class="text-xl font-black text-white uppercase tracking-tight mb-1">${lecture.title}</h2>
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phase: ${unit.title}</p>
                    </div>
                    <div class="flex gap-4">
                        <!-- Additional controls if needed -->
                    </div>
                </div>
            </div>

            <!-- Live Interface Sidebar (Discussion) -->
            <div class="w-96 border-l border-white/5 bg-[#020202] flex flex-col">
                <div class="p-6 border-b border-white/5">
                    <div class="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">Live Nexus</div>
                </div>

                <div id="comment-feed" class="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
                    <!-- Dynamic Comments -->
                </div>

                <div class="p-6 border-t border-white/5 bg-[#050505]">
                    <div class="relative">
                        <input id="comment-input" type="text" placeholder="Data uplink..." class="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500 text-xs font-bold text-white">
                            <button onclick="postComment('${lecture._id}')" class="absolute right-2 top-2 p-2 text-blue-500 hover:text-white transition"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
        </div>
        </div >
        `;

    ImmersiveEngine.open(content);
    renderComments(lecture._id);
    startTelemetry(course._id);
}

function renderMediaAsset(lec) {
    if (lec.videoUrl) {
        let src = lec.videoUrl;
        if (src.includes('youtube.com') || src.includes('youtu.be')) {
            const id = src.split('v=')[1] || src.split('/').pop();
            src = `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1`;
        }
        return `<iframe id="main-video" class="w-full h-full border-none" src="${src}" allowfullscreen allow="autoplay"></iframe>`;
    }
    if (lec.documentUrl) return `<iframe class="w-full h-full bg-white border-none" src="${lec.documentUrl}"></iframe>`;
    return `<div class="flex items-center justify-center h-full p-20 text-slate-500 font-bold italic">${lec.content || 'LINK STREAM EMPTY.'}</div>`;
}

async function renderComments(lecId) {
    const feed = document.getElementById('comment-feed');
    try {
        const res = await fetch(API_BASE_URL + `/api/courses/lectures/${lecId}/comments`, { headers: { 'Authorization': `Bearer ${token}` } });
        const comments = await res.json();

        if (!comments.length) {
            feed.innerHTML = `<p class="text-center py-10 text-slate-800 font-bold uppercase tracking-widest text-[9px]">Discussion nexus is clear. Awaiting first transmission.</p>`;
            return;
        }

        feed.innerHTML = comments.map(c => `
            <div class="flex gap-6 group animate-in slide-in-from-left-4 duration-500">
                <div class="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center font-bold text-slate-500">${c.user.username[0].toUpperCase()}</div>
                <div class="flex-grow space-y-2">
                    <div class="flex items-center gap-4">
                        <span class="text-[10px] font-black text-blue-500 uppercase tracking-widest">${c.user.username}</span>
                        <span class="text-[9px] font-bold text-slate-700 uppercase tracking-tighter">${new Date(c.createdAt).toLocaleDateString()}</span>
                        ${c.user._id === state.user._id ? `
                            <div class="opacity-0 group-hover:opacity-100 transition flex gap-3 ml-auto">
                                <button onclick="deleteComment('${c._id}', '${lecId}')" class="text-red-500 hover:text-red-400"><i class="fas fa-trash"></i></button>
                            </div>
                        ` : ''}
                    </div>
                    <p class="text-sm font-bold text-slate-300 tracking-tight leading-relaxed">${c.text}</p>
                </div>
            </div>
        `).join('');
    } catch (e) { }
}

async function postComment(lecId) {
    const input = document.getElementById('comment-input');
    if (!input.value.trim()) return;
    try {
        const res = await fetch(API_BASE_URL + `/api/courses/lectures/${lecId}/comments`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: input.value })
        });
        if (res.ok) {
            input.value = '';
            renderComments(lecId);
        }
    } catch (e) { }
}

async function deleteComment(id, lecId) {
    showZenithConfirm(
        "Purge Transmission",
        "Are you sure you want to permanently delete this comment from the neural nexus?",
        async () => {
            try {
                await fetch(API_BASE_URL + `/api/courses/comments/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                renderComments(lecId);
            } catch (e) { }
        }
    );
}

async function toggleLectureComplete(lecId, courseId) {
    // Optimistic Update
    const progressEntry = state.user.courseProgress.find(p => p.courseId === courseId);
    let isNowComplete = false;

    if (progressEntry) {
        if (progressEntry.completedLectures.includes(lecId)) {
            progressEntry.completedLectures = progressEntry.completedLectures.filter(id => id !== lecId);
            isNowComplete = false;
        } else {
            progressEntry.completedLectures.push(lecId);
            isNowComplete = true;
        }
    }

    // Update UI Wrapper
    const btn = document.getElementById('mark-complete-btn-player');
    if (btn) {
        btn.innerHTML = isNowComplete ? '<i class="fas fa-check mr-2"></i> Synced' : 'Mark Complete';
        btn.className = `px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isNowComplete ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-blue-600 text-white hover:bg-blue-500'}`;
    }

    try {
        const res = await fetch(API_BASE_URL + `/api/courses/${courseId}/progress/mark-complete`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ lectureId: lecId, completed: isNowComplete })
        });

        // Background sync user to be safe
        fetchUser();
    } catch (e) { console.error(e); }
}

// Telemetry Engine
let telemetryInterval = null;
function startTelemetry(courseId) {
    if (telemetryInterval) clearInterval(telemetryInterval);
    telemetryInterval = setInterval(() => {
        pendingWatchTime++;
    }, 1000); // Pulse every 1s for precision recording

    // Background Sync every 30s
    if (telemetrySyncInterval) clearInterval(telemetrySyncInterval);
    telemetrySyncInterval = setInterval(async () => {
        if (state.activePage !== 'dashboard' && document.getElementById('modal-container').style.display === 'none') {
            clearInterval(telemetrySyncInterval);
            return;
        }
        if (pendingWatchTime <= 0) return;

        try {
            const localSecs = pendingWatchTime;
            pendingWatchTime = 0; // Reset local counter
            await fetch(API_BASE_URL + `/api/courses/${courseId}/telemetry/sync`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ seconds: localSecs })
            });
        } catch (e) { }
    }, 30000);
}

let pendingWatchTime = 0;
let telemetrySyncInterval = null;

function closeModal() {
    document.getElementById('modal-container').style.display = 'none';
    if (telemetryInterval) clearInterval(telemetryInterval);
}

// --- MISSION CONTROL & DRAG DROP ---
let selectedPriority = 'medium';
let draggedTaskId = null;

async function renderMissionControl(container) {
    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)] pb-4">
            <!-- PENDING -->
            <div class="glass-card p-0 rounded-[2rem] border-white/5 flex flex-col overflow-hidden bg-black/20">
                <div class="p-6 pb-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full bg-slate-500"></div>
                        <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pending</h4>
                    </div>
                    <span class="bg-white/5 text-slate-400 px-2 py-1 rounded text-[9px] font-bold" id="count-pending">0</span>
                </div>
                <div id="col-pending" ondragover="handleDragOver(event)" ondrop="handleDrop(event, 'pending')" 
                    class="flex-grow p-4 space-y-3 overflow-y-auto custom-scrollbar transition-colors duration-300"></div>
                <div class="p-4 pt-0">
                     <button onclick="openMissionModal()" class="w-full py-3 border border-dashed border-slate-700/50 rounded-xl text-slate-500 text-[9px] font-black uppercase tracking-widest hover:border-slate-500 hover:text-slate-300 hover:bg-white/5 transition">+ Assign</button>
                </div>
            </div>
            
            <!-- ACTIVE -->
            <div class="glass-card p-0 rounded-[2rem] border-white/5 flex flex-col overflow-hidden bg-black/20 relative">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600"></div>
                 <div class="p-6 pb-4 border-b border-white/5 flex justify-between items-center bg-blue-600/5">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <h4 class="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Ops</h4>
                    </div>
                    <span class="bg-blue-600/10 text-blue-400 px-2 py-1 rounded text-[9px] font-bold" id="count-active">0</span>
                </div>
                <div id="col-active" ondragover="handleDragOver(event)" ondrop="handleDrop(event, 'active')" 
                    class="flex-grow p-4 space-y-3 overflow-y-auto custom-scrollbar bg-blue-600/5 transition-colors duration-300"></div>
            </div>

            <!-- COMPLETE -->
            <div class="glass-card p-0 rounded-[2rem] border-white/5 flex flex-col overflow-hidden bg-black/20">
                 <div class="p-6 pb-4 border-b border-white/5 flex justify-between items-center bg-green-600/5">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full bg-green-500"></div>
                        <h4 class="text-[10px] font-black text-green-400 uppercase tracking-widest">Complete</h4>
                    </div>
                    <span class="bg-green-600/10 text-green-400 px-2 py-1 rounded text-[9px] font-bold" id="count-complete">0</span>
                </div>
                <div id="col-complete" ondragover="handleDragOver(event)" ondrop="handleDrop(event, 'complete')" 
                    class="flex-grow p-4 space-y-3 overflow-y-auto custom-scrollbar transition-colors duration-300"></div>
            </div>
        </div>
    `;

    try {
        const res = await fetch(API_BASE_URL + '/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } });
        const tasks = await res.json();

        const cols = {
            pending: document.getElementById('col-pending'),
            active: document.getElementById('col-active'),
            complete: document.getElementById('col-complete')
        };

        let countVals = { pending: 0, active: 0, complete: 0 };

        tasks.forEach(task => {
            if (cols[task.status]) {
                countVals[task.status]++;
                cols[task.status].innerHTML += createTaskCard(task);
            }
        });

        document.getElementById('count-pending').innerText = countVals.pending;
        document.getElementById('count-active').innerText = countVals.active;
        document.getElementById('count-complete').innerText = countVals.complete;

    } catch (e) { showToast("MISSION SYNC FAILED", "error"); }
}

function createTaskCard(task) {
    const priorityColors = {
        low: 'text-slate-500 border-white/5',
        medium: 'text-blue-400 border-blue-500/20 bg-blue-500/10',
        high: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
        critical: 'text-red-500 border-red-500/20 bg-red-500/10'
    };

    return `
    <div id="${task._id}" draggable="true" ondragstart="handleDragStart(event, '${task._id}')" 
         class="p-5 bg-[#0a101d] rounded-2xl border border-white/5 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/10 transition-all cursor-move group relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full ${task.priority === 'high' ? 'bg-red-500' : (task.priority === 'medium' ? 'bg-blue-500' : 'bg-slate-700')}"></div>
        
        <div class="flex justify-between items-start mb-3 pl-3">
            <span class="text-[9px] font-black px-2 py-1 rounded ${priorityColors[task.priority] || priorityColors.medium} uppercase tracking-wider">${task.priority}</span>
            <button onclick="deleteTask('${task._id}')" class="text-slate-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><i class="fas fa-trash text-xs"></i></button>
        </div>
        
        <h5 class="text-sm font-bold text-white mb-2 pl-3 leading-snug">${task.title}</h5>
        
        <div class="flex justify-between items-center mt-4 pl-3 border-t border-white/5 pt-3">
             <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <i class="fas fa-coins text-yellow-500/50"></i> +${task.xpReward} XP
             </div>
             ${task.status === 'active' ? '<div class="flex items-center gap-1 text-[8px] font-black text-blue-500 uppercase tracking-widest"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Live</div>' : ''}
             ${task.status === 'complete' ? '<i class="fas fa-check-circle text-green-500 text-sm"></i>' : ''}
        </div>
    </div>
    `;
}

// Drag & Drop Handlers
function handleDragStart(e, id) {
    draggedTaskId = id;
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
    // Small delay to keep element visible during drag start
    setTimeout(() => e.target.classList.add('invisible'), 0);
}

function handleDragEnd(e) {
    e.target.style.opacity = '1';
    e.target.classList.remove('invisible');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const col = e.currentTarget;
    col.classList.add('bg-white/5'); // Highlight zone
}

// Reset highlights on drag leave/drop would be good, but simple logic for now
function clearHighlights() {
    ['col-pending', 'col-active', 'col-complete'].forEach(id => {
        document.getElementById(id).classList.remove('bg-white/5');
    });
}

async function handleDrop(e, status) {
    e.preventDefault();
    clearHighlights();

    // Find Element
    const card = document.getElementById(draggedTaskId);
    if (!card) return;

    // Remove visibility hack
    card.classList.remove('invisible');
    card.style.opacity = '1';

    // Optimistic UI Update
    e.currentTarget.appendChild(card); // Move DOM element immediately

    // Update Backend
    try {
        await fetch(API_BASE_URL + `/api/tasks/${draggedTaskId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        // Refresh to sync counts/styles (optional, can be smoother)
        renderMissionControl(document.getElementById('app-content'));

        if (status === 'complete') showToast("MISSION COMPLETE +50 XP", "success");
    } catch (e) {
        showToast("MOVE FAILED", "error");
        renderMissionControl(document.getElementById('app-content')); // Revert on fail
    }
}

// Modal Functions
function openMissionModal() {
    document.getElementById('mission-modal').style.display = 'flex';
    document.getElementById('m-title').focus();
}

function closeMissionModal() {
    document.getElementById('mission-modal').style.display = 'none';
}

function setPriority(p) {
    selectedPriority = p;
    // Reset styles
    ['low', 'medium', 'high'].forEach(l => {
        const btn = document.getElementById(`btn-${l}`);
        btn.classList.remove('border-2', 'border-blue-500', 'bg-blue-600/10', 'text-white', 'shadow-[0_0_15px_rgba(37,99,235,0.3)]');
        btn.classList.add('border-white/5', 'bg-black/40', 'text-slate-400');
    });

    // Set Active
    const btn = document.getElementById(`btn-${p}`);
    btn.classList.remove('border-white/5', 'bg-black/40', 'text-slate-400');
    btn.classList.add('border-2', 'border-blue-500', 'bg-blue-600/10', 'text-white', 'shadow-[0_0_15px_rgba(37,99,235,0.3)]');
}

async function submitNewMission() {
    const title = document.getElementById('m-title').value;
    if (!title) return showToast("OBJECTIVE REQUIRED", "error");

    try {
        const res = await fetch(API_BASE_URL + '/api/tasks', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, priority: selectedPriority, xpReward: 50 })
        });

        if (res.ok) {
            closeMissionModal();
            document.getElementById('m-title').value = '';
            renderMissionControl(document.getElementById('app-content'));
            showToast("OPERATION INITIALIZED", "success");

        }
    } catch (e) { showToast("INIT FAILED", "error"); }
}

async function deleteTask(id) {
    showZenithConfirm(
        "Abort Mission",
        "Are you sure you want to terminate this mission? All current progress on this tactical objective will be lost.",
        async () => {
            try {
                const res = await fetch(API_BASE_URL + `/ api / tasks / ${id} `, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token} ` }
                });
                if (res.ok) {
                    showToast("MISSION ABORTED", "success");
                    renderMissionControl(document.getElementById('app-content'));
                }
            } catch (e) { showToast("UPLINK FAILURE", "error"); }
        }
    );
}

init();

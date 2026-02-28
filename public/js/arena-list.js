// public/js/arena-list.js

let allProblems = [];
let currentFilter = {
    list: 'all', // all, saved, solved, unsolved
    diff: null,  // Easy, Medium, Hard
    tag: ''
};

document.addEventListener('DOMContentLoaded', () => {
    fetchProblems();
});

async function loadUserProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            if (!data) return;

            // Sync Specialized DSA Profile
            if (document.getElementById('dsa-profile-username')) document.getElementById('dsa-profile-username').innerText = data.username || 'Operative';
            if (document.getElementById('dsa-profile-xp')) document.getElementById('dsa-profile-xp').innerText = data.xp || 0;

            if (data.avatarUrl) {
                const pImg = document.getElementById('dsa-profile-avatar');
                const pIcon = document.getElementById('dsa-profile-avatar-icon');
                if (pImg) {
                    pImg.src = data.avatarUrl;
                    pImg.classList.remove('hidden');
                }
                if (pIcon) pIcon.classList.add('hidden');
            }

            // Sync Header & Other Stats
            const streakCount = data.dsaStreak?.current || 0;
            if (document.getElementById('header-streak')) document.getElementById('header-streak').innerText = streakCount;
            if (document.getElementById('streak-big')) document.getElementById('streak-big').innerText = streakCount;
            if (document.getElementById('header-xp')) document.getElementById('header-xp').innerText = `${data.xp || 0} XP`;

            if (data.avatarUrl) {
                const img = document.getElementById('header-avatar');
                const icon = document.getElementById('header-avatar-icon');
                if (img) {
                    img.src = data.avatarUrl;
                    img.classList.remove('hidden');
                }
                if (icon) if (icon.classList) icon.classList.add('hidden');
            }

            // Sync Stats Table
            const solvedIds = new Set((data.dsaSolved || []).map(id => id.toString()));
            const savedIds = new Set((data.savedProblems || []).map(id => id.toString()));

            // Mark allProblems with saved/solved status
            allProblems.forEach(p => {
                const pid = p._id.toString();
                p.isSolved = solvedIds.has(pid);
                p.isSaved = savedIds.has(pid);
            });

            const easySolved = allProblems.filter(p => p.difficulty === 'Easy' && solvedIds.has(p._id.toString())).length;
            const mediumSolved = allProblems.filter(p => p.difficulty === 'Medium' && solvedIds.has(p._id.toString())).length;
            const hardSolved = allProblems.filter(p => p.difficulty === 'Hard' && solvedIds.has(p._id.toString())).length;

            const easyTotal = allProblems.filter(p => p.difficulty === 'Easy').length;
            const mediumTotal = allProblems.filter(p => p.difficulty === 'Medium').length;
            const hardTotal = allProblems.filter(p => p.difficulty === 'Hard').length;

            if (document.getElementById('stat-easy')) document.getElementById('stat-easy').innerText = easySolved;
            if (document.getElementById('stat-medium')) document.getElementById('stat-medium').innerText = mediumSolved;
            if (document.getElementById('stat-hard')) document.getElementById('stat-hard').innerText = hardSolved;

            if (document.getElementById('header-solved-count')) document.getElementById('header-solved-count').innerText = solvedIds.size;
            if (document.getElementById('header-total-count')) document.getElementById('header-total-count').innerText = allProblems.length;

            // Labels
            if (document.getElementById('total-solved-num')) document.getElementById('total-solved-num').innerText = solvedIds.size;
            if (document.getElementById('total-avail-num')) document.getElementById('total-avail-num').innerText = `of ${allProblems.length}`;
            if (document.getElementById('solved-count-label')) document.getElementById('solved-count-label').innerText = solvedIds.size;
            if (document.getElementById('total-count-label')) document.getElementById('total-count-label').innerText = allProblems.length;

            // Update Progress Rings
            if (easyTotal > 0) updateRing('ring-easy', (easySolved / easyTotal) * 100);
            if (mediumTotal > 0) updateRing('ring-medium', (mediumSolved / mediumTotal) * 100);
            if (hardTotal > 0) updateRing('ring-hard', (hardSolved / hardTotal) * 100);

            if (allProblems.length > 0) {
                const totalBar = document.getElementById('total-bar');
                if (totalBar) totalBar.style.width = `${(solvedIds.size / allProblems.length) * 100}%`;
            }

            // Render Activity Calendar & Sidebar
            renderCalendar(data.dsaActivity || []);
            renderSavedProblemsSidebar();
            applyFilters();
        }
    } catch (e) {
        console.error("Failed to load user profile:", e);
    }
}

function renderCalendar(activity) {
    const calendar = document.getElementById('activity-calendar');
    const monthLabel = document.getElementById('current-month-label');
    if (!calendar) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (monthLabel) monthLabel.innerText = `${monthNames[month]} ${year}`;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const activityMap = {};
    if (activity && Array.isArray(activity)) {
        activity.forEach(a => {
            if (!a.date) return;
            // Normalize incoming dates (handle both 2026-03-01 and 2026-3-1)
            const parts = String(a.date).split('-');
            if (parts.length === 3) {
                const normalized = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                activityMap[normalized] = (activityMap[normalized] || 0) + a.count;
            }
        });
    }

    calendar.innerHTML = '';
    for (let i = 1; i <= daysInMonth; i++) {
        const d = String(i).padStart(2, '0');
        const m = String(month + 1).padStart(2, '0');
        const dateKey = `${year}-${m}-${d}`;
        const count = activityMap[dateKey] || 0;

        let colorClass = 'bg-zinc-900';
        if (count > 0 && count <= 2) colorClass = 'bg-emerald-900/60';
        else if (count >= 3 && count <= 4) colorClass = 'bg-emerald-800/80';
        else if (count >= 5 && count <= 7) colorClass = 'bg-emerald-700';
        else if (count >= 8 && count <= 10) colorClass = 'bg-emerald-500';
        else if (count > 10) colorClass = 'bg-emerald-400 shadow-[0_0_8px_#34d399]';

        const day = document.createElement('div');
        day.className = `w-full pt-[100%] rounded-[2px] ${colorClass} transition-all hover:scale-125 hover:z-10 cursor-help relative group border border-white/[0.02]`;
        day.title = `${i} ${monthNames[month]}: ${count} problems solved`;

        day.innerHTML = `<div class="absolute inset-0 flex items-center justify-center text-[7px] font-black text-white/5 group-hover:text-white/40 transition">${i}</div>`;

        calendar.appendChild(day);
    }
}

function updateRing(id, percent) {
    const ring = document.getElementById(id);
    if (!ring) return;
    const color = id === 'ring-easy' ? '#10b981' : id === 'ring-medium' ? '#f59e0b' : '#ef4444';
    ring.style.background = `conic-gradient(${color} ${percent}%, #1f2937 0%)`;
}

async function fetchDailyProblem() {
    const promoRow = document.getElementById('promo-row');
    if (!promoRow) return;

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/problems/daily', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const problem = await res.json();
            promoRow.innerHTML = `
                <div class="promo-card flex-1 bg-[#050505] border border-white/[0.03] overflow-hidden p-0 h-[180px] relative group cursor-pointer hover:border-emerald-500/20 transition-all rounded-2xl">
                    <img src="https://i.ibb.co/nsRtbHyD/Chat-GPT-Image-Mar-1-2026-01-49-29-AM-1.png" class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105">
                </div>
                <div class="promo-card flex-1 bg-[#050505] border border-white/[0.03] overflow-hidden p-0 h-[180px] relative group cursor-pointer hover:border-emerald-500/20 transition-all rounded-2xl">
                    <img src="https://i.ibb.co/t7MRHrX/Chat-GPT-Image-Mar-1-2026-01-56-24-AM-2.png" class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105">
                </div>
            `;
        }
    } catch (err) {
        console.error("Daily protocol sync failed:", err);
    }
}

async function fetchLeaderboard() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/user/leaderboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const leaders = await res.json();
            const previewRow = document.getElementById('leaderboard-preview-row');
            if (previewRow) {
                previewRow.innerHTML = leaders.slice(0, 5).map(u => `
                <div class="w-6 h-6 rounded-full border border-black overflow-hidden bg-zinc-800" title="${u.username} - ${u.xp} XP">
                    ${u.avatar ? `<img src="${u.avatar}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-[7px] font-bold text-white uppercase">${u.username.charAt(0)}</div>`}
                </div>
                `).join('') + (leaders.length > 5 ? `<div class="w-6 h-6 rounded-full bg-zinc-900 border border-black flex items-center justify-center text-[7px] font-bold text-zinc-500">+${leaders.length - 5}</div>` : '');
            }
        }
    } catch (err) {
        console.error("Leaderboard protocol sync failed:", err);
    }
}

async function fetchProblems() {
    const tbody = document.getElementById('problem-table-body');
    if (!tbody) return;
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/problems', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to load problems");

        allProblems = await res.json();

        // Finalize analytical workspace initialization
        await fetchDailyProblem();
        await fetchLeaderboard();

        applyFilters();
        renderSavedProblemsSidebar();
        loadUserProfile();
        renderTags();

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `
                <tr><td colspan="5" class="py-12 text-center text-red-500 font-bold uppercase tracking-widest text-xs">
                    <i class="fas fa-exclamation-triangle mb-2 text-2xl"></i><br>Failed to synchronize matrix
                </td></tr>
                    `;
    }
}

function renderTags() {
    const tagBar = document.getElementById('tag-filter-bar');
    if (!tagBar) return;

    const tags = [
        'All Topics', 'Array', 'BFS', 'Backtracking', 'Binary Search', 'DFS', 'Divide and Conquer',
        'Dynamic Programming', 'Hash Table', 'Heap', 'Linked List', 'Math', 'Matrix',
        'Prefix Sum', 'Sliding Window', 'Stack', 'String', 'Tree', 'Two Pointers', 'Union Find'
    ];

    tagBar.innerHTML = tags.map(tag => {
        const filterTag = tag === 'All Topics' ? '' : tag;
        const isActive = currentFilter.tag === filterTag;
        return `<button class="tag-chip ${isActive ? 'active' : ''}" onclick="filterByTag('${filterTag}', this)">${tag}</button>`;
    }).join('');
}

window.filterByTag = function (tag, btn) {
    currentFilter.tag = tag;
    document.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
}

window.filterByDiff = function (diff, event) {
    if (event) event.preventDefault();
    currentFilter.diff = currentFilter.diff === diff ? null : diff;

    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    if (currentFilter.diff) {
        const sbEl = document.getElementById(`sb-${diff.toLowerCase()}`);
        if (sbEl) sbEl.classList.add('active');
    } else {
        const allEl = document.getElementById('sb-all');
        if (allEl) allEl.classList.add('active');
    }
    applyFilters();
}

window.filterByList = function (list, event) {
    if (event) event.preventDefault();
    currentFilter.list = list;
    currentFilter.diff = null; // reset diff filter when changing lists
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    const sbEl = document.getElementById(`sb-${list}`);
    if (sbEl) sbEl.classList.add('active');
    applyFilters();
}

window.applyFilters = function () {
    const q = document.getElementById('search-input')?.value.toLowerCase() || '';

    let filtered = allProblems.filter(p => {
        // Search
        const matchesSearch = p.title.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesSearch) return false;

        // Difficulty
        if (currentFilter.diff && p.difficulty !== currentFilter.diff) return false;

        // Tag
        if (currentFilter.tag && !p.tags.includes(currentFilter.tag)) return false;

        // List status
        if (currentFilter.list === 'saved' && !p.isSaved) return false;
        if (currentFilter.list === 'solved' && !p.isSolved) return false;
        if (currentFilter.list === 'unsolved' && p.isSolved) return false;

        return true;
    });

    renderProblems(filtered);
}

function renderProblems(problems) {
    const tbody = document.getElementById('problem-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (problems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-12 text-center text-zinc-500 text-xs uppercase tracking-widest font-mono">No neural match found.</td></tr>`;
        return;
    }

    problems.forEach(p => {
        let diffColor = 'text-emerald-500';
        if (p.difficulty === 'Medium') diffColor = 'text-amber-500';
        else if (p.difficulty === 'Hard') diffColor = 'text-red-500';

        const statusHtml = p.isSolved
            ? `<i class="fas fa-check-circle text-emerald-500 text-sm"></i>`
            : `<i class="far fa-circle text-zinc-700 text-sm"></i>`;

        const starHtml = p.isSaved
            ? `<i class="fas fa-star text-amber-500"></i>`
            : `<i class="far fa-star text-zinc-600 hover:text-amber-500 transition"></i>`;

        const tr = document.createElement('tr');
        tr.className = "problem-row";
        tr.onclick = (e) => {
            if (e.target.closest('.bookmark-btn')) return;
            window.location.href = `/arena-solver.html?id=${p._id}`;
        };

        tr.innerHTML = `
            <td class="text-center">${statusHtml}</td>
            <td class="font-bold text-zinc-200 group-hover:text-emerald-400 transition">${p.title}</td>
            <td class="${diffColor} font-bold text-[11px] uppercase tracking-wider">${p.difficulty}</td>
            <td>
                <div class="flex flex-wrap gap-1">
                    ${p.tags.slice(0, 2).map(t => `<span class="px-2 py-0.5 bg-zinc-800 text-[9px] rounded text-zinc-400 border border-zinc-700">${t}</span>`).join('')}
                    ${p.tags.length > 2 ? `<span class="px-2 py-0.5 bg-zinc-800 text-[9px] rounded text-zinc-500 border border-zinc-700">+${p.tags.length - 2}</span>` : ''}
                </div>
            </td>
            <td class="text-right bookmark-btn" onclick="toggleBookmark('${p._id}', event)">
                ${starHtml}
            </td>
            `;
        tbody.appendChild(tr);
    });
}

function renderSavedProblemsSidebar() {
    const savedList = document.getElementById('saved-list');
    if (!savedList) return;

    const saved = allProblems.filter(p => p.isSaved);

    if (saved.length === 0) {
        savedList.innerHTML = `<p class="text-[12px] text-zinc-600 text-center py-4">Star problems to add here</p>`;
        return;
    }

    savedList.innerHTML = saved.map(p => `
        <div class="p-3 bg-zinc-900/50 hover:bg-zinc-800 rounded-lg border border-zinc-800 cursor-pointer transition flex items-center justify-between group" onclick="window.location.href='/arena-solver.html?id=${p._id}'">
            <div class="truncate pr-2">
                <div class="text-[12px] font-bold text-zinc-300 group-hover:text-amber-400 transition truncate">${p.title}</div>
                <div class="text-[9px] text-zinc-600 mt-1 uppercase tracking-widest">${p.difficulty}</div>
            </div>
            <i class="fas fa-chevron-right text-[10px] text-zinc-700 group-hover:text-amber-400 transition"></i>
        </div>
    `).join('');
}

window.toggleBookmark = async function (problemId, event) {
    if (event) event.stopPropagation();
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/problems/${problemId}/bookmark`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            const target = allProblems.find(p => p._id === problemId);
            if (target) {
                target.isSaved = data.isSaved;
                applyFilters();
                renderSavedProblemsSidebar();
            }
        }
    } catch (e) {
        console.error("Failed to toggle bookmark", e);
    }
}

// Seed demo
window.seedDummyProblem = async function () {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/problems/seed', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            fetchProblems();
            alert("20 Neural Challenges injected into the matrix.");
        }
    } catch (e) {
        console.error(e);
    }
}

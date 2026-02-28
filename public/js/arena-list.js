// public/js/arena-list.js

let allProblems = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchProblems();
    loadUserProfile();
});

async function loadUserProfile() {
    try {
        const token = localStorage.getItem('zenith_token');
        if (!token) return;

        const res = await fetch('/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();

            // Header Stats
            const streakEl = document.getElementById('header-streak');
            if (streakEl) streakEl.innerText = data.dsaStreak?.current || 0;

            if (data.avatarUrl) {
                const img = document.getElementById('header-avatar');
                const icon = document.getElementById('header-avatar-icon');
                if (img) {
                    img.src = data.avatarUrl;
                    img.classList.remove('hidden');
                }
                if (icon) icon.classList.add('hidden');
            }

            // Dashboard Stats
            const solvedCount = data.dsaSolved?.length || 0;
            const solvedEl = document.getElementById('stat-solved');
            if (solvedEl) {
                solvedEl.innerText = solvedCount;

                // Update ring visual hack
                const ring = document.getElementById('progress-ring');
                if (ring && allProblems.length > 0) {
                    const percent = Math.min((solvedCount / allProblems.length) * 100, 100);
                    ring.style.strokeDasharray = `${percent}, 100`;
                }
            }
        }
    } catch (e) {
        console.error("Failed to load user profile:", e);
    }
}

async function fetchProblems() {
    const tbody = document.getElementById('problem-table-body');
    if (!tbody) return;
    try {
        const token = localStorage.getItem('zenith_token');
        const res = await fetch('/api/problems', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to load problems");

        allProblems = await res.json();
        renderProblems(allProblems);
        renderSavedProblemsSidebar();

        // Re-trigger loadUserProfile now that allProblems length is known for progress ring
        loadUserProfile();

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `
            <tr><td colspan="5" class="py-12 text-center text-red-500 font-bold uppercase tracking-widest text-xs">
                <i class="fas fa-exclamation-triangle mb-2 text-2xl"></i><br>Failed to load matrix
            </td></tr>
        `;
    }
}

function renderProblems(problems) {
    const tbody = document.getElementById('problem-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (problems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-12 text-center text-slate-500 text-xs">No challenges available.</td></tr>`;
        return;
    }

    problems.forEach(p => {
        let diffColor = 'text-green-400';
        if (p.difficulty === 'Medium') diffColor = 'text-amber-400';
        else if (p.difficulty === 'Hard') diffColor = 'text-red-400';

        const statusHtml = p.isSolved
            ? `<i class="fas fa-check-circle text-emerald-500 text-lg"></i>`
            : `<i class="far fa-circle text-slate-600 text-lg hover:text-emerald-500 transition"></i>`;

        const starHtml = p.isSaved
            ? `<i class="fas fa-star text-amber-500 hover:text-amber-400 scale-110 transition"></i>`
            : `<i class="far fa-star text-slate-500 hover:text-amber-500 hover:scale-110 transition"></i>`;

        const tr = document.createElement('tr');
        tr.className = "table-row border-b border-white/5 transition cursor-pointer group";

        tr.innerHTML = `
            <td class="py-4 px-6 text-center" onclick="window.location.href='/arena-solver.html?id=${p._id}'">${statusHtml}</td>
            <td class="py-4 px-6 font-bold text-base group-hover:text-emerald-400 transition" onclick="window.location.href='/arena-solver.html?id=${p._id}'">${p.title}</td>
            <td class="py-4 px-6 ${diffColor} font-bold text-xs" onclick="window.location.href='/arena-solver.html?id=${p._id}'">${p.difficulty}</td>
            <td class="py-4 px-6" onclick="window.location.href='/arena-solver.html?id=${p._id}'">
                <div class="flex flex-wrap gap-1">
                    ${p.tags.slice(0, 2).map(t => `<span class="px-2 py-0.5 bg-white/5 text-[9px] rounded text-slate-400">${t}</span>`).join('')}
                    ${p.tags.length > 2 ? `<span class="px-2 py-0.5 bg-white/5 text-[9px] rounded text-slate-500">+${p.tags.length - 2}</span>` : ''}
                </div>
            </td>
            <td class="py-4 px-6 text-right text-lg" onclick="toggleBookmark('${p._id}', event)">
                ${starHtml}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderSavedProblemsSidebar() {
    const savedList = document.getElementById('saved-problems-list');
    if (!savedList) return;

    const saved = allProblems.filter(p => p.isSaved);

    if (saved.length === 0) {
        savedList.innerHTML = `<div class="text-xs text-slate-500 text-center py-4 bg-white/5 rounded-lg border border-white/5 border-dashed">No wishlist items yet.</div>`;
        return;
    }

    savedList.innerHTML = saved.map(p => `
        <div class="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 cursor-pointer transition flex items-center justify-between group" onclick="window.location.href='/arena-solver.html?id=${p._id}'">
            <div class="truncate pr-2">
                <div class="text-xs font-bold text-white group-hover:text-emerald-400 transition truncate">${p.title}</div>
                <div class="text-[9px] text-amber-500 mt-1"><i class="fas fa-bolt"></i> ${p.xpReward} XP</div>
            </div>
            <i class="fas fa-chevron-right text-[10px] text-slate-600 group-hover:text-emerald-500 transition"></i>
        </div>
    `).join('');
}

window.toggleBookmark = async function (problemId, event) {
    if (event) event.stopPropagation(); // prevent row click navigation
    try {
        const token = localStorage.getItem('zenith_token');
        const res = await fetch(`/api/problems/${problemId}/bookmark`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            // Update local state and re-render
            const target = allProblems.find(p => p._id === problemId);
            if (target) {
                target.isSaved = data.isSaved;
                renderProblems(allProblems);
                renderSavedProblemsSidebar();
            }
        }
    } catch (e) {
        console.error("Failed to toggle bookmark", e);
    }
}

// Search filtering basic implementation
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        const filtered = allProblems.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.tags.some(t => t.toLowerCase().includes(q))
        );
        renderProblems(filtered);
    });
}

// Seed demo
window.seedDummyProblem = async function () {
    try {
        const token = localStorage.getItem('zenith_token');
        const res = await fetch('/api/problems/seed', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            fetchProblems();
            alert("Sandbox problem injected into neural matrix.");
        }
    } catch (e) {
        console.error(e);
    }
}

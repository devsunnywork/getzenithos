// public/js/arena-leaderboard.js

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    fetchLeaderboardPreview();
    fetchMainLeaderboard();
});

async function fetchMainLeaderboard() {
    const tbody = document.getElementById('leaderboard-table-body');
    if (!tbody) return;

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/user/leaderboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to load leaderboard");

        const leaders = await res.json();

        if (leaders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="py-12 text-center text-zinc-500 text-xs uppercase tracking-widest font-mono">No data found in the core system.</td></tr>`;
            return;
        }

        tbody.innerHTML = leaders.map((u, i) => {
            let rankColor = 'text-zinc-500';
            if (i === 0) rankColor = 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]';
            else if (i === 1) rankColor = 'text-zinc-300 drop-shadow-[0_0_8px_rgba(212,212,216,0.5)]';
            else if (i === 2) rankColor = 'text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]';

            const avatarHtml = u.avatar
                ? `<img src="${u.avatar}" class="w-8 h-8 rounded-full border border-zinc-700 object-cover">`
                : `<div class="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white uppercase">${u.username.charAt(0)}</div>`;

            return `
            <tr class="problem-row">
                <td class="pl-8 py-4 text-[14px] font-black font-mono ${rankColor}">#${i + 1}</td>
                <td class="py-4">
                    <div class="flex items-center gap-3">
                        ${avatarHtml}
                        <span class="font-bold text-zinc-200">${u.username}</span>
                        ${i === 0 ? '<i class="fas fa-crown text-yellow-500 text-[10px] ml-1"></i>' : ''}
                    </div>
                </td>
                <td class="py-4 text-right pr-6">
                    <div class="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <i class="fas fa-fire text-[10px]"></i>
                        <span>${u.highestStreak || 0}</span>
                    </div>
                </td>
                <td class="pr-8 py-4 text-right">
                    <span class="text-emerald-400 font-bold font-mono tracking-tight text-[15px]">${u.hp || 0}</span>
                    <span class="text-[10px] text-zinc-600 ml-1 uppercase font-bold tracking-widest">HP</span>
                </td>
            </tr>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="4" class="py-12 text-center text-red-500 font-bold uppercase tracking-widest text-xs">Error compiling rankings</td></tr>`;
    }
}

// Below is the shared sidebar and profile sync logic 

async function fetchLeaderboardPreview() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/user/leaderboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const leaders = await res.json();
            const previewRow = document.getElementById('leaderboard-preview-row');
            if (previewRow) {
                previewRow.innerHTML = leaders.slice(0, 5).map(u => `
                <div class="w-8 h-8 rounded-full border border-black overflow-hidden bg-zinc-800" title="${u.username} - ${u.hp} HP">
                    ${u.avatar ? `<img src="${u.avatar}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-[9px] font-bold text-white uppercase">${u.username.charAt(0)}</div>`}
                </div>
                `).join('') + (leaders.length > 5 ? `<div class="w-8 h-8 rounded-full bg-zinc-900 border border-black flex items-center justify-center text-[9px] font-bold text-zinc-500">+${leaders.length - 5}</div>` : '');
            }
        }
    } catch (err) {
        console.error("Leaderboard protocol sync failed:", err);
    }
}

async function loadUserProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            if (!data) return;

            // Sync Header & Other Stats
            const streakCount = data.dsaStreak?.current || 0;
            if (document.getElementById('header-streak')) document.getElementById('header-streak').innerText = streakCount;
            if (document.getElementById('streak-big')) document.getElementById('streak-big').innerText = streakCount;
            if (document.getElementById('header-hp')) document.getElementById('header-hp').innerText = `${data.hp || 0} HP`;

            if (data.avatarUrl) {
                const img = document.getElementById('header-avatar');
                const icon = document.getElementById('header-avatar-icon');
                if (img) {
                    img.src = data.avatarUrl;
                    img.classList.remove('hidden');
                }
                if (icon) if (icon.classList) icon.classList.add('hidden');
            }

            // Let's populate the sidebar numbers
            const solvedIds = new Set((data.dsaSolved || []).map(id => id.toString()));
            // We need all problems to calculate the progress bars. I'll fetch problems briefly:
            const listRes = await fetch(`${API_BASE_URL}/api/problems`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let allProblems = [];
            if (listRes.ok) allProblems = await listRes.json();

            const easyTotal = allProblems.filter(p => p.difficulty === 'Easy').length;
            const mediumTotal = allProblems.filter(p => p.difficulty === 'Medium').length;
            const hardTotal = allProblems.filter(p => p.difficulty === 'Hard').length;

            const easySolved = allProblems.filter(p => p.difficulty === 'Easy' && solvedIds.has(p._id.toString())).length;
            const mediumSolved = allProblems.filter(p => p.difficulty === 'Medium' && solvedIds.has(p._id.toString())).length;
            const hardSolved = allProblems.filter(p => p.difficulty === 'Hard' && solvedIds.has(p._id.toString())).length;

            if (document.getElementById('stat-easy')) document.getElementById('stat-easy').innerText = easySolved;
            if (document.getElementById('stat-medium')) document.getElementById('stat-medium').innerText = mediumSolved;
            if (document.getElementById('stat-hard')) document.getElementById('stat-hard').innerText = hardSolved;

            if (document.getElementById('header-solved-count')) document.getElementById('header-solved-count').innerText = solvedIds.size;
            if (document.getElementById('header-total-count')) document.getElementById('header-total-count').innerText = allProblems.length;

            // Labels
            if (document.getElementById('total-solved-num')) document.getElementById('total-solved-num').innerText = solvedIds.size;
            if (document.getElementById('total-avail-num')) document.getElementById('total-avail-num').innerText = `of ${allProblems.length}`;

            // Update Progress Rings
            if (easyTotal > 0) updateRing('ring-easy', (easySolved / easyTotal) * 100);
            if (mediumTotal > 0) updateRing('ring-medium', (mediumSolved / mediumTotal) * 100);
            if (hardTotal > 0) updateRing('ring-hard', (hardSolved / hardTotal) * 100);

            if (allProblems.length > 0) {
                const totalBar = document.getElementById('total-bar');
                if (totalBar) totalBar.style.width = `${(solvedIds.size / allProblems.length) * 100}%`;
            }

            // Render Activity Calendar
            renderCalendar(data.dsaActivity || []);
        }
    } catch (e) {
        console.error("Failed to load user profile:", e);
    }
}

function updateRing(id, percent) {
    const el = document.getElementById(id);
    if (el) el.style.setProperty('--pct', `${percent}%`);
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
        day.title = `${count} Solved on ${dateKey}`;
        calendar.appendChild(day);
    }
}

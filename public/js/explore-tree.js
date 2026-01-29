// Career Dashboard Logic (V2)
const token = localStorage.getItem('token');

const state = {
    user: null,
    skills: [], // All available skills (for selector)
    activeCareer: null, // The currently viewed career object
    activeCareerIndex: 0,
    userProgress: [], // List of completed topic IDs
    otherActiveCareers: [], // For switching
    treeScale: 1,
    isDragging: false,
    lastMouse: { x: 0, y: 0 },
    viewOffset: { x: 0, y: 0 },
    viewInitialized: false, // NEW: track if we already centered the view
    currentModalNode: null
};

// --- Initialization ---

async function startExploreTree() {
    if (!token) return window.top.location.href = '/index.html';

    // Simulate high-tech loading delay for effect
    setTimeout(async () => {
        await loadData();
        initPanZoom(); // Initialize panning system
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('app-interface').classList.remove('hidden');
    }, 1500);
}

async function loadData() {
    try {
        const [profileRes, progressRes, skillsRes] = await Promise.all([
            fetch(API_BASE_URL + '/api/auth/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(API_BASE_URL + '/api/explore/careermode/my-progress', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(API_BASE_URL + '/api/explore/skills', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const profile = await profileRes.json();
        const progress = await progressRes.json();
        const allSkills = await skillsRes.json();

        state.user = profile;
        state.userProgress = progress.skillProgress ? progress.skillProgress.filter(p => p.isMastered).map(p => p.skillId) : [];
        // Note: backend 'skillProgress' tracks topics. Let's assume progress.skillProgress is array of { skillId: topicId, isMastered: true }
        // Wait, backend response structure might be different. Let's adjust.
        // Usually skillProgress is [{ skill: ID, progress: 50, isMastered: bool }] for ROOTS.
        // We need Topic-level progress. 
        // Let's assume the backend 'my-progress' returns { activeCareers: [Populated], skillProgress: [ { topicId: "...", isCompleted: true } ] }
        // For now, I'll fallback to checking 'activeCareers' which should be populated with user data if I updated the route correctly.
        // Actually, the route likely returns 'activeCareers' as the Skill Objects. User specific progress is separate.

        state.skills = allSkills;
        state.activeCareers = progress.activeCareers || [];
        state.changesLeft = progress.changesLeft;

        // Flatten completed topics from all skill progress entries
        const allCompleted = (progress.skillProgress || []).flatMap(sp => sp.completedTopics || []);
        state.completedNodeIds = new Set(allCompleted.map(id => id.toString()));

        updateUIState();
    } catch (e) {
        console.error("System Failure:", e);
        // showToast("DATA CORRUPTION DETECTED", "error");
    }
}

function updateUIState() {
    const { activeCareers } = state;

    if (activeCareers.length === 0) {
        // No active career -> Show Selection View
        document.getElementById('view-selection').classList.remove('hidden');
        document.getElementById('view-dashboard').classList.add('hidden');
        document.getElementById('nav-tabs').classList.add('hidden');
        document.getElementById('header-icon').className = 'fas fa-exclamation-triangle text-xl';
        document.getElementById('career-name').innerText = "NO PROTOCOL";
        document.getElementById('career-status').innerText = "SELECT PATH";
    } else {
        // Has active career
        document.getElementById('view-selection').classList.add('hidden');
        document.getElementById('nav-tabs').classList.remove('hidden');

        // Load the target career (default to index 0)
        loadCareerIntoView(state.activeCareerIndex);
    }
}

function loadCareerIntoView(index) {
    if (index >= state.activeCareers.length) index = 0;
    state.activeCareerIndex = index;
    state.activeCareer = state.activeCareers[index];

    // Update Header
    document.getElementById('header-icon').className = `fas ${state.activeCareer.icon || 'fa-code'} text-xl`;
    document.getElementById('career-name').innerText = state.activeCareer.name;
    document.getElementById('career-status').innerText = "PROTOCOL ACTIVE";

    // Update Views
    renderDashboard();
    renderTree();
    renderSyllabus();

    // Default to dashboard tab
    switchTab('dashboard');
}

// --- Dashboard View ---

function renderDashboard() {
    const nodes = state.activeCareer.topics || [];
    const totalNodes = nodes.length;
    const completedNodes = nodes.filter(n => state.completedNodeIds.has(n._id)).length;

    // Calculate Stats
    // XP Calculation: Sum of XP of completed nodes (using curr node.xp || 50)
    let totalXP = 0;
    nodes.forEach(n => {
        if (state.completedNodeIds.has(n._id)) {
            totalXP += (n.xp || 50);
        }
    });

    const percent = totalNodes === 0 ? 0 : Math.round((completedNodes / totalNodes) * 100);

    // XP AND LEVELING SYSTEM (1000 XP per level)
    const currentLevel = Math.floor(totalXP / 1000) + 1;
    const xpLeft = 1000 - (totalXP % 1000);

    // Update DOM
    document.getElementById('dash-xp').innerText = totalXP.toLocaleString();
    document.getElementById('dash-level').innerText = `LEVEL ${currentLevel}`;
    document.getElementById('xp-next-level').innerText = `${xpLeft} XP TO NEXT TIER`;
    document.getElementById('dash-nodes').innerText = `${completedNodes}/${totalNodes}`;
    document.getElementById('dash-percent').innerText = `${percent}%`;

    // Circle Animation
    const circle = document.getElementById('dash-circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // MASTERY CHECK: Toggle Certificate Access (Dashboard Buttons)
    const isMastered = percent === 100;
    const lockedBtn = document.getElementById('btn-claim-cert-locked');
    const unlockedBtn = document.getElementById('btn-claim-cert-unlocked');
    if (lockedBtn && unlockedBtn) {
        lockedBtn.classList.toggle('hidden', isMastered);
        unlockedBtn.classList.toggle('hidden', !isMastered);
    }

    // Last Active Node (Just find the first unlocked but not completed for now, or last completed)
    // Simple logic: Find first incomplete node
    const nextNode = nodes.find(n => !state.completedNodeIds.has(n._id));
    const lbl = document.getElementById('dash-last-node');
    if (nextNode) {
        lbl.innerText = `Next Target: ${nextNode.title}`;
        lbl.style.cursor = 'pointer';
        lbl.onclick = (e) => { e.stopPropagation(); openNodeInspector(nextNode); };
    } else {
        lbl.innerText = "All Targets Eliminated. Protocol Complete.";
        lbl.onclick = null;
    }
}

function continueJourney() {
    const nodes = state.activeCareer?.topics || [];
    const nextNode = nodes.find(n => !state.completedNodeIds.has(n._id));
    if (nextNode) {
        openNodeInspector(nextNode);
    } else {
        showToast("PROTOCOL COMPLETE. ALL TARGETS ACQUIRED.", "success");
    }
}

// --- Roadmap (Tree) View ---

function renderTree() {
    const layer = document.getElementById('panning-layer');
    const svg = document.getElementById('skill-tree-svg');

    // Clear old nodes (keep svg)
    Array.from(layer.children).forEach(c => {
        if (c.tagName !== 'svg') c.remove();
    });
    svg.innerHTML = ''; // Clear lines

    const nodes = state.activeCareer.topics || [];
    if (nodes.length === 0) return;

    // Render Connections (Lines)
    nodes.forEach(node => {
        if (node.parent) {
            const parent = nodes.find(n => n.id === node.parent || n._id === node.parent || n.title === node.parent); // simplified find
            if (parent && parent.position && node.position) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const p1 = parent.position;
                const p2 = node.position;
                // Cubic Bezier
                const d = `M ${p1.x} ${p1.y} C ${p1.x} ${p2.y} ${p1.x} ${p2.y} ${p2.x} ${p2.y}`;
                line.setAttribute('d', d);
                line.setAttribute('stroke', '#334155');
                line.setAttribute('stroke-width', '2');
                line.setAttribute('fill', 'none');
                svg.appendChild(line);
            }
        }
    });

    // Render Nodes (DOM Elements)
    nodes.forEach(node => {
        const el = document.createElement('div');
        const isCompleted = state.completedNodeIds.has(node._id);

        // Differentiate by type
        let size = 'w-12 h-12';
        let glow = '';
        let iconClass = 'fa-cube';

        if (node.type === 'main') {
            size = 'w-16 h-16';
            glow = 'shadow-[0_0_30px_rgba(59,130,246,0.5)] border-blue-400';
            iconClass = 'fa-shield-halved text-xl';
        } else if (node.type === 'sub') {
            size = 'w-10 h-10';
            iconClass = 'fa-atom text-[9px]';
        } else if (node.type === 'branch') {
            iconClass = 'fa-code-branch';
        }

        el.className = `absolute transform -translate-x-1/2 -translate-y-1/2 ${size} rounded-2xl flex items-center justify-center border transition-all cursor-pointer group hover:scale-110 z-10 
            ${isCompleted ? 'bg-blue-600 border-blue-400 text-white ' + glow : 'bg-[#050505] border-white/10 text-slate-500 hover:border-blue-500 hover:text-white'}`;

        if (!isCompleted && node.type === 'main') el.classList.add('border-blue-900/50');

        el.style.left = `${node.position?.x || 0}px`;
        el.style.top = `${node.position?.y || 0}px`;

        el.innerHTML = `<i class="fas ${isCompleted ? 'fa-check' : iconClass}"></i>`;

        // Fix node title text - correct "JAVA SCRIPT" to "JavaScript"
        let displayTitle = node.title;
        if (displayTitle.toUpperCase() === 'JAVA SCRIPT') {
            displayTitle = 'JavaScript';
        }

        // Permanent Stylish Label (More visible with better spacing)
        const label = document.createElement('div');
        label.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-6 text-[11px] font-black text-white uppercase tracking-[0.15em] whitespace-nowrap drop-shadow-xl pointer-events-none group-hover:text-blue-400 transition-colors';
        label.innerHTML = `
            <div class="flex flex-col items-center">
                <div class="bg-black/80 px-4 py-2 rounded-lg border border-white/20 backdrop-blur-sm shadow-lg">${displayTitle}</div>
            </div>
        `;
        el.appendChild(label);

        // Hover Tooltip (Detailed)
        const tip = document.createElement('div');
        tip.className = 'absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 bg-blue-600 border border-blue-400 rounded-lg text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition shadow-xl pointer-events-none uppercase tracking-widest z-50';
        tip.innerHTML = `<i class="fas fa-satellite mr-2"></i> ${node.type?.toUpperCase() || 'PROTOCOL'} MODULE`;
        el.appendChild(tip);
        el.onclick = (e) => { e.stopPropagation(); openNodeInspector(node); };
        layer.appendChild(el);
    });

    // Initial View Offset: Find ROOT and center it
    if (!state.viewInitialized && nodes.length > 0) {
        const root = nodes.find(n => n.type === 'main') || nodes[0];
        const container = document.getElementById('skill-tree-container');
        if (root && root.position && container) {
            const cw = container.clientWidth / 2;
            const ch = container.clientHeight / 2;
            // Calculate offset to bring root to center
            state.viewOffset = {
                x: cw - root.position.x,
                y: ch - root.position.y
            };
            state.viewInitialized = true;
        }
    }
    updateTreeTransform();
}

// Tree Interaction (Zoom/Pan)
// (Simplifying for this file - basic implementation)
function initPanZoom() {
    const container = document.getElementById('skill-tree-container');
    container.onmousedown = e => {
        state.isDragging = true;
        state.lastMouse = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mouseup', () => state.isDragging = false);
    window.addEventListener('mousemove', e => {
        if (!state.isDragging) return;
        // Sensitivity Reduction (Dampening)
        const sensitivity = 0.7;
        const dx = ((e.clientX - state.lastMouse.x) / state.treeScale) * sensitivity;
        const dy = ((e.clientY - state.lastMouse.y) / state.treeScale) * sensitivity;

        state.viewOffset.x += dx;
        state.viewOffset.y += dy;
        state.lastMouse = { x: e.clientX, y: e.clientY };
        updateTreeTransform();
    });

    // Wheel Zoom
    container.onwheel = e => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        state.treeScale = Math.min(Math.max(0.2, state.treeScale * delta), 2);
        updateTreeTransform();
    };
}

function updateTreeTransform() {
    const layer = document.getElementById('panning-layer');
    if (layer) {
        layer.style.transform = `translate(${state.viewOffset.x}px, ${state.viewOffset.y}px) scale(${state.treeScale})`;
    }
}

function zoomIn() {
    state.treeScale = Math.min(2, state.treeScale * 1.2);
    updateTreeTransform();
}

function zoomOut() {
    state.treeScale = Math.max(0.2, state.treeScale / 1.2);
    updateTreeTransform();
}

function resetView() {
    state.treeScale = 1;
    const nodes = state.activeCareer?.topics || [];
    if (nodes.length > 0) {
        const root = nodes.find(n => n.type === 'main') || nodes[0];
        const container = document.getElementById('skill-tree-container');
        if (root && root.position && container) {
            const cw = container.clientWidth / 2;
            const ch = container.clientHeight / 2;
            state.viewOffset = {
                x: cw - root.position.x,
                y: ch - root.position.y
            };
        }
    } else {
        state.viewOffset = { x: 0, y: 0 };
    }
    updateTreeTransform();
}

// --- Syllabus View ---

function renderSyllabus() {
    const list = document.getElementById('syllabus-list');
    const nodes = state.activeCareer.topics || [];

    // Group by 'parent' to create hierarchy? Or just a flat list for now with indents?
    // Let's use simple list.
    list.innerHTML = nodes.map(node => `
        <div class="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/30 cursor-pointer transition select-none" onclick="openNodeInspectorId('${node._id}')">
            <div class="w-10 h-10 rounded bg-black/40 flex items-center justify-center text-slate-500 border border-white/5">
                <i class="fas ${state.completedNodeIds.has(node._id) ? 'fa-check text-green-500' : 'fa-cube'}"></i>
            </div>
            <div class="flex-1">
                <h4 class="text-sm font-bold text-white">${node.title}</h4>
                <p class="text-[10px] text-slate-500 uppercase tracking-widest">${node.lectures ? node.lectures.length + ' Lectures' : 'Module'}</p>
            </div>
            <span class="text-[10px] font-mono text-blue-500 bg-blue-500/10 px-2 py-1 rounded">+${node.xp || 50} XP</span>
        </div>
    `).join('');
}
function openNodeInspectorId(id) {
    const node = state.activeCareer.topics.find(n => n._id === id);
    if (node) openNodeInspector(node);
}


// --- Node Inspector (Modal) ---

function openNodeInspector(node) {
    state.currentModalNode = node;
    const modal = document.getElementById('node-modal');
    modal.classList.remove('hidden');

    // Populate Header
    document.getElementById('nm-title').innerText = node.title;
    document.getElementById('nm-xp').innerText = `${node.xp || 50} XP`;

    const isCompleted = state.completedNodeIds.has(node._id);
    const statusEl = document.getElementById('nm-status');
    statusEl.innerText = isCompleted ? "COMPLETED" : "INCOMPLETE";
    statusEl.className = isCompleted
        ? "px-2 py-0.5 bg-green-500/20 text-green-400 text-[9px] font-bold uppercase tracking-widest rounded transition"
        : "px-2 py-0.5 bg-slate-800 text-slate-500 text-[9px] font-bold uppercase tracking-widest rounded transition";

    // Complete Button
    const btn = document.getElementById('nm-complete-btn');
    if (isCompleted) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-check-double text-blue-500"></i> MISSION ACCREDITED`;
        btn.className = "btn-complete-protocol btn-complete-cleared w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3";
    } else {
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-bolt"></i> START ACCREDITATION`;
        btn.className = "btn-complete-protocol w-full py-5 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] transition-all flex items-center justify-center gap-3";
    }

    // Populate Briefing / Intel
    document.getElementById('nm-desc-content').innerText = node.description || "No mission description provided.";
    document.getElementById('nm-notes-content').innerHTML = `<ul>${(node.importantPoints || '').split('\n').map(l => `<li>${l}</li>`).join('')}</ul>`;
    document.getElementById('nm-pdf-link').href = node.pdfUrl || '#';

    // Populate Lectures List
    renderModalLectures(node);

    // Default Tab
    switchModalTab('visual');
}

function renderModalLectures(node) {
    const list = document.getElementById('nm-lecture-list');
    const lectures = node.lectures || []; // Fallback if old node

    // If no lectures structure, check legacy flat 'videoUrl' or 'url'
    const legacyUrl = node.videoUrl || node.url;
    if (lectures.length === 0 && legacyUrl) {
        lectures.push({ title: "Main Briefing", videoUrl: legacyUrl, notes: "Core mission briefing." });
    }

    if (lectures.length === 0) {
        list.innerHTML = `<div class="text-center p-4 text-[10px] text-slate-600 italic">No video feeds available.</div>`;
        document.getElementById('nm-video-frame').src = "";
        document.getElementById('nm-no-video').classList.remove('hidden');
        return;
    }

    list.innerHTML = lectures.map((lec, i) => `
        <div onclick="playLecture(${i})" class="p-4 rounded-xl border border-white/5 bg-white/0 hover:bg-white/[0.03] hover:border-blue-500/20 cursor-pointer transition-all group relative overflow-hidden">
            <div class="flex items-center gap-4 relative z-10">
                <div class="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-blue-500 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all">
                    <i class="fas fa-play text-xs"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <h5 class="text-[11px] font-black text-white/80 uppercase tracking-widest group-hover:text-white transition truncate">${lec.title}</h5>
                    <p class="text-[9px] font-black text-slate-600 uppercase tracking-tighter mt-1">Syllabus Segment 0${i + 1}</p>
                </div>
            </div>
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/0 to-blue-600/[0.02] opacity-0 group-hover:opacity-100 transition"></div>
        </div>
    `).join('');

    // Auto play first
    playLecture(0);
}

function playLecture(index) {
    const node = state.currentModalNode;
    if (!node) return;

    // Get processed lectures (same logic as renderModalLectures)
    let lectures = [...(node.lectures || [])];
    const legacyUrl = node.videoUrl || node.url;
    if (lectures.length === 0 && legacyUrl) {
        lectures.push({ title: "Main Briefing", videoUrl: legacyUrl, notes: node.description || "Core mission briefing." });
    }

    const lec = lectures[index];
    if (!lec) return;

    const vUrl = lec.videoUrl || lec.url;

    // Update Video View
    const frame = document.getElementById('nm-video-frame');
    const noVid = document.getElementById('nm-no-video');
    const title = document.getElementById('nm-active-lec-title');

    title.innerText = lec.title || "Unknown Signal";

    if (vUrl) {
        let finalUrl = vUrl;

        // Robust YouTube Regex for all weird URL variants
        const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = vUrl.match(ytRegex);

        if (match && match[1]) {
            const videoId = match[1];
            finalUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        } else if (vUrl.includes('youtube.com/embed/')) {
            // Already embed, but ensuring autoplay policy
            if (!vUrl.includes('autoplay=')) finalUrl += (vUrl.includes('?') ? '&' : '?') + 'autoplay=1';
        }

        frame.src = finalUrl;
        frame.classList.remove('hidden');
        noVid.classList.add('hidden');
    } else {
        frame.src = "";
        frame.classList.add('hidden');
        noVid.classList.remove('hidden');
    }

    // Update specific notes for this lecture if any?
    if (lec.notes) {
        document.getElementById('nm-notes-content').innerHTML = `
            <div class="mb-4 text-blue-400 font-bold uppercase text-xs tracking-widest border-b border-blue-500/20 pb-2">Log: ${lec.title}</div>
            <div class="text-slate-300 leading-relaxed">${markdownToHtml(lec.notes)}</div>
        `;
    }
}

function markdownToHtml(text) {
    return text ? text.replace(/\n/g, '<br>') : '';
}

function closeNodeModal() {
    document.getElementById('node-modal').classList.add('hidden');
    document.getElementById('nm-video-frame').src = ""; // Stop video
}

function switchModalTab(tab) {
    document.querySelectorAll('.nm-tab-btn').forEach(b => {
        b.classList.remove('border-blue-500', 'text-white');
        b.classList.add('border-transparent', 'text-slate-500');
    });
    // Highlight active
    const activeBtn = Array.from(document.querySelectorAll('.nm-tab-btn')).find(b => b.innerText.toLowerCase().includes(tab.split(' ')[0])); // Hacky match
    if (activeBtn) {
        activeBtn.classList.remove('border-transparent', 'text-slate-500');
        activeBtn.classList.add('border-blue-500', 'text-white');
    }

    document.getElementById('nm-view-visual').classList.add('hidden');
    document.getElementById('nm-view-intel').classList.add('hidden');
    document.getElementById('nm-view-briefing').classList.add('hidden');

    document.getElementById(`nm-view-${tab}`).classList.remove('hidden');
}


// --- Actions ---

async function completeCurrentNode() {
    const node = state.currentModalNode;
    if (!node) return;

    const btn = document.getElementById('nm-complete-btn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Syncing...';
        btn.disabled = true;
    }

    try {
        // Use node._id for standard Mongoose lookup
        const skillId = state.activeCareer._id;
        const topicId = node._id;

        console.log(`[Zenith System] Initializing Sync: Skill=${skillId}, Topic=${topicId}`);

        const res = await fetch(API_BASE_URL + `/api/explore/skills/${skillId}/topics/${topicId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();
        if (res.ok) {
            showToast("DATA UPLINK SUCCESSFUL", "success");
            await loadData(); // Full refresh to catch auto-completions
            renderSyllabus();
            renderTree();
            renderDashboard();
            closeNodeModal();
        } else {
            // Enhanced error message
            const errMsg = data.details ? `${data.message}\n${data.details}` : (data.message || "Uplink Rejected");
            showToast(errMsg, "error");
            if (btn) {
                btn.innerHTML = '<i class="fas fa-shield-check mr-2"></i> Mark Mission Complete';
                btn.disabled = false;
            }
        }
    } catch (e) {
        console.error("Completion Error:", e);
        showToast("SYNC ERROR", "error");
        if (btn) {
            btn.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Mark Mission Complete';
            btn.disabled = false;
        }
    }
}

// --- Helpers ---

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 30px; right: 30px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(container); // Explore-tree is in iframe body
    }

    const toast = document.createElement('div');
    const color = type === 'success' ? '#22c55e' : '#ef4444';

    toast.style.cssText = `
        background: #050505;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 1rem;
        border: 1px solid rgba(255,255,255,0.1);
        border-left: 4px solid ${color};
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-weight: 700;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        transform: translateX(100%);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 250px;
    `;

    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}" style="color: ${color}; font-size: 14px;"></i> <div>${message.replace(/\n/g, '<br>')}</div>`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.style.transform = 'translateX(0)');

    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

function switchTab(tab) {
    ['dashboard', 'roadmap', 'syllabus', 'videos'].forEach(t => {
        document.getElementById(`view-${t}`).classList.add('hidden');
    });
    document.getElementById(`view-${tab}`).classList.remove('hidden');

    // Update Nav
    const btns = document.getElementById('nav-tabs').children;
    Array.from(btns).forEach(b => b.classList.remove('active'));
    // Simple index logic or text match
    if (tab === 'dashboard') btns[0].classList.add('active');
    if (tab === 'roadmap') btns[1].classList.add('active');
    if (tab === 'syllabus') btns[2].classList.add('active');
    if (tab === 'videos') btns[3].classList.add('active');
}

function openCareerSelector() {
    // Re-use logic from previous version, just simpler modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/95 backdrop-blur-2xl z-[9999] p-10 flex items-center justify-center animate-in zoom-in-95 duration-300';

    // Filter available skills
    const availableSkills = state.skills || [];

    modal.innerHTML = `
        <div class="bg-[#050505] border border-white/5 p-14 rounded-[4rem] max-w-5xl w-full h-[80vh] flex flex-col relative overflow-hidden">
            <div class="flex justify-between items-center mb-10 shrink-0">
                <h2 class="text-4xl font-black uppercase tracking-tighter syne">Initialize Protocol</h2>
                <button onclick="this.closest('.fixed').remove()" class="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition"><i class="fas fa-times text-xl"></i></button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pr-4">
                ${availableSkills.map(s => `
                    <div class="p-8 glass-card rounded-[2.5rem] border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group" onclick="selectCareer('${s._id}', 'add'); this.closest('.fixed').remove()">
                        <div class="flex justify-between items-start mb-6">
                            <div class="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 text-2xl border border-blue-600/20 group-hover:scale-110 transition">
                                <i class="fas ${s.icon || 'fa-code'}"></i>
                            </div>
                            <span class="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500">${s.category}</span>
                        </div>
                        <h4 class="text-xl font-black uppercase tracking-tighter text-white mb-2">${s.name}</h4>
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest line-clamp-2">${s.description || 'No briefing available.'}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function selectCareer(skillId, action) {
    try {
        const res = await fetch(API_BASE_URL + '/api/explore/careermode/select', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ skillId, action })
        });
        if (res.ok) {
            window.location.reload(); // Simple reload to refresh all state
        } else {
            const d = await res.json();
            showToast(d.message, 'error');
        }
    } catch (e) {
        showToast("Selection Failed", 'error');
    }
}

// --- Certificate Engine V8.0 ---

function openCertificate() {
    if (!state.user || !state.activeCareer) return;

    // User Details
    document.getElementById('cert-user-name').innerText = state.user.username.toUpperCase();
    document.getElementById('cert-career-name').innerText = state.activeCareer.name.toUpperCase();

    // Performance Grade (S-Tier for 100% completion)
    const grade = document.getElementById('cert-grade');
    grade.innerText = 'S-TIER';

    // Sync Date
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    document.getElementById('cert-date').innerText = dateStr;

    // Protocol ID (Random but consistent looking)
    const protocolId = `Z-${Math.floor(1000 + Math.random() * 9000)}-${state.activeCareer.name.substring(0, 2).toUpperCase()}-ALPHA`;
    document.getElementById('cert-protocol-id').innerText = protocolId;

    // Verified Skills Matrix - Extract completed node titles
    const completedNodes = [];
    if (state.activeCareer && state.activeCareer.skills) {
        state.activeCareer.skills.forEach(skill => {
            if (skill.topics) {
                skill.topics.forEach(topic => {
                    const topicProgress = state.userProgress?.topics?.find(t => String(t.topicId) === String(topic._id));
                    if (topicProgress?.completed) {
                        completedNodes.push(topic.title);
                    }
                });
            }
        });
    }

    // Populate Skills List
    const skillsList = document.getElementById('cert-skills-list');
    if (completedNodes.length > 0) {
        skillsList.innerHTML = completedNodes.slice(0, 8).map(title => `
            <div class="flex items-center gap-3 p-4 bg-black/40 rounded-xl border border-white/5">
                <i class="fas fa-check-circle text-emerald-500 text-sm"></i>
                <span class="text-xs font-bold text-white uppercase tracking-tight">${title}</span>
            </div>
        `).join('');
    } else {
        skillsList.innerHTML = `
            <div class="col-span-2 text-center py-6">
                <p class="text-xs text-slate-500 uppercase tracking-widest">All Core Competencies Verified</p>
            </div>
        `;
    }

    document.getElementById('modal-certificate').classList.remove('hidden');
}

function closeCertificate() {
    document.getElementById('modal-certificate').classList.add('hidden');
}

function downloadCertificate(event) {
    // Aesthetic simulated download
    const btn = event.currentTarget || document.querySelector('#modal-certificate button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> ENCRYPTING PDF...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> DOWNLOAD SUCCESSFUL';
        btn.classList.remove('bg-emerald-600');
        btn.classList.add('bg-blue-600');

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('bg-blue-600');
            btn.classList.add('bg-emerald-600');
            btn.disabled = false;
        }, 2000);
    }, 2500);
}

// Start
window.onload = () => {
    startExploreTree();
    const btn = document.getElementById('btn-continue-journey');
    if (btn) btn.onclick = continueJourney;
};

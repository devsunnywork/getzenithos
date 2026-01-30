/**
 * ZENITH // EXPLORE TREE ENGINE v4.0
 * -----------------------------------------------------------------------------
 * A high-performance, SVG-based neural visualization engine for skill trees.
 * 
 * CORE ARCHITECTURE:
 * 1. State Management: Centralized store for nodes, edges, and viewport state.
 * 2. Visual Engine: Pure SVG manipulation for crisp rendering at any scale.
 * 3. Interaction Layer: Event delegation for performant drag/zoom/click handling.
 */

// --- CONFIGURATION ---
const CONFIG = {
    // Visuals
    NODE_RADIUS: 40,
    NODE_SPACING_X: 250,
    NODE_SPACING_Y: 150,
    CONNECTION_WIDTH: 2,
    COLORS: {
        background: '#020617', // Slate 950
        nodeDefault: '#1e293b', // Slate 800
        nodeActive: '#2563eb', // Blue 600
        nodeLocked: '#0f172a', // Slate 900
        nodeMastered: '#10b981', // Emerald 500
        text: '#f8fafc',
        textMuted: '#64748b',
        accent: '#3b82f6'
    },
    // Physics / Camera
    ZOOM_MIN: 0.1,
    ZOOM_MAX: 3.0,
    ZOOM_SENSITIVITY: 0.001,
    PAN_FRICTION: 0.9,
    ANIMATION_SPEED: 0.4 // Seconds
};

// --- STATE MANAGEMENT ---
const State = {
    nodes: [],
    connections: [],
    activeCareer: null,
    view: {
        x: 0,
        y: 0,
        scale: 1,
        isDragging: false,
        lastMouse: { x: 0, y: 0 }
    },
    ui: {
        selectedNode: null,
        hoveredNode: null
    },
    user: {
        unlockedNodes: new Set(),
        masteredNodes: new Set()
    }
};

// --- CORE ENGINE ---
class ExploreEngine {
    constructor() {
        this.svg = document.getElementById('tree-svg-layer');
        this.container = document.getElementById('tree-container');
        this.layers = {
            connections: document.getElementById('connections-layer'),
            nodes: document.getElementById('nodes-layer')
        };

        this.init();
    }

    init() {
        console.log("ZENITH // EXPLORE ENGINE: Initializing sequence...");

        this.setupEventListeners();
        this.fetchData(); // Run in parallel, but it handles its own UI updates
        this.startRenderLoop();

        // FAIL-SAFE: Force loader removal after 5 seconds to prevent infinite lock
        setTimeout(() => {
            this.hideLoader();
        }, 5000);
    }



    // --- DATA HANDLING ---
    async fetchData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/index.html';
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/explore/careermode/my-progress`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            console.log("ZENITH // DEBUG DATA:", data); // DEBUG LOG

            // Store User Data globally in State
            State.user = data.user || { name: 'Operative', xp: 0, level: 1 };
            State.skillProgress = data.skillProgress || [];

            if (data.activeCareers && data.activeCareers.length > 0) {
                // Load the first active career by default
                this.loadTree(data.activeCareers[0], data.skillProgress);
            } else {
                // No active career, prompt selection
                console.log("ZENITH // No active protocol. Initiating selection...");
                // Just render empty dashboard with user stats
                this.renderDashboard(State.user, { name: 'No Protocol', topics: [] }, []);
                this.openCareerSelector();
                this.hideLoader();
            }
        } catch (error) {
            console.error("ZENITH // SYSTEM HALT: Data Retrieval Failed", error);
            // Fallback to mock if API fails in dev
            this.renderDashboard(State.user, { name: 'System Error', topics: [] }, []);
            this.loadMockData();
            this.hideLoader();
        }
    }

    renderDashboard(user, activeCareer, progressRaw) {
        // Render User Stats
        const elName = document.getElementById('dash-username');
        const elXp = document.getElementById('dash-xp');
        const elLevel = document.getElementById('dash-level');
        const elStreak = document.getElementById('dash-streak');
        const elCompleted = document.getElementById('dash-completed');

        // Safety checks
        if (!user) user = { name: 'Operative', xp: 0, level: 1 };
        if (!activeCareer) activeCareer = { name: 'Unknown', topics: [] };

        if (elName) elName.innerText = user.name || user.username || 'Operative';
        if (elXp) elXp.innerText = user.xp || 0;
        if (elLevel) elLevel.innerText = user.level || 1;
        if (elStreak) elStreak.innerText = user.streak || 0;

        // Render Avatar if available
        const elAvatarContainer = document.querySelector('.dash-avatar-container'); // Assuming class hook
        // If not found, try to find the icon container
        // Based on UI screenshot implies a dedicated area. The user mentioned "Show user full name and avatar"
        // Let's assume there is an avatar container or we should fallback.
        // Actually, looking at the code I read earlier, I didn't see explicit avatar ID.
        // I will target the existing icon and replace it if avatar URL exists.

        // Find the user icon - it was <i class="fas fa-user-astronaut ..."></i>
        // I need to search for it in HTML or assume I can find it via parent.
        // Let's look for an element with specific class in HTML first? No, I am in JS.
        // I'll add an ID to the HTML in the next step to make this robust.
        // For now, I'll add generic logic:

        const elAvatarImg = document.getElementById('dash-avatar-img');
        const elAvatarIcon = document.getElementById('dash-avatar-icon');

        if (user.avatar && elAvatarImg) {
            let avatarUrl = user.avatar;
            if (avatarUrl.startsWith('/') || avatarUrl.startsWith('uploads/')) {
                // Ensure it has a leading slash for normalization if it starts with uploads
                const path = avatarUrl.startsWith('/') ? avatarUrl : '/' + avatarUrl;
                if (path.startsWith('/uploads/')) {
                    avatarUrl = API_BASE_URL + path;
                } else {
                    avatarUrl = path; // Standard relative path
                }
            }
            elAvatarImg.src = avatarUrl;
            elAvatarImg.classList.remove('hidden');
            if (elAvatarIcon) elAvatarIcon.classList.add('hidden');
        } else if (elAvatarIcon) {
            if (elAvatarImg) elAvatarImg.classList.add('hidden');
            elAvatarIcon.classList.remove('hidden');
        }

        // Find career specific progress
        let completedCount = 0;
        if (progressRaw) {
            const careerProgress = progressRaw.find(p => p.skill && ((p.skill._id || p.skill) === activeCareer._id));
            completedCount = careerProgress ? careerProgress.completedTopics.length : 0;
        }

        const totalNodes = activeCareer.topics ? activeCareer.topics.length : 0;
        const percent = totalNodes > 0 ? Math.round((completedCount / totalNodes) * 100) : 0;

        if (elCompleted) elCompleted.innerText = completedCount;

        // Render Active Protocol Card
        const elIcon = document.getElementById('active-skill-icon');
        const elSkillName = document.getElementById('active-skill-name');
        const elDesc = document.getElementById('active-skill-desc');
        const elProgBar = document.getElementById('active-skill-progress');
        const elPercent = document.getElementById('active-skill-percent');

        if (elIcon) elIcon.className = `fas ${activeCareer.icon || 'fa-cube'} text-2xl text-white`;
        if (elSkillName) elSkillName.innerText = activeCareer.name;
        if (elDesc) elDesc.innerText = activeCareer.description || 'System initialized.';
        if (elProgBar) elProgBar.style.width = `${percent}%`;
        if (elPercent) elPercent.innerText = `${percent}%`;

        // Update Milestones
        const elMilestoneTitle = document.getElementById('milestone-title');
        const elMilestoneDesc = document.getElementById('milestone-desc');
        const elCertOverlay = document.getElementById('cert-locked-overlay');
        const elCertBtn = document.getElementById('btn-claim-cert');

        if (elMilestoneTitle && elMilestoneDesc) {
            const currentLevel = user.level || 1;
            const nextLevel = currentLevel + 1;
            const nodesNeededForNextLevel = nextLevel * 5; // Example logic: each level needs lvl*5 nodes
            const remaining = Math.max(0, nodesNeededForNextLevel - completedCount);

            if (remaining > 0) {
                elMilestoneTitle.innerText = `Level ${nextLevel} Protocol`;
                elMilestoneDesc.innerText = `Complete ${remaining} more nodes to reach Rank ${nextLevel}`;
            } else {
                elMilestoneTitle.innerText = `Elite Operative`;
                elMilestoneDesc.innerText = `Requirement for Rank ${nextLevel} cleared`;
            }
        }

        // Add Achievement Handler
        const btnAchievements = document.querySelector('button[onclick*="Achievements"]');
        if (btnAchievements) {
            btnAchievements.onclick = () => window.showAchievements();
        }

        // Check Certificate Status (Enhanced for New Card)

        if (percent >= 100) {
            if (elCertOverlay) elCertOverlay.classList.add('opacity-0', 'pointer-events-none');
            if (elCertBtn) {
                elCertBtn.disabled = false;
                elCertBtn.classList.remove('bg-white/5', 'text-slate-500');
                elCertBtn.classList.add('bg-gradient-to-r', 'from-blue-600', 'to-indigo-600', 'text-white', 'hover:scale-105');
            }
        } else {
            if (elCertOverlay) elCertOverlay.classList.remove('opacity-0', 'pointer-events-none');
            if (elCertBtn) {
                elCertBtn.disabled = true;
                elCertBtn.classList.add('bg-white/5', 'text-slate-500');
                elCertBtn.classList.remove('bg-gradient-to-r', 'from-blue-600', 'to-indigo-600', 'text-white', 'hover:scale-105');
            }
        }

        // Store for certificate
        this.currentUser = user;
        this.currentSkill = activeCareer;
    }

    renderSyllabus(skill, nodes) {
        const container = document.getElementById('syllabus-container');
        if (!container) return;

        container.innerHTML = '';

        // Clear existing structure (remove Year 1/2/3 divs)
        // We will just create a clean list of grouped topics based on their parent relationships or flat list 
        // User requested "Show exactly as admin created", so we list them by depth/flow

        // Group by Parent for clearer structure, or just flat list by level?
        // Let's do a structured list: Root -> Children

        const renderNodeItem = (node, depth = 0) => {
            const el = document.createElement('div');
            el.className = `group flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition cursor-pointer mb-2 ml-${depth * 4}`;
            el.onclick = () => window.openNodeDetail(node);

            const isDone = node.status === 'mastered';
            const isLocked = node.status === 'locked';

            let statusIcon = isLocked ? '<i class="fas fa-lock text-slate-600"></i>' : (isDone ? '<i class="fas fa-check text-emerald-500"></i>' : '<i class="fas fa-circle text-blue-500 text-[8px]"></i>');
            let statusClass = isLocked ? 'bg-white/5 border-white/5' : (isDone ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-blue-500/10 border-blue-500/20');

            el.innerHTML = `
                <div class="w-10 h-10 rounded-lg ${statusClass} flex items-center justify-center border transition group-hover:scale-110 shrink-0">
                    ${statusIcon}
                </div>
                <div class="flex-1">
                    <h4 class="text-slate-200 font-bold text-sm group-hover:text-white transition">${node.label}</h4>
                    <p class="text-[10px] text-slate-500 uppercase tracking-widest">${node.data.description || 'Module Content'}</p>
                </div>
                <div class="text-right shrink-0">
                    <span class="text-[10px] font-bold text-slate-600 group-hover:text-slate-400 transition">${node.data.xp || 50} XP</span>
                </div>
            `;
            container.appendChild(el);

            // Find children and render them
            const children = nodes.filter(n => n.data.parent === node.id || n.data.parent === node.label);
            children.forEach(child => renderNodeItem(child, depth + 1));
        };

        // Find roots (Depth 0)
        const roots = nodes.filter(n => n.level === 0 || !n.data.parent);
        if (roots.length === 0 && nodes.length > 0) {
            // Fallback if no clear root
            nodes.forEach(n => renderNodeItem(n, 0));
        } else {
            roots.forEach(r => renderNodeItem(r, 0));
        }
    }

    loadTree(skill, progress) {
        console.log("ZENITH // Loading Protocol:", skill.name);
        State.activeCareer = skill;

        // Parse Skill Topics into Graph
        const { nodes, connections } = this.parseSkillToGraph(skill, progress);

        State.nodes = nodes;
        State.connections = connections;

        // Auto-center on Root
        const root = nodes.find(n => n.type === 'root');
        if (root) this.centerViewOn(root.x, root.y);

        this.render();
        this.render();
        this.renderSyllabus(skill, nodes);
        this.renderDashboard(State.user, skill, State.skillProgress); // <--- FIX: Update Dashboard UI
        this.updateHUD();
        this.hideLoader(); // FIX: Remove loader after render
    }

    hideLoader() {
        const loader = document.getElementById('zenith-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 1000);
        }
    }

    parseSkillToGraph(skill, progress) {
        const nodes = [];
        const connections = [];
        const topics = skill.topics || [];

        // Helper for robust ID matching
        const normalizeId = (val) => {
            if (!val) return null;
            if (val._id) return String(val._id); // Handle object/populated
            return String(val); // Handle direct string/ID
        };

        // 1. Create Nodes
        const levelMap = new Map(); // level -> count
        const topicMap = new Map(); // id -> node

        const getDepth = (t) => {
            if (!t.parent) return 0;
            const parent = topics.find(p => p._id === t.parent || p.title === t.parent);
            return parent ? getDepth(parent) + 1 : 0;
        };

        topics.forEach(t => {
            const depth = getDepth(t);
            if (!levelMap.has(depth)) levelMap.set(depth, 0);

            const countInLevel = levelMap.get(depth);
            levelMap.set(depth, countInLevel + 1);

            const userSkillProg = progress.find(p => {
                const pId = normalizeId(p.skill);
                const sId = normalizeId(skill);
                return pId === sId;
            });

            const isCompleted = userSkillProg?.completedTopics?.some(topicId => normalizeId(topicId) === normalizeId(t._id));
            const isUnlocked = t.parent ? true : true; // Simplify unlock logic for visual

            const node = {
                id: t._id,
                label: t.title,
                type: depth === 0 ? 'root' : 'skill',
                status: isCompleted ? 'mastered' : (isUnlocked ? 'unlocked' : 'locked'),
                level: depth,
                index: countInLevel,
                data: t,
                x: 0,
                y: 0
            };

            nodes.push(node);
            topicMap.set(t._id, node);
            topicMap.set(t.title, node);
        });

        // 2. Position Nodes
        nodes.forEach(n => {
            if (n.data.position && (n.data.position.x !== 0 || n.data.position.y !== 0)) {
                // Use Admin-defined position
                n.x = n.data.position.x;
                n.y = n.data.position.y;
            } else {
                // Fallback: Auto-Layout
                const count = levelMap.get(n.level);
                const xOffset = -(count - 1) * CONFIG.NODE_SPACING_X / 2;
                n.x = (n.index * CONFIG.NODE_SPACING_X) + xOffset;
                n.y = n.level * CONFIG.NODE_SPACING_Y;
            }
        });

        // 3. Create Connections
        topics.forEach(t => {
            if (t.parent) {
                const parentNode = topicMap.get(t.parent);
                const myNode = topicMap.get(t._id);
                if (parentNode && myNode) {
                    connections.push({ from: parentNode.id, to: myNode.id });
                }
            }
        });

        return { nodes, connections };
    }

    openCareerSelector() {
        if (typeof window.openCareerSelector === 'function') {
            window.openCareerSelector();
        }
    }

    updateHUD() {
        if (!State.activeCareer) return;
        // const header = document.querySelector('#view-dashboard h2'); // REMOVED: Dashboard handles its own update now
        // if (header) header.innerText = State.activeCareer.name;
    }

    loadMockData() {
        // Generate a grid of nodes for testing rendering performance
        const nodes = [];
        const connections = [];
        const tiers = 5;
        const width = 4;

        for (let i = 0; i < tiers; i++) {
            for (let j = 0; j < width; j++) {
                const id = `node-${i}-${j}`;
                nodes.push({
                    id,
                    x: j * CONFIG.NODE_SPACING_X,
                    y: i * CONFIG.NODE_SPACING_Y,
                    label: `Module ${i}.${j}`,
                    type: i === 0 ? 'root' : 'skill',
                    status: i === 0 ? 'unlocked' : 'locked',
                    level: i,
                    data: { xp: 100, description: "System generated mock node." } // Mock data
                });

                if (i > 0) {
                    // Connect to parent in row above
                    connections.push({
                        from: `node-${i - 1}-${j}`,
                        to: id
                    });

                    // Cross connections
                    if (j > 0 && Math.random() > 0.5) {
                        connections.push({
                            from: `node-${i - 1}-${j - 1}`,
                            to: id
                        });
                    }
                }
            }
        }

        State.nodes = nodes;
        State.connections = connections;

        // Center view on first node
        if (nodes.length > 0) {
            this.centerViewOn(nodes[0].x, nodes[0].y);
        }

        this.render();
        this.renderSyllabus({ name: 'Simulation Protocol' }, nodes); // Mock syllabus
        this.hideLoader(); // FIX: Remove loader after mock load
    }

    zoomIn() {
        State.view.scale = Math.min(State.view.scale + 0.2, CONFIG.ZOOM_MAX);
        this.updateTransform();
    }

    zoomOut() {
        State.view.scale = Math.max(State.view.scale - 0.2, CONFIG.ZOOM_MIN);
        this.updateTransform();
    }

    resetView() {
        State.view.scale = 1;
        State.view.x = 0;
        State.view.y = 0;
        this.updateTransform();

        // Re-center on root
        const root = State.nodes.find(n => n.type === 'root');
        if (root) this.centerViewOn(root.x, root.y);
    }

    // --- RENDERING ---
    render() {
        this.renderConnections();
        this.renderNodes();
        this.updateTransform();
    }

    renderNodes() {
        this.layers.nodes.innerHTML = '';

        // Rectangular dimensions
        const rectW = 180;
        const rectH = 60;
        const radius = 12;

        State.nodes.forEach(node => {
            const el = document.createElementNS("http://www.w3.org/2000/svg", "g");
            el.setAttribute("class", `node-group ${node.status}`);
            // Center the rect on the coordinate (x - w/2, y - h/2)
            el.setAttribute("transform", `translate(${node.x}, ${node.y})`);
            el.dataset.id = node.id;

            // Glow Effect (behind rect)
            const glow = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            glow.setAttribute("x", -rectW / 2);
            glow.setAttribute("y", -rectH / 2);
            glow.setAttribute("width", rectW);
            glow.setAttribute("height", rectH);
            glow.setAttribute("rx", radius);
            glow.setAttribute("ry", radius);
            glow.setAttribute("class", "node-glow");

            // Main Shape (Rectangle)
            const shape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            shape.setAttribute("x", -rectW / 2);
            shape.setAttribute("y", -rectH / 2);
            shape.setAttribute("width", rectW);
            shape.setAttribute("height", rectH);
            shape.setAttribute("rx", radius);
            shape.setAttribute("ry", radius);
            shape.setAttribute("class", "node-shape");

            // Label (Centered)
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 0);
            text.setAttribute("y", 5); // Slight optical adjustment for vertical center
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("class", "node-label");
            text.textContent = node.label;

            el.appendChild(glow);
            el.appendChild(shape);
            el.appendChild(text);

            // Interaction
            el.style.cursor = 'pointer';
            el.onclick = (e) => {
                e.stopPropagation(); // Prevent drag start
                window.openNodeDetail(node);
            };

            this.layers.nodes.appendChild(el);
        });
    }

    // --- MODAL LOGIC ---
    openNodeDetail(node) {
        // defined globally below, calling it here for class method fallback
        if (window.openNodeDetail) window.openNodeDetail(node);
    }

    renderConnections() {
        this.layers.connections.innerHTML = '';

        State.connections.forEach(conn => {
            const startNode = State.nodes.find(n => n.id === conn.from);
            const endNode = State.nodes.find(n => n.id === conn.to);

            if (!startNode || !endNode) return;

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

            // Bezier Curve Logic
            const deltaY = endNode.y - startNode.y;
            const controlOffset = deltaY * 0.5;

            const d = `M ${startNode.x} ${startNode.y} 
                       C ${startNode.x} ${startNode.y + controlOffset}, 
                         ${endNode.x} ${endNode.y - controlOffset}, 
                         ${endNode.x} ${endNode.y}`;

            path.setAttribute("d", d);
            path.setAttribute("class", "connection-line");

            this.layers.connections.appendChild(path);
        });
    }

    updateTransform() {
        // Apply global transform to the main group inside SVG
        // Note: We need a group wrapping everything for pan/zoom
        const transform = `translate(${State.view.x}, ${State.view.y}) scale(${State.view.scale})`;

        // Optimization: Apply to the container group instead of re-rendering
        // Assuming HTML structure has <g id="viewport">
        const viewport = document.getElementById('viewport-group');
        if (viewport) {
            viewport.setAttribute("transform", transform);
        }
    }

    // --- INTERACTION ---
    setupEventListeners() {
        // Pan & Zoom
        this.svg.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                State.view.isDragging = true;
                State.view.lastMouse = { x: e.clientX, y: e.clientY };
                this.svg.style.cursor = 'grabbing';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (State.view.isDragging) {
                const dx = e.clientX - State.view.lastMouse.x;
                const dy = e.clientY - State.view.lastMouse.y;

                State.view.x += dx;
                State.view.y += dy;
                State.view.lastMouse = { x: e.clientX, y: e.clientY };

                this.updateTransform();
            }
        });

        window.addEventListener('mouseup', () => {
            State.view.isDragging = false;
            this.svg.style.cursor = 'grab';
        });

        this.svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = -e.deltaY * CONFIG.ZOOM_SENSITIVITY;
            const newScale = Math.min(Math.max(State.view.scale + delta, CONFIG.ZOOM_MIN), CONFIG.ZOOM_MAX);

            // Zoom towards mouse pointer logic (simplified for now)
            State.view.scale = newScale;
            this.updateTransform();
        });
    }

    startRenderLoop() {
        // Optional: requestAnimationFrame for smooth animations
    }

    centerViewOn(x, y) {
        // Calculate offsets to center (x,y)
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        State.view.x = (width / 2) - (x * State.view.scale);
        State.view.y = (height / 2) - (y * State.view.scale);

        this.updateTransform();
    }

    showError(msg) {
        console.error(msg);
    }
}

// --- UI LOGIC (SELECTOR) ---

// --- UI LOGIC (SELECTOR) ---

window.openCareerSelector = async function () {
    const modal = document.getElementById('modal-career-selector');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        await window.renderCareerList();
    }
};

window.closeCareerSelector = function () {
    const modal = document.getElementById('modal-career-selector');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.renderCareerList = async function () {
    const container = document.getElementById('career-list-grid');
    if (!container) return;

    container.innerHTML = '<div class="text-white text-center col-span-2">Loading Protocols...</div>';

    try {
        const token = localStorage.getItem('token');
        // Fetch ALL skills (Admin added ones included)
        const res = await fetch(`${API_BASE_URL}/api/explore/skills`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const skills = await res.json();

        container.innerHTML = '';

        if (skills.length === 0) {
            container.innerHTML = '<div class="text-slate-500 italic col-span-2 text-center">No protocols found.</div>';
            return;
        }

        skills.forEach(skill => {
            const el = document.createElement('div');
            el.className = 'group p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 hover:border-blue-500/30 transition cursor-pointer flex items-center gap-6';
            el.onclick = () => window.initiateSwitch(skill);

            el.innerHTML = `
                <div class="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 text-2xl group-hover:scale-110 transition">
                    <i class="fas ${skill.icon || 'fa-cube'}"></i>
                </div>
                <div>
                    <h4 class="text-white font-bold text-lg mb-1">${skill.name}</h4>
                    <p class="text-[10px] text-slate-500 uppercase tracking-widest">${skill.description || 'System Protocol'}</p>
                </div>
            `;
            container.appendChild(el);
        });

    } catch (error) {
        console.error("Failed to load skills:", error);
        container.innerHTML = '<div class="text-red-500 text-center col-span-2">Connection Interrupted</div>';
    }
};

let pendingSkillSwitch = null;

window.initiateSwitch = function (skill) {
    pendingSkillSwitch = skill;
    // Show Confirm Modal
    const modal = document.getElementById('modal-confirm-switch');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    // Bind Confirm Button
    const confirmBtn = document.getElementById('btn-confirm-switch');
    if (confirmBtn) {
        confirmBtn.onclick = () => window.confirmSwitch();
    }
};

window.closeConfirmModal = function () {
    const modal = document.getElementById('modal-confirm-switch');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    pendingSkillSwitch = null;
};

// --- TOAST SYSTEM ---
window.showToast = function (message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `min-w-[300px] p-4 rounded-xl border backdrop-blur-md shadow-2xl transform transition-all duration-300 translate-x-10 opacity-0 flex items-center gap-4 pointer-events-auto`;

    // Colors based on type
    if (type === 'error') {
        el.className += ' bg-red-500/10 border-red-500/20 text-red-200';
        el.innerHTML = `<i class="fas fa-exclamation-circle text-red-500 text-xl"></i>`;
    } else if (type === 'success') {
        el.className += ' bg-emerald-500/10 border-emerald-500/20 text-emerald-200';
        el.innerHTML = `<i class="fas fa-check-circle text-emerald-500 text-xl"></i>`;
    } else {
        el.className += ' bg-blue-500/10 border-blue-500/20 text-blue-200';
        el.innerHTML = `<i class="fas fa-info-circle text-blue-500 text-xl"></i>`;
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = 'text-sm font-bold';
    msgDiv.innerText = message;
    el.appendChild(msgDiv);

    container.appendChild(el);

    // Animate In
    requestAnimationFrame(() => {
        el.classList.remove('translate-x-10', 'opacity-0');
    });

    // Auto Remove
    setTimeout(() => {
        el.classList.add('translate-x-10', 'opacity-0');
        setTimeout(() => el.remove(), 300);
    }, 4000);
};

window.confirmSwitch = async function () {
    if (!pendingSkillSwitch) return;

    const skillToSwitch = pendingSkillSwitch; // CAPTURE SELECTION BEFORE CLOSING MODAL

    window.closeConfirmModal();
    window.closeCareerSelector();

    // Show global loader
    const loader = document.getElementById('zenith-loader');
    if (loader) {
        loader.style.display = 'flex';
        loader.style.opacity = '1';
    }

    try {
        // Call API to set active career
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/explore/careermode/select`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ skillId: skillToSwitch._id, action: 'add' })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Server rejected request');
        }

        // Simply reload the page to refresh all states fresh
        window.location.reload();

    } catch (error) {
        console.error("Switch failed", error);
        if (loader) loader.style.display = 'none';

        if (window.showToast) {
            window.showToast(error.message || "Connection Error", 'error');
        } else {
            console.error("Fallback Alert:", error.message);
        }
    }
};

window.openNodeDetail = function (node) {
    const detailContainer = document.getElementById('modal-node-detail');
    if (!detailContainer) return;

    // Populate Content using the "Technical Intelligence Card" Design
    const isCompleted = node.status === 'mastered';
    const isLocked = node.status === 'locked';

    // Define Button State
    let buttonHtml = '';
    if (isLocked) {
        buttonHtml = `
            <button disabled class="w-full py-4 rounded-2xl flex items-center justify-center space-x-3 font-bold text-sm tracking-wide bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed">
                <i class="fas fa-lock grayscale"></i>
                <span>LOCKED PROTOCOL</span>
            </button>`;
    } else if (isCompleted) {
        buttonHtml = `
            <button disabled class="w-full py-4 rounded-2xl flex items-center justify-center space-x-3 font-bold text-sm tracking-wide bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default">
                <i class="fas fa-check-circle"></i>
                <span>ALREADY MASTERED</span>
            </button>`;
    } else {
        buttonHtml = `
            <button onclick="window.completeNode('${node.id}')" class="yt-button w-full py-4 rounded-2xl flex items-center justify-center space-x-3 font-bold text-sm tracking-wide hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-lg shadow-blue-900/20 group">
                <i class="fas fa-fingerprint group-hover:scale-110 transition"></i>
                <span>MARK AS COMPLETE (+${node.data.xp || 50} XP)</span>
            </button>`;
    }

    // Code Snippet (Mocking relevant code based on node title for immersion)
    const codeSnippet = `// ${node.label} Implementation
const ${node.label.replace(/[^a-zA-Z]/g, '')} = new Module({
    id: "${node.id}",
    status: "${node.status.toUpperCase()}",
    power: ${node.data.xp || 50}
});

// Initialize Protocol
${node.label.replace(/[^a-zA-Z]/g, '')}.execute();`;

    const cleanSnippet = codeSnippet.replace(/'/g, "\\'").replace(/\n/g, '\\n');

    const htmlRaw = `
        <div class="tech-card rounded-[2rem] p-8 md:p-12 overflow-y-auto custom-scrollbar w-full max-w-7xl h-[90vh] mx-auto relative bg-[#0a0a0a] border border-white/10 shadow-2xl scale-95 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]">
            
            <!-- Close Button -->
            <button onclick="window.closeNodeDetail()" class="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition z-50">
                <i class="fas fa-times text-slate-400"></i>
            </button>

            <!-- Header Section -->
            <div class="flex items-center justify-between mb-10">
                <div class="flex items-center space-x-5">
                    <div class="chip-icon p-3 rounded-xl bg-blue-500/10 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                        <i class="${node.data.icon || 'fas fa-code'} text-xl"></i>
                    </div>
                    <div>
                        <h2 class="text-xs font-black tracking-[0.3em] text-blue-500 uppercase mb-1">MODULE ${node.id ? node.id.substring(0, 4).toUpperCase() : '001'}</h2>
                        <h1 class="text-xl font-bold text-white">${node.label}</h1>
                    </div>
                </div>
                <div class="hidden md:block">
                    <span class="px-3 py-1 rounded-full border border-gray-800 text-[10px] font-medium text-gray-500 tracking-tighter">STK-MEM-${node.level}04</span>
                </div>
            </div>

            <!-- Content Grid -->
            <div class="grid grid-cols-1 gap-10">
                
                <!-- Definition & Points -->
                <div class="space-y-8">
                    <div class="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <p class="text-[16px] leading-relaxed text-gray-300">
                            <strong class="text-blue-400 font-semibold">${node.label}</strong>: ${node.data.description || 'Master the fundamentals of this technical concept to advance your architecture.'}
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <h3 class="text-white/50 text-xs font-bold uppercase tracking-widest">Architecture</h3>
                            <ul class="space-y-4">
                                <li class="flex items-start">
                                    <span class="custom-bullet w-2 h-2 bg-blue-500 rounded-sm inline-block mr-3 mt-2 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
                                    <span class="text-gray-300 text-sm">Stored in <strong class="text-white">Knowledge Graph</strong>.</span>
                                </li>
                                <li class="flex items-start">
                                    <span class="custom-bullet w-2 h-2 bg-blue-500 rounded-sm inline-block mr-3 mt-2 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
                                    <span class="text-gray-300 text-sm">Unlocks <strong class="text-white">Tier ${node.level + 1}</strong> capabilities.</span>
                                </li>
                            </ul>
                        </div>
                        <div class="space-y-4">
                            <h3 class="text-white/50 text-xs font-bold uppercase tracking-widest">Metadata</h3>
                            <div class="flex flex-wrap gap-2">
                                <span class="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-xs font-mono">xp: ${node.data.xp || 50}</span>
                                <span class="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-xs font-mono">time: ${node.data.estimatedHours || 2}h</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Code Section -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-white font-bold text-sm italic">Code Implementation:</h3>
                         <button id="copyBtn" class="glow-button px-5 py-2 rounded-xl text-xs font-bold text-blue-400 flex items-center space-x-2 transition-all" onclick="window.copyToClipboard('${cleanSnippet}')">
                            <span id="copyText">Copy Code</span>
                            <i id="copyIcon" class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="code-window bg-black border border-white/10 rounded-2xl p-6 overflow-hidden font-mono text-xs text-left">
                        <pre class="text-slate-300 leading-relaxed"><code class="language-javascript">${codeSnippet}</code></pre>
                    </div>
                </div>

                <!-- Action Section -->
                <div class="pt-4 border-t border-white/5">
                    <div class="flex flex-col items-center space-y-4">
                        <p class="text-xs text-gray-500 font-medium text-center">Complete this module to earn XP and progress:</p>
                        ${buttonHtml}
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 gap-4">
                <div class="flex space-x-6 uppercase tracking-widest">
                    <span>Performance: <span class="text-green-500">Optimized</span></span>
                    <span>Safety: <span class="text-blue-500">Thread-Safe</span></span>
                </div>
                <span class="font-mono text-gray-700">INTELLIGENCE_LAYER_01.INF</span>
            </div>
        </div>
    `;

    detailContainer.innerHTML = htmlRaw;

    // Show Modal
    detailContainer.classList.remove('hidden');
    detailContainer.classList.add('flex');
};

window.closeNodeDetail = function () {
    const modal = document.getElementById('modal-node-detail');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};


window.copyToClipboard = function (text) {
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        const copyText = document.getElementById('copyText');
        const copyIcon = document.getElementById('copyIcon');

        if (copyBtn) {
            // Transition UI to Success State
            copyText.innerText = 'Copied!';
            copyBtn.classList.add('copy-success');
            copyBtn.classList.add('border-emerald-500/50');
            copyBtn.classList.add('text-emerald-500');
            if (copyIcon) copyIcon.className = 'fas fa-check text-emerald-500';

            // Reset after 2 seconds
            setTimeout(() => {
                copyText.innerText = 'Copy Code';
                copyBtn.classList.remove('copy-success');
                copyBtn.classList.remove('border-emerald-500/50');
                copyBtn.classList.remove('text-emerald-500');
                if (copyIcon) copyIcon.className = 'fas fa-copy';
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
};

window.completeNode = async function (nodeId) {
    if (!State.activeCareer) return;

    const btn = document.querySelector('.yt-button');
    const originalHtml = btn ? btn.innerHTML : '';

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Synchronization...';
    }

    try {
        const token = localStorage.getItem('token');
        const skillId = State.activeCareer._id;

        const res = await fetch(`${API_BASE_URL}/api/explore/skills/${skillId}/topics/${nodeId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Transmission Failed');
        }

        // Success: Update UI
        if (window.showToast) window.showToast("Module Decrypted & Synchronized", "success");

        // Update local state
        const node = State.nodes.find(n => n.id === nodeId);
        if (node) node.status = 'mastered';

        // Update skillProgress in State
        if (data.skillProgress) {
            State.skillProgress = data.skillProgress;
        }

        if (data.user) {
            State.user = data.user;
        }

        // Re-open detail to show updated state (or just close it?)
        // Closing or re-rendering dashboard is better
        window.openNodeDetail(node);

        if (window.ZenithExplore) {
            window.ZenithExplore.render();
            window.ZenithExplore.renderDashboard(State.user, State.activeCareer, State.skillProgress);
        }

    } catch (error) {
        console.error("ZENITH // Uplink Error:", error);
        if (window.showToast) window.showToast(error.message, "error");
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    }
};

// --- INITIALIZATION ---
// Ensure the system boots when script loads
// --- CERTIFICATE SYSTEM ---

window.openCertificate = function () {
    const engine = window.ZenithExplore;
    if (!engine || !engine.currentUser) return;

    const user = engine.currentUser;
    const skill = engine.currentSkill;

    document.getElementById('cert-user-name').innerText = (user.name || user.username).toUpperCase();
    document.getElementById('cert-skill-name').innerText = skill.name.toUpperCase();
    document.getElementById('cert-date').innerText = new Date().toISOString().split('T')[0];
    document.getElementById('cert-id-val').innerText = 'Z-' + Math.floor(Math.random() * 90000 + 10000) + '-MOD';
    document.getElementById('cert-hash').innerText = '0x' + Math.random().toString(16).slice(2, 10).toUpperCase() + '_ZENITH_S';

    document.getElementById('modal-certificate').classList.remove('hidden');
    document.getElementById('modal-certificate').classList.add('flex');
};

window.closeCertificate = function () {
    document.getElementById('modal-certificate').classList.add('hidden');
    document.getElementById('modal-certificate').classList.remove('flex');
};

window.showAchievements = function () {
    if (window.showToast) window.showToast("Achievement System: Synchronizing with Kernel... (V2.0 coming soon)", "info");
    // Optionally open a small modal with current user achievements
    const engine = window.ZenithExplore;
    if (!engine || !engine.currentUser) return;

    const achievements = engine.currentUser.achievements || [];
    if (achievements.length === 0) {
        if (window.showToast) window.showToast("No official achievements detected in current protocol.", "info");
    } else {
        // Logic to show a list could go here
    }
};

window.downloadCertificate = async function () {
    const btn = document.getElementById('btn-cert-download');
    const area = document.getElementById('cert-capture-area');
    const userName = document.getElementById('cert-user-name').innerText;

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> Encrypting...';

    try {
        const canvas = await html2canvas(area, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#0a0a0a',
            logging: false
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width / 2, canvas.height / 2]
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Zenith_Credential_${userName.replace(/\s+/g, '_')}.pdf`);

        btn.innerHTML = '<i class="fas fa-check"></i> Export Success';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 3000);
    } catch (err) {
        console.error("Certificate Export Error:", err);
        btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Link Failure';
        btn.disabled = false;
    }
};

window.ZenithExplore = new ExploreEngine();

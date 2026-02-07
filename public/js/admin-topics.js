// ADMIN SYSTEM READY - REVAMPED VERSION
// MATCHES "NODETREE CANVAS PRO" DESIGN WITH ZENITH OS INTEGRATION

// --- SHARED STATE ---
const adminState = {
    // View State
    scale: 1,
    panning: false,
    pointX: 0,
    pointY: 0,
    startX: 0,
    startY: 0,
    viewInitialized: false,

    // Tool State
    activeTool: 'select', // select, add, connect, delete, paint
    selectedColor: '#3b82f6',
    connectSource: null,

    // Drag State
    isDragging: false,
    hasDragged: false,
    dragGroup: [], // Stores nodes that move together

    // UI State
    viewMode: 'list', // 'list' or 'map'
    isFullscreen: false
};

const NODE_COLORS = [
    '#ef4444', '#10b981', '#3b82f6', '#f59e0b',
    '#8b5cf6', '#0f172a', '#1e293b', '#475569'
];

// --- CORE UI ENTRY POINT ---
function openSkillBranchManager(id) {
    if (typeof openModal === 'function') openModal();
    const skill = state.skills.find(s => s._id === id);
    window.activeSkill = skill;
    adminState.viewMode = 'list';
    renderBranchContent();
}

function openVisualRoadmapDesigner(id) {
    if (typeof openModal === 'function') openModal();
    const skill = state.skills.find(s => s._id === id);
    window.activeSkill = skill;
    adminState.viewMode = 'map';
    renderBranchContent();
    setTimeout(adminResetView, 100);
}

function renderBranchContent() {
    const skill = window.activeSkill;
    if (!skill) return;

    const content = document.getElementById('modal-content');

    // Header for the Modal
    const headerHtml = `
        <div class="flex justify-between items-start mb-10 ${adminState.isFullscreen ? 'hidden' : ''}">
            <div>
                <span class="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] mb-2 inline-block">Architecture Suite // ${adminState.viewMode.toUpperCase()} VIEW</span>
                <h2 class="text-5xl font-black tracking-tighter uppercase syne">${skill.name}</h2>
            </div>
            <div class="flex gap-4 items-center">
                <button onclick="adminState.viewMode = 'list'; renderBranchContent();" class="px-6 py-3 ${adminState.viewMode === 'list' ? 'bg-red-600' : 'bg-white/5'} rounded-xl text-[10px] font-black uppercase tracking-widest transition">List View</button>
                <button onclick="adminState.viewMode = 'map'; renderBranchContent();" class="px-6 py-3 ${adminState.viewMode === 'map' ? 'bg-red-600' : 'bg-white/5'} rounded-xl text-[10px] font-black uppercase tracking-widest transition">Map View</button>
                <button onclick="openMetadataEditor()" class="p-3 bg-blue-600/20 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition"><i class="fas fa-cog"></i></button>
                <button onclick="closeModal()" class="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-red-600 rounded-xl transition group">
                    <i class="fas fa-times text-xl text-slate-400 group-hover:text-white"></i>
                </button>
            </div>
        </div>
    `;

    if (adminState.viewMode === 'list') {
        renderTopicsListHtml(skill, headerHtml);
    } else {
        renderTopicsMapHtml(skill, headerHtml);
    }
}

// --- LIST VIEW ---
function renderTopicsListHtml(skill, header) {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
        ${header}
        <div class="mb-8">
            <button onclick="openTopicForm()" class="px-10 py-5 bg-white/5 border border-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition">+ Add New Neural Layer</button>
        </div>
        <div class="grid grid-cols-1 gap-4 overflow-y-auto max-h-[60vh] custom-scrollbar pr-4">
            ${(skill.topics || []).map((t, i) => `
                <div class="glass-card p-6 rounded-3xl border-white/5 flex justify-between items-center group hover:border-red-600/20">
                    <div class="flex items-center gap-6">
                        <div class="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-[10px] font-black text-red-500">${i + 1}</div>
                        <div>
                            <h4 class="text-xl font-black uppercase tracking-tight">${t.title}</h4>
                            <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">${t.type} // ${t.xp || 50} XP</p>
                        </div>
                    </div>
                    <div class="flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                        <button onclick="openTopicForm('${t._id}')" class="text-[10px] font-black uppercase text-blue-500">Edit</button>
                        <button onclick="deleteTopic('${t._id}')" class="text-[10px] font-black uppercase text-red-500">Purge</button>
                    </div>
                </div>
            `).join('') || '<div class="p-20 text-center text-slate-700 italic border-2 border-dashed border-white/5 rounded-[3rem]">No nodes initialized.</div>'}
        </div>
    `;
}

// --- MAP VIEW ---
function renderTopicsMapHtml(skill, header) {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
        <div class="flex flex-col h-full overflow-hidden ${adminState.isFullscreen ? 'map-fullscreen-mode' : ''}">
            ${header}
            
            <div id="admin-map-container" class="flex-grow bg-[#050505] rounded-[3rem] border border-white/5 relative overflow-hidden cursor-crosshair ${adminState.isFullscreen ? 'rounded-none border-none' : ''}">
                <!-- SVG Vector Layer -->
                <svg id="admin-svg-layer" class="absolute inset-0 w-full h-full pointer-events-none">
                    <g id="admin-svg-group"></g>
                    <line id="admin-preview-line" stroke="#3b82f6" stroke-width="2" stroke-dasharray="8,8" style="display:none;"></line>
                </svg>

                <!-- HTML Pan Layer -->
                <div id="admin-pan-layer" class="absolute inset-0 pointer-events-none origin-top-left"></div>

                <!-- BOTTOM FLOATING TOOLBOX -->
                <div id="admin-toolbox" class="fixed bottom-10 left-1/2 -translate-x-1/2 flex gap-3 p-3 rounded-[2rem] bg-black/90 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(239,68,68,0.2)] z-50 transition-all duration-500 ${adminState.scale < 0.6 ? 'opacity-0 translate-y-20 pointer-events-none' : 'opacity-100 translate-y-0'}">
                    <button id="tool-select" onclick="setAdminTool('select')" class="tool-btn ${adminState.activeTool === 'select' ? 'active' : ''}" data-name="Navigate">
                        <i class="fas fa-mouse-pointer"></i>
                    </button>
                    <button id="tool-node" onclick="setAdminTool('add')" class="tool-btn ${adminState.activeTool === 'add' ? 'active' : ''}" data-name="New Node">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button id="tool-link" onclick="setAdminTool('connect')" class="tool-btn ${adminState.activeTool === 'connect' ? 'active' : ''}" data-name="Link Hub">
                        <i class="fas fa-link"></i>
                    </button>
                    <button id="tool-color" onclick="toggleColorPicker()" class="tool-btn ${adminState.activeTool === 'paint' ? 'active' : ''}" data-name="Styles">
                        <i class="fas fa-paint-brush"></i>
                    </button>
                    
                    <div id="color-picker-flyout" class="hidden absolute bottom-[5rem] left-1/2 -translate-x-1/2 grid grid-cols-4 gap-2 p-4 bg-black/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[60]">
                        ${NODE_COLORS.map(c => `
                            <button onclick="setAdminColor('${c}')" class="w-8 h-8 rounded-full transition hover:scale-125 border-2 ${adminState.selectedColor === c ? 'border-white' : 'border-transparent'}" style="background: ${c}"></button>
                        `).join('')}
                    </div>

                    <button id="tool-eraser" onclick="setAdminTool('delete')" class="tool-btn ${adminState.activeTool === 'delete' ? 'active' : ''}" data-name="Purge">
                        <i class="fas fa-eraser"></i>
                    </button>
                    
                    <div class="w-[1px] h-10 bg-white/10 mx-2"></div>
                    
                    <button onclick="autoLayoutNodes()" class="tool-btn text-red-500" data-name="Neural Align">
                        <i class="fas fa-magic"></i>
                    </button>
                    <button onclick="saveSkillChanges(window.activeSkill)" class="tool-btn text-green-500" data-name="Save Hub">
                        <i class="fas fa-save"></i>
                    </button>
                    <button onclick="toggleAdminFullscreen()" class="tool-btn" data-name="Immersive Mode">
                        <i class="fas ${adminState.isFullscreen ? 'fa-compress' : 'fa-expand'}"></i>
                    </button>
                </div>

                <!-- HUD VIEW CONTROLS (RIGHT) -->
                <div class="hud-controls">
                    <button onclick="zoomAdmin(1.2)" class="hud-btn" title="Zoom In"><i class="fas fa-plus"></i></button>
                    <button onclick="zoomAdmin(0.8)" class="hud-btn" title="Zoom Out"><i class="fas fa-minus"></i></button>
                    <button onclick="adminResetView()" class="hud-btn" title="Reset View"><i class="fas fa-crosshairs"></i></button>
                </div>
            </div>
        </div>

        <style>
            #admin-map-container {
                background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
                background-size: 40px 40px;
            }
            .tool-btn { 
                position: relative; width: 3.2rem; height: 3.2rem; border-radius: 1rem; display: flex; align-items: center; justify-content: center; 
                color: #94a3b8; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); background: transparent;
            }
            .tool-btn:hover { color: white; background: rgba(255,255,255,0.05); }
            .tool-btn.active { background: #ef4444; color: white; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4); }
            
            .tool-btn::after {
                content: attr(data-name);
                position: absolute; bottom: 5rem; left: 50%; padding: 0.6rem 1.2rem; background: #ef4444; color: white; font-size: 10px;
                font-weight: 900; border-radius: 1rem; white-space: nowrap; opacity: 0; pointer-events: none;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); transform: translate(-50%, 10px); border: none; text-transform: uppercase; letter-spacing: 0.1em;
                box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3);
            }
            .tool-btn:hover::after { opacity: 1; transform: translate(-50%, 0); }

            .roadmap-node-admin { 
                position: absolute; padding: 12px 24px; min-width: 160px; background: rgba(15, 23, 42, 0.9); 
                backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.05); border-radius: 1.5rem; cursor: pointer; user-select: none;
                display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
                z-index: 20; color: white; box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7); pointer-events: auto;
                transition: border-color 0.3s, box-shadow 0.3s, transform 0.2s;
            }
            .roadmap-node-admin.dragging { cursor: grabbing; box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.8); z-index: 100 !important; }
            .roadmap-node-admin.selected { border-color: #ef4444 !important; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.3); }
            
            .roadmap-node-admin .title { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; pointer-events: none; }
            .roadmap-node-admin .type { font-size: 7px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; margin-top: 0.25rem; pointer-events: none; color: #64748b; }

            .connection-path { 
                fill: none; stroke: #ffffff; stroke-width: 5; stroke-linecap: round; 
                pointer-events: stroke; cursor: pointer; transition: all 0.4s; 
                opacity: 0.8;
            }
            .connection-path:hover { 
                stroke: #ffffff; stroke-width: 8; filter: drop-shadow(0 0 20px rgba(255, 255, 255, 1)); 
                opacity: 1 !important;
            }

            .hud-controls { position: absolute; top: 2rem; right: 2rem; z-index: 30; display: flex; flex-direction: column; gap: 0.5rem; }
            .hud-btn { 
                width: 3rem; height: 3rem; border-radius: 0.75rem; background: rgba(0,0,0,0.6); 
                backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); 
                display: flex; align-items: center; justify-content: center; color: #94a3b8; transition: all 0.3s; 
            }
            .hud-btn:hover { color: white; background: rgba(255,255,255,0.1); transform: scale(1.05); }
        </style>
    `;

    setTimeout(() => {
        initAdminRoadmapCore();
        drawAdminMap();
        updateAdminCursor();
    }, 50);
}

// --- ROADMAP CORE LOGIC ---
function initAdminRoadmapCore() {
    const container = document.getElementById('admin-map-container');
    if (!container) return;

    // Background Interaction (Pan and Add)
    container.onmousedown = (e) => {
        if (e.target !== container && e.target.id !== 'admin-svg-layer') return;

        if (adminState.activeTool === 'add') {
            handleBackgroundAdd(e);
            return;
        }

        adminState.panning = true;
        adminState.startX = e.clientX - adminState.pointX;
        adminState.startY = e.clientY - adminState.pointY;
        container.style.cursor = 'grabbing';
    };

    window.onmousemove = (e) => {
        // Panning Logic
        if (adminState.panning) {
            adminState.pointX = e.clientX - adminState.startX;
            adminState.pointY = e.clientY - adminState.startY;
            updateAdminMapTransform();
            return;
        }

        // Dragging Logic
        if (adminState.isDragging && adminState.dragGroup.length > 0) {
            const rect = container.getBoundingClientRect();
            adminState.dragGroup.forEach(item => {
                // Calculation: (Current ClientPos - Offset - PanOffset) / Scale
                item.node.position.x = (e.clientX - item.offsetX - adminState.pointX) / adminState.scale;
                item.node.position.y = (e.clientY - item.offsetY - adminState.pointY) / adminState.scale;

                const el = document.getElementById(item.node._id);
                if (el) {
                    el.style.left = `${item.node.position.x}px`;
                    el.style.top = `${item.node.position.y}px`;
                }
            });
            adminState.hasDragged = true;
            drawMapConnections(); // Re-render SVG lines
            return;
        }

        // Link Preview Logic
        if (adminState.activeTool === 'connect' && adminState.connectSource) {
            const preview = document.getElementById('admin-preview-line');
            const rect = container.getBoundingClientRect();

            // Source in world space
            const x1 = adminState.connectSource.position.x * adminState.scale + adminState.pointX;
            const y1 = adminState.connectSource.position.y * adminState.scale + adminState.pointY;

            preview.setAttribute('x1', x1);
            preview.setAttribute('y1', y1);
            preview.setAttribute('x2', e.clientX - rect.left);
            preview.setAttribute('y2', e.clientY - rect.top);
            preview.style.display = 'block';
        } else {
            const preview = document.getElementById('admin-preview-line');
            if (preview) preview.style.display = 'none';
        }
    };

    window.onmouseup = () => {
        if (adminState.isDragging) {
            adminState.dragGroup.forEach(item => {
                const el = document.getElementById(item.node._id);
                if (el) el.classList.remove('dragging');
            });
            // Removed auto-save here
        }
        adminState.panning = false;
        adminState.isDragging = false;
        adminState.dragGroup = [];
        updateAdminCursor();
    };
}

function updateAdminMapTransform() {
    const layer = document.getElementById('admin-pan-layer');
    if (layer) layer.style.transform = `translate(${adminState.pointX}px, ${adminState.pointY}px) scale(${adminState.scale})`;
    drawMapConnections();
}

function drawAdminMap() {
    const layer = document.getElementById('admin-pan-layer');
    if (!layer) return;
    layer.innerHTML = '';

    const topics = window.activeSkill.topics || [];

    // Draw Nodes
    topics.forEach(t => {
        const div = document.createElement('div');
        div.id = t._id;
        div.className = 'roadmap-node-admin';
        div.style.left = `${t.position.x}px`;
        div.style.top = `${t.position.y}px`;
        div.style.backgroundColor = t.color || '#1e293b';
        div.style.borderColor = t.color ? `${t.color}66` : 'rgba(255,255,255,0.1)';
        div.style.transform = `translate(-50%, -50%)`;

        div.innerHTML = `
            <div class="title">${t.title}</div>
            <div class="type">${t.type}</div>
        `;

        div.onmousedown = (e) => {
            e.stopPropagation();
            adminState.hasDragged = false;
            handleNodeAction(t, e);
        };

        div.ondblclick = (e) => {
            e.stopPropagation();
            if (adminState.activeTool === 'select') {
                openTopicForm(t._id);
            }
        };

        layer.appendChild(div);
    });

    drawMapConnections();
    updateAdminMapTransform();
}

function drawMapConnections() {
    const group = document.getElementById('admin-svg-group');
    if (!group) return;
    group.innerHTML = '';

    const topics = window.activeSkill.topics || [];
    topics.forEach(t => {
        const parents = [];
        if (t.parent) parents.push(t.parent);
        if (t.parents && Array.isArray(t.parents)) parents.push(...t.parents);

        const uniqueParents = [...new Set(parents.map(p => p.toString()))];

        uniqueParents.forEach(pHandle => {
            const parent = topics.find(p => (p._id?.toString() === pHandle || p.title === pHandle));

            if (parent) {
                const x1 = parent.position.x * adminState.scale + adminState.pointX;
                const y1 = parent.position.y * adminState.scale + adminState.pointY;
                const x2 = t.position.x * adminState.scale + adminState.pointX;
                const y2 = t.position.y * adminState.scale + adminState.pointY;

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

                // --- INTELLIGENT BÉZIER LOGIC ---
                // We calculate control points based on the relative direction of the child
                const dx = x2 - x1;
                const dy = y2 - y1;

                let cp1x = x1, cp1y = y1, cp2x = x2, cp2y = y2;

                if (Math.abs(dx) > Math.abs(dy)) {
                    // SIDE BRANCH: Horizontal priority
                    cp1x = x1 + dx * 0.5;
                    cp1y = y1;
                    cp2x = x2 - dx * 0.5;
                    cp2y = y2;
                } else {
                    // SPINE: Vertical priority
                    cp1x = x1;
                    cp1y = y1 + dy * 0.4;
                    cp2x = x2;
                    cp2y = y2 - dy * 0.4;
                }

                const d = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

                path.setAttribute('d', d);
                path.setAttribute('class', 'connection-path');
                path.style.stroke = '#ffffff';
                path.style.opacity = '0.6';
                path.style.strokeWidth = '3px';

                path.onclick = (e) => {
                    if (adminState.activeTool === 'delete') {
                        openZenithConfirm(`SEVER CONNECTION?`, () => {
                            if (t.parent && t.parent.toString() === pHandle) t.parent = null;
                            if (t.parents) t.parents = t.parents.filter(p => p.toString() !== pHandle);
                            drawAdminMap();
                        });
                    }
                };

                group.appendChild(path);
            }
        });
    });
}

// --- NODE ACTIONS ---
function handleNodeAction(node, e) {
    if (adminState.activeTool === 'delete') {
        openZenithConfirm(`PURGE "${node.title.toUpperCase()}"?`, () => {
            deleteTopic(node._id);
        });
        return;
    }

    if (adminState.activeTool === 'paint') {
        node.color = adminState.selectedColor;
        drawAdminMap();
        return;
    }

    if (adminState.activeTool === 'connect') {
        if (!adminState.connectSource) {
            adminState.connectSource = node;
            document.getElementById(node._id).classList.add('selected');
        } else {
            if (adminState.connectSource._id !== node._id) {
                // Support multiple parents
                if (!node.parents) node.parents = [];
                // If legacy 'parent' exists, migrate it
                if (node.parent) {
                    if (!node.parents.includes(node.parent)) node.parents.push(node.parent);
                    node.parent = null;
                }

                const sourceId = adminState.connectSource._id.toString();
                if (node.parents.some(p => p.toString() === sourceId)) {
                    // Already connected? Then sever.
                    node.parents = node.parents.filter(p => p.toString() !== sourceId);
                } else {
                    // Connect
                    node.parents.push(sourceId);
                }

                adminState.connectSource = null;
                drawAdminMap(); // Instant visual feedback
            } else {
                adminState.connectSource = null;
                drawAdminMap();
            }
        }
        return;
    }

    if (adminState.activeTool === 'select') {
        adminState.isDragging = true;
        adminState.hasDragged = false;

        // Find ALL descendants in the tree for group drag
        const descendants = findNodeDescendants(node._id);
        const groupIds = [node._id, ...descendants];

        adminState.dragGroup = groupIds.map(id => {
            const n = window.activeSkill.topics.find(t => t._id.toString() === id.toString());
            if (!n) return null;

            const el = document.getElementById(id);
            if (el) el.classList.add('dragging');

            // Store offset relative to cursor
            const nodeClientX = n.position.x * adminState.scale + adminState.pointX;
            const nodeClientY = n.position.y * adminState.scale + adminState.pointY;

            return {
                node: n,
                offsetX: e.clientX - nodeClientX,
                offsetY: e.clientY - nodeClientY
            };
        }).filter(item => item !== null);
    }
}

function handleBackgroundAdd(e) {
    const container = document.getElementById('admin-map-container');
    if (!container) return;

    // Calculate world coordinates for the center of the container
    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;

    const wx = (centerX - adminState.pointX) / adminState.scale;
    const wy = (centerY - adminState.pointY) / adminState.scale;

    const newNode = {
        _id: 'temp_' + Date.now(),
        title: 'NEW LAYER',
        type: 'branch',
        position: { x: wx, y: wy },
        color: adminState.selectedColor,
        xp: 50,
        lectures: []
    };

    window.activeSkill.topics.push(newNode);
    drawAdminMap(); // Instant visual feedback
}

function findNodeDescendants(parentId) {
    let results = [];
    const children = window.activeSkill.topics
        .filter(t => {
            const p = [];
            if (t.parent) p.push(t.parent.toString());
            if (t.parents) t.parents.forEach(id => p.push(id.toString()));
            return p.includes(parentId.toString());
        })
        .map(t => t._id);

    children.forEach(childId => {
        results.push(childId);
        results = results.concat(findNodeDescendants(childId));
    });
    return [...new Set(results)];
}

// --- TOOL UI HELPERS ---
function setAdminTool(t) {
    adminState.activeTool = t;
    adminState.connectSource = null;
    document.getElementById('color-picker-flyout').classList.add('hidden');

    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tool-${t === 'add' ? 'node' : t === 'connect' ? 'link' : t === 'delete' ? 'eraser' : t}`);
    if (activeBtn) activeBtn.classList.add('active');

    updateAdminCursor();
    drawAdminMap();
}

function toggleColorPicker() {
    const flyout = document.getElementById('color-picker-flyout');
    flyout.classList.toggle('hidden');
    setAdminTool('paint');
}

function setAdminColor(c) {
    adminState.selectedColor = c;
    document.getElementById('color-picker-flyout').classList.add('hidden');
    renderBranchContent();
}

function updateAdminCursor() {
    const c = document.getElementById('admin-map-container');
    if (!c) return;
    if (adminState.activeTool === 'add') c.style.cursor = 'crosshair';
    else if (adminState.activeTool === 'connect') c.style.cursor = 'alias';
    else if (adminState.activeTool === 'delete') c.style.cursor = 'no-drop';
    else c.style.cursor = 'grab';
}

// --- UTILS & SYNC ---
async function saveSkillChanges(skill) {
    const sanitizedTopics = skill.topics.map(t => {
        const copy = JSON.parse(JSON.stringify(t));
        if (copy._id && copy._id.toString().startsWith('temp_')) delete copy._id;
        return copy;
    });

    try {
        const res = await fetch(`${API_BASE_URL}/api/explore/admin/skills/${skill._id}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ topics: sanitizedTopics })
        });

        if (res.ok) {
            showToast("CORE ARCHITECTURE SECURED", "success");
            window.activeSkill = await res.json();
            drawAdminMap();
        }
    } catch (e) {
        showToast("SYNC FAILED", "error");
    }
}

async function deleteTopic(id) {
    window.activeSkill.topics = window.activeSkill.topics.filter(t => t._id.toString() !== id.toString());
    drawAdminMap(); // Instant feedback
}

function zoomAdmin(factor) {
    const oldScale = adminState.scale;
    if (factor > 1) adminState.scale = Math.min(adminState.scale + 0.1, 3);
    else adminState.scale = Math.max(adminState.scale - 0.1, 0.2);

    // Zoom around center (simple approach)
    // adminState.pointX = ... logic could be added here for localized zoom
    updateAdminMapTransform();
    updateHudVisibility();
}

function adminResetView() {
    const container = document.getElementById('admin-map-container');
    if (!container) return;
    adminState.pointX = container.offsetWidth / 2;
    adminState.pointY = container.offsetHeight / 2;
    adminState.scale = 0.8;
    updateAdminMapTransform();
    updateHudVisibility();
}

function updateHudVisibility() {
    const toolbox = document.getElementById('admin-toolbox');
    if (!toolbox) return;
    if (adminState.scale < 0.6) {
        toolbox.classList.add('opacity-0', 'translate-y-20', 'pointer-events-none');
        toolbox.classList.remove('opacity-100', 'translate-y-0');
    } else {
        toolbox.classList.remove('opacity-0', 'translate-y-20', 'pointer-events-none');
        toolbox.classList.add('opacity-100', 'translate-y-0');
    }
}

function toggleAdminFullscreen() {
    adminState.isFullscreen = !adminState.isFullscreen;
    const modal = document.getElementById('hyper-modal');
    if (adminState.isFullscreen) modal.classList.add('full-screen-modal');
    else modal.classList.remove('full-screen-modal');
    renderBranchContent();
}

function autoLayoutNodes() {
    const topics = window.activeSkill.topics || [];
    if (topics.length === 0) return;

    const childrenMap = {};
    const getParents = (node) => {
        const p = [];
        if (node.parent) p.push(node.parent.toString());
        if (node.parents) node.parents.forEach(id => p.push(id.toString()));
        return [...new Set(p)];
    };

    topics.forEach(t => {
        const parents = getParents(t);
        parents.forEach(pId => {
            if (!childrenMap[pId]) childrenMap[pId] = [];
            childrenMap[pId].push(t);
        });
    });

    const roots = topics.filter(t => getParents(t).length === 0);
    const positioned = new Set();
    const leafGapX = 180;
    const spineGapY = 140;

    /**
     * Advanced Mind-Map Spine Layout:
     * - Roots at center-top.
     * - Main path nodes (with children) form a vertical spine.
     * - Leaf nodes (no children) branch out horizontally.
     */
    function layoutSpineAndBranch(node, centerX, centerY) {
        if (positioned.has(node._id.toString())) return;
        positioned.add(node._id.toString());

        node.position = { x: centerX, y: centerY };

        const children = childrenMap[node._id.toString()] || [];
        if (children.length === 0) return;

        // Separate leaves and sub-trees
        const leaves = children.filter(c => (childrenMap[c._id.toString()] || []).length === 0);
        const subtrees = children.filter(c => (childrenMap[c._id.toString()] || []).length > 0);

        // 1. Arrange leaves to the sides (Alternate Left/Right)
        leaves.forEach((leaf, idx) => {
            const isLeft = idx % 2 === 0;
            const sideIndex = Math.floor(idx / 2);
            // We place leaves at side offsets and spread them slightly vertically if many
            const lx = centerX + (isLeft ? -leafGapX : leafGapX);
            const ly = centerY + (sideIndex * 50);
            leaf.position = { x: lx, y: ly };
            positioned.add(leaf._id.toString());
        });

        // 2. Continue spine vertically for nodes that have children
        if (subtrees.length > 0) {
            // Calculate next spine start
            const nextY = centerY + spineGapY + (Math.ceil(leaves.length / 2) * 20);

            // If multiple subtrees, spread them briefly then continue
            const subTreeWidth = (subtrees.length - 1) * 300;
            let currentX = centerX - subTreeWidth / 2;

            subtrees.forEach(st => {
                layoutSpineAndBranch(st, currentX, nextY);
                currentX += 300;
            });
        }
    }

    // Process roots
    let initialX = 0;
    roots.forEach(root => {
        layoutSpineAndBranch(root, initialX, 200);
        initialX += 800; // Spacing between different root trees
    });

    adminResetView();
    drawAdminMap();
}

// --- FORM EDITORS ---
function openMetadataEditor() {
    const skill = window.activeSkill;
    const overlay = document.createElement('div');
    overlay.id = 'metadata-editor-overlay';
    overlay.className = 'fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-20';
    overlay.innerHTML = `
        <div class="w-full max-w-4xl glass-card p-16 rounded-[4rem] relative">
            <button onclick="document.getElementById('metadata-editor-overlay').remove()" class="absolute top-10 right-10 text-slate-500 hover:text-white transition">
                <i class="fas fa-times text-3xl"></i>
            </button>
            <h2 class="text-5xl font-black uppercase syne tracking-tighter mb-16">System Core // Metadata</h2>
            
            <form id="meta-form" class="space-y-12">
                <div class="grid grid-cols-2 gap-10">
                    <div>
                        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Designation</label>
                        <input name="name" class="input-zenith" value="${skill.name}" required>
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Taxonomy</label>
                        <input name="category" class="input-zenith" value="${skill.category || 'Other'}">
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Icon (FA)</label>
                        <input name="icon" class="input-zenith" value="${skill.icon || 'fa-code'}">
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Skill Color</label>
                        <input name="color" type="color" class="w-full h-14 rounded-xl bg-white/5 border-none" value="${skill.color || '#3b82f6'}">
                    </div>
                </div>
                <div>
                     <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Mission Briefing</label>
                     <textarea name="description" class="input-zenith min-h-[100px]">${skill.description || ''}</textarea>
                </div>
                <button type="submit" class="w-full py-6 bg-red-600 rounded-[2rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl shadow-red-600/30">UPDATE SYSTEM CORE</button>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('meta-form').onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const updates = Object.fromEntries(fd.entries());

        const res = await fetch(`${API_BASE_URL}/api/explore/admin/skills/${skill._id}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (res.ok) {
            showToast("METADATA SYNCED", "success");
            window.activeSkill = await res.json();
            document.getElementById('metadata-editor-overlay').remove();
            renderBranchContent();
        }
    };
}

function openTopicForm(topicId = null) {
    const topic = topicId ? window.activeSkill.topics.find(t => t._id.toString() === topicId.toString()) : { title: '', xp: 50, type: 'branch', content: '', lectures: [] };

    const overlay = document.createElement('div');
    overlay.id = 'topic-editor-overlay';
    overlay.className = 'fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-20';
    overlay.innerHTML = `
        <div class="w-full max-w-5xl glass-card p-16 rounded-[4rem] relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onclick="document.getElementById('topic-editor-overlay').remove()" class="absolute top-10 right-10 text-slate-500 hover:text-white transition">
                <i class="fas fa-times text-3xl"></i>
            </button>
            <h2 class="text-5xl font-black uppercase syne tracking-tighter mb-16">${topicId ? 'Edit Neural Layer' : 'Initialize Layer'}</h2>
            
            <form id="topic-form" class="space-y-12">
                <div class="grid grid-cols-2 gap-10">
                    <div>
                        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Layer Title</label>
                        <input name="title" class="input-zenith" value="${topic.title}" required>
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">XP Reward</label>
                        <input name="xp" type="number" class="input-zenith" value="${topic.xp}">
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Type</label>
                        <select name="type" class="input-zenith">
                            <option value="main" ${topic.type === 'main' ? 'selected' : ''}>Main Path</option>
                            <option value="branch" ${topic.type === 'branch' ? 'selected' : ''}>Branch</option>
                            <option value="sub" ${topic.type === 'sub' ? 'selected' : ''}>Sub-topic</option>
                        </select>
                    </div>
                </div>
                <div>
                     <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Technical Intelligence (Markdown)</label>
                     <textarea name="content" class="input-zenith min-h-[200px]">${topic.content || ''}</textarea>
                </div>

                <!-- LECTURES -->
                <div class="bg-[#050505] p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <h4 class="text-sm font-black uppercase text-white tracking-[0.2em] mb-8">Lecture Series</h4>
                    
                    <!-- Existing Lectures List -->
                    <div id="lecture-list" class="space-y-4 mb-8"></div>
                    
                    <!-- Add New Lecture Form -->
                    <div class="grid grid-cols-[1fr_1fr_auto] gap-4 items-end bg-white/5 p-6 rounded-2xl border border-white/5">
                        <div class="flex-grow">
                            <label class="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-2">Lecture Title</label>
                            <input id="new-lec-title" placeholder="e.g. Tutorial Vector" class="w-full bg-[#0a0a0a] border border-white/10 text-white px-5 py-4 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 transition placeholder-slate-700">
                        </div>
                        <div class="flex-grow">
                            <label class="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-2">Video Resource URL</label>
                            <input id="new-lec-url" placeholder="https://youtube.com/..." class="w-full bg-[#0a0a0a] border border-white/10 text-white px-5 py-4 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 transition placeholder-slate-700">
                        </div>
                        <button type="button" onclick="searchYouTubeForLecture()" class="h-[50px] w-[50px] bg-white/5 border border-white/10 rounded-xl hover:bg-red-600 hover:border-red-500 text-slate-400 hover:text-white transition flex items-center justify-center text-lg shadow-lg group">
                            <i class="fab fa-youtube transform group-hover:scale-110 transition-transform"></i>
                        </button>
                    </div>
                    
                    <button type="button" onclick="addLectureToTopicEditor()" class="mt-4 w-full py-4 bg-white/5 border border-white/5 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition flex items-center justify-center gap-2">
                        <i class="fas fa-plus"></i> Add Lecture Vector
                    </button>
                </div>

                <button type="submit" class="w-full py-6 bg-blue-600 rounded-[2rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl shadow-blue-600/30 hover:bg-blue-500 transition-all transform hover:scale-[1.01]">COMMIT LAYER DATA</button>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);
    window.editingTopic = JSON.parse(JSON.stringify(topic));
    renderTopicEditorLectures();

    document.getElementById('topic-form').onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());
        data.lectures = window.editingTopic.lectures || [];

        const idx = window.activeSkill.topics.findIndex(t => t._id.toString() === (topicId ? topicId.toString() : 'null'));
        if (idx !== -1) {
            window.activeSkill.topics[idx] = { ...window.activeSkill.topics[idx], ...data };
        } else {
            data._id = 'temp_' + Date.now();
            data.position = { x: 500, y: 500 };
            window.activeSkill.topics.push(data);
        }

        await saveSkillChanges(window.activeSkill);
        document.getElementById('topic-editor-overlay').remove();
    };
}

function renderTopicEditorLectures() {
    const list = document.getElementById('lecture-list');
    if (!list) return;
    const lectures = window.editingTopic.lectures || [];
    list.innerHTML = lectures.map((l, i) => `
        <div class="group flex items-center bg-[#0a0a0a] rounded-xl border border-white/5 p-1 relative overflow-hidden">
             <!-- Styled as Input-like display -->
             <div class="flex-grow px-5 py-4 flex flex-col justify-center">
                <div class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">VECTOR ${i + 1}</div>
                <div class="text-xs font-bold text-white truncate w-full font-mono text-emerald-400">
                    <span class="text-white font-sans opacity-50 mr-2">${l.title} //</span> ${l.videoUrl || 'No Link'}
                </div>
             </div>
             
             <button type="button" onclick="window.editingTopic.lectures.splice(${i},1); renderTopicEditorLectures();" class="w-12 h-full absolute right-0 top-0 bottom-0 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white transition flex items-center justify-center border-l border-white/5 backdrop-blur-sm">
                <i class="fas fa-trash"></i>
             </button>
        </div>
    `).join('') || '';
}

function addLectureToTopicEditor() {
    const title = document.getElementById('new-lec-title').value;
    const url = document.getElementById('new-lec-url').value;
    if (!title) return;
    if (!window.editingTopic.lectures) window.editingTopic.lectures = [];
    window.editingTopic.lectures.push({ title, videoUrl: url });
    document.getElementById('new-lec-title').value = '';
    document.getElementById('new-lec-url').value = '';
    renderTopicEditorLectures();
}

function searchYouTubeForLecture() {
    const titleVal = document.getElementById('new-lec-title').value;
    const topicVal = document.querySelector('input[name="title"]').value;
    const query = titleVal ? `Unity C# ${titleVal} tutorial` : `Unity C# ${topicVal} tutorial`;
    if (query.trim() === 'Unity C#  tutorial') return; // Empty Search
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
}

function openZenithConfirm(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center';
    overlay.innerHTML = `
        <div class="glass-card p-12 rounded-[3rem] border-white/10 text-center max-w-md">
            <h3 class="text-xs font-black text-red-500 uppercase tracking-[0.4em] mb-6">Security Protocol</h3>
            <p class="text-2xl font-black uppercase syne tracking-tight mb-10 text-white">${message}</p>
            <div class="flex gap-4">
                <button id="z-confirm-yes" class="flex-grow py-5 bg-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition">Execute Purge</button>
                <button id="z-confirm-no" class="flex-grow py-5 bg-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition">Abort</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#z-confirm-yes').onclick = () => {
        onConfirm();
        overlay.remove();
    };
    overlay.querySelector('#z-confirm-no').onclick = () => overlay.remove();
}

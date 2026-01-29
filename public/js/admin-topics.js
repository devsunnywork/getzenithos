
function openTopicForm(topicId = null) {
    const skill = window.activeSkill;
    const topic = topicId ? skill.topics.find(t => t._id.toString() === topicId.toString()) : { title: '', xp: 50, description: '', lectures: [], content: '' };

    // Store for lecture manipulation
    window.currentEditingTopic = JSON.parse(JSON.stringify(topic)); // Deep copy to avoid direct mutation until save

    document.getElementById('modal-content').innerHTML = `
        <div class="flex justify-between items-center mb-10">
            <h2 class="text-4xl font-black uppercase syne tracking-tighter">${topicId ? 'Edit Neural Layer' : 'New Neural Layer'}</h2>
            <button onclick="renderBranchContent()" class="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white">
                <i class="fas fa-arrow-left mr-2"></i> Return to Index
            </button>
        </div>

        <form id="topic-form" class="space-y-8 max-w-4xl mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <!-- Left Column: Basics -->
                <div class="space-y-6">
                    <div>
                        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Layer Designation (Title)</label>
                        <input id="t-title" type="text" value="${topic.title}" class="input-zenith" required>
                    </div>
                    <div class="grid grid-cols-2 gap-8">
                         <div>
                            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">XP Reward</label>
                            <input id="t-xp" type="number" value="${topic.xp || 50}" class="input-zenith">
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Type</label>
                            <select id="t-type" class="input-zenith">
                                <option value="main" ${topic.type === 'main' ? 'selected' : ''}>Main Path</option>
                                <option value="branch" ${topic.type === 'branch' ? 'selected' : ''}>Branch</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Briefing</label>
                        <textarea id="t-desc" rows="4" class="input-zenith">${topic.description || ''}</textarea>
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Technical Content (Markdown)</label>
                        <textarea id="t-content" rows="6" class="input-zenith">${topic.content || ''}</textarea>
                    </div>
                </div>

                <!-- Right Column: Logistics -->
                <div class="space-y-6 bg-white/5 p-8 rounded-[2rem] border border-white/5">
                     <h3 class="text-xl font-black uppercase syne mb-6">Logistics & Mission Assets</h3>
                     <div>
                        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Mission Highlights (Important Points / Bullets)</label>
                        <textarea id="t-points" rows="4" class="input-zenith" placeholder="Point 1&#10;Point 2...">${topic.importantPoints || ''}</textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-8">
                        <div>
                            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">PDF Documentation URL</label>
                            <input id="t-pdf" type="text" value="${topic.pdfUrl || ''}" class="input-zenith" placeholder="https://...">
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Legacy Video URL (Flat)</label>
                            <input id="t-video" type="text" value="${topic.videoUrl || ''}" class="input-zenith" placeholder="https://...">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Lectures Section -->
            <div class="bg-blue-600/5 p-10 rounded-[3rem] border border-blue-500/10">
                <h3 class="text-2xl font-black uppercase syne mb-10 tracking-tighter">Neural Lecture Sync Protocol</h3>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div id="topic-lectures-list" class="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar"></div>
                    
                    <div class="space-y-4 pt-6 lg:pt-0 lg:border-l lg:border-white/5 lg:pl-10">
                        <h4 class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Add / Update Lecture Layer</h4>
                        <input id="tl-title" placeholder="Lecture Title" class="input-zenith py-3 text-xs">
                        <input id="tl-url" placeholder="Video URL (Embed/YouTube)" class="input-zenith py-3 text-xs">
                        <textarea id="tl-notes" rows="2" placeholder="Lecture Notes / Transcript" class="input-zenith py-3 text-xs"></textarea>
                        
                        <div class="flex gap-4">
                            <button type="button" onclick="addLectureToCurrentTopic()" id="btn-add-lec" class="flex-1 py-3 bg-green-500/20 text-green-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500/30">
                                <i class="fas fa-plus mr-2"></i> Add Layer
                            </button>
                            <button type="button" onclick="resetLectureInputs()" class="px-4 py-3 bg-white/5 rounded-xl text-slate-500 hover:text-white">
                                <i class="fas fa-undo"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <button type="submit" class="w-full py-6 bg-blue-600 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-600/30">
                ${topicId ? 'Update & Sync Sequence' : 'Initialize Logic Layer'}
            </button>
        </form>
    `;

    renderTopicLectures();

    document.getElementById('topic-form').onsubmit = async (e) => {
        e.preventDefault();
        const newTopic = {
            ...topic, // Preserve existing fields (position, etc.)
            title: document.getElementById('t-title').value,
            xp: parseInt(document.getElementById('t-xp').value) || 0,
            type: document.getElementById('t-type').value,
            description: document.getElementById('t-desc').value,
            content: document.getElementById('t-content').value,
            importantPoints: document.getElementById('t-points').value,
            pdfUrl: document.getElementById('t-pdf').value,
            videoUrl: document.getElementById('t-video').value,
            lectures: window.currentEditingTopic.lectures || []
        };

        if (topicId) {
            // Find index using string comparison
            const idx = skill.topics.findIndex(t => t._id.toString() === topicId.toString());
            if (idx !== -1) {
                // Update and preserve ID
                skill.topics[idx] = { ...skill.topics[idx], ...newTopic, _id: skill.topics[idx]._id };
            }
        } else {
            if (!skill.topics) skill.topics = [];
            // Let backend generate _id for new entries
            skill.topics.push(newTopic);
        }

        await saveSkillChanges(skill);
        renderBranchContent();
    };
}

function renderTopicLectures() {
    const list = document.getElementById('topic-lectures-list');
    const lectures = window.currentEditingTopic.lectures || [];

    if (lectures.length === 0) {
        list.innerHTML = '<div class="text-[10px] text-slate-600 italic text-center p-4 border border-dashed border-white/5 rounded-xl">No lectures initialized.</div>';
        return;
    }

    list.innerHTML = lectures.map((lec, i) => `
        <div class="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5 group hover:border-blue-500/30 transition">
             <div class="flex-1 min-w-0 mr-4">
                <div class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Layer ${i + 1}</div>
                <div class="text-xs font-bold text-white truncate">${lec.title}</div>
            </div>
            <div class="flex items-center gap-3">
                <button type="button" onclick="editTopicLecture(${i})" class="text-[9px] font-black text-cyan-500 uppercase tracking-widest hover:text-cyan-400">Edit</button>
                <button type="button" onclick="removeTopicLecture(${i})" class="text-[9px] font-black text-red-500 uppercase tracking-widest hover:text-red-400">Purge</button>
            </div>
        </div>
    `).join('');
}

function addLectureToCurrentTopic() {
    const title = document.getElementById('tl-title').value;
    const url = document.getElementById('tl-url').value;
    const notes = document.getElementById('tl-notes').value;

    if (!title) return alert("Lecture title required");

    if (!window.currentEditingTopic.lectures) window.currentEditingTopic.lectures = [];

    // Check if we are updating (hidden index not used here, checking global editing index if we want, or just simple push)
    // User requested edit capability. I should handle update.
    if (window.editingLectureIndex !== undefined && window.editingLectureIndex !== null) {
        window.currentEditingTopic.lectures[window.editingLectureIndex] = { title, videoUrl: url, notes }; // Map url (input) to videoUrl (schema)
        window.editingLectureIndex = null;
        document.getElementById('btn-add-lec').innerHTML = '<i class="fas fa-plus mr-2"></i> Add Layer';
    } else {
        window.currentEditingTopic.lectures.push({ title, videoUrl: url, notes });
    }

    resetLectureInputs();
    renderTopicLectures();
}

function editTopicLecture(index) {
    const lec = window.currentEditingTopic.lectures[index];
    document.getElementById('tl-title').value = lec.title;
    document.getElementById('tl-url').value = lec.videoUrl || lec.url || '';
    document.getElementById('tl-notes').value = lec.notes || '';

    window.editingLectureIndex = index;
    document.getElementById('btn-add-lec').innerHTML = '<i class="fas fa-save mr-2"></i> Update Layer';
}

function removeTopicLecture(index) {
    window.currentEditingTopic.lectures.splice(index, 1);
    renderTopicLectures();
}

function resetLectureInputs() {
    document.getElementById('tl-title').value = '';
    document.getElementById('tl-url').value = '';
    document.getElementById('tl-notes').value = '';
    window.editingLectureIndex = null;
    document.getElementById('btn-add-lec').innerHTML = '<i class="fas fa-plus mr-2"></i> Add Layer';
}

async function saveSkillChanges(skill) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`/api/explore/admin/skills/${skill._id}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ topics: skill.topics })
        });

        if (res.ok) {
            showToast("NEURAL LAYER SYNCED", "success");
            await sync();
        } else {
            const err = await res.json().catch(() => ({}));
            showToast("SYNC FAILED: " + (err.message || "INTERNAL ERROR").toUpperCase(), "error");
        }
    } catch (e) {
        showToast("SYNC FAILURE", "error");
        console.error(e);
    }
}

async function deleteTopic(topicId) {
    if (!confirm("Purge this neural layer? Irreversible.")) return;
    const skill = window.activeSkill;
    skill.topics = skill.topics.filter(t => t._id.toString() !== topicId.toString());
    await saveSkillChanges(skill);
    renderBranchContent();
}

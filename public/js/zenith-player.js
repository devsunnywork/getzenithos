/**
 * ZENITH OS v18.0 - COMPACT & FANCY
 * Smaller video, more margins, fancy UI effects
 */

window.ImmersiveEngine = {
    escapeHTML: (str) => {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag]));
    },
    open: (content) => {
        const sidebars = document.querySelectorAll('aside');
        const main = document.querySelector('main');
        const dash = document.getElementById('dashboard');
        if (dash) dash.style.display = 'none';
        if (main) main.style.display = 'none';
        sidebars.forEach(s => s.style.display = 'none');

        const container = document.getElementById('zenith-immersive');
        if (!container) return;
        container.style.display = 'block';
        container.innerHTML = content;
        window.scrollTo(0, 0);
    },
    close: () => {
        const container = document.getElementById('zenith-immersive');
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
        }
        const dash = document.getElementById('dashboard');
        const sidebars = document.querySelectorAll('aside');
        const main = document.querySelector('main');
        if (dash) dash.style.display = '';
        if (main) main.style.display = '';
        sidebars.forEach(s => s.style.display = '');
        if (typeof fetchUser === 'function') fetchUser();
    }
};

window.openCoursePlayer = async function (courseId) {
    ImmersiveEngine.open(`<div class="flex items-center justify-center h-screen bg-black"><div class="text-white">Loading...</div></div>`);
    try {
        const res = await fetch(API_BASE_URL + `/api/courses/${courseId}/content`, { headers: { 'Authorization': `Bearer ${token}` } });
        const course = await res.json();
        window.activeCourseContent = course;
        window.renderCourseTree(course);
    } catch (e) {
        console.error("CRITICAL ENGINE FAILURE:", e);
        ImmersiveEngine.close();
    }
};

// POLISHED LANDING PAGE
window.renderCourseTree = async function (courseData) {
    if (!courseData) return;

    // Fetch notes for this course
    let notes = [];
    try {
        const notesRes = await fetch(API_BASE_URL + `/api/notes/course/${courseData._id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        notes = await notesRes.json();
    } catch (e) { console.error("Could not fetch notes matrix"); }

    // Find progress - handle both populated and unpopulated courseId
    const progress = (state?.user?.courseProgress || []).find(p => {
        const pCourseId = p.courseId?._id || p.courseId;
        return pCourseId && pCourseId.toString() === courseData._id.toString();
    }) || { completedLectures: [], xp: 0 };
    const totalLectures = courseData.units.reduce((acc, unit) => acc + (unit.lectures?.length || 0), 0);
    const completedCount = progress.completedLectures.length;
    const percent = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

    const content = `
    <div class="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#050508] text-white">
        <!-- Top Navigation -->
        <nav class="h-16 bg-black/50 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-8 sticky top-0 z-50">
            <button onclick="ImmersiveEngine.close()" class="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <i class="fas fa-arrow-left"></i>
                <span class="text-sm font-medium">Back to Dashboard</span>
            </button>
            <div class="flex items-center gap-6">
                <div class="text-sm">
                    <span class="text-slate-500">Total XP:</span>
                    <span class="text-blue-500 font-bold ml-2">${state.user.xp || 0}</span>
                </div>
                <button onclick="resumeCourse()" class="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20">
                    ${completedCount > 0 ? 'Continue Learning' : 'Start Course'}
                </button>
            </div>
        </nav>

        <!-- Course Header -->
        <div class="max-w-6xl mx-auto px-8 py-12">
            <div class="grid md:grid-cols-3 gap-10 mb-16">
                <!-- Course Info -->
                <div class="md:col-span-2 space-y-6">
                    <div>
                        <span class="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                            ${courseData.category || "Course"}
                        </span>
                        <h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent leading-tight">
                            ${courseData.title}
                        </h1>
                        <p class="text-slate-400 text-lg leading-relaxed">
                            ${courseData.description || "Start your learning journey with this comprehensive course."}
                        </p>
                    </div>
                    
                    <!-- Stats Grid -->
                    <div class="grid grid-cols-3 gap-4">
                        <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                            <div class="text-2xl font-bold text-white mb-1">${percent}%</div>
                            <div class="text-xs text-slate-500 uppercase tracking-wide">Progress</div>
                        </div>
                        <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                            <div class="text-2xl font-bold text-white mb-1">${totalLectures}</div>
                            <div class="text-xs text-slate-500 uppercase tracking-wide">Lectures</div>
                        </div>
                        <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                            <div class="text-2xl font-bold text-blue-500 mb-1">${progress.xp || 0}</div>
                            <div class="text-xs text-slate-500 uppercase tracking-wide">XP Earned</div>
                        </div>
                    </div>
                </div>

                <!-- Course Thumbnail -->
                <div class="relative group">
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div class="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl">
                        <img src="${courseData.thumbnail || ''}" class="w-full h-full object-cover">
                    </div>
                </div>
            </div>

            <!-- Study Notes Section -->
            ${notes.length > 0 ? `
            <div class="mb-16">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-xl font-bold text-white flex items-center gap-3 syne uppercase tracking-tight">
                        <i class="fas fa-file-signature text-red-500"></i>
                        Neural Study Matrix
                    </h2>
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${notes.length} Records Detected</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${notes.map(n => `
                        <div onclick="openNoteViewer('${n._id}')" class="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between group hover:bg-white/10 hover:border-red-500/30 transition-all cursor-pointer">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">
                                    <i class="fas fa-file-alt"></i>
                                </div>
                                <div>
                                    <h4 class="font-bold text-white uppercase tracking-tight group-hover:text-red-400 transition-colors">${n.title}</h4>
                                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Version 1.0 // ${new Date(n.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <i class="fas fa-chevron-right text-slate-700 group-hover:text-red-500 transition-all"></i>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Course Content -->
            <div class="space-y-4">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-lg font-bold text-white flex items-center gap-3">
                        <i class="fas fa-book-open text-blue-500"></i>
                        Course Curriculum
                    </h2>
                    <span class="text-sm text-slate-500">
                        ${completedCount} of ${totalLectures} completed
                    </span>
                </div>
                ${courseData.units.map((u, i) => {
        const unitCompleted = u.lectures.filter(l => progress.completedLectures.includes(l._id)).length;
        const unitProgress = u.lectures.length > 0 ? Math.round((unitCompleted / u.lectures.length) * 100) : 0;
        return `
                    <div class="relative group">
                        <!-- Animated Glow -->
                        <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
                        
                        <div class="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all shadow-xl">
                            <!-- Unit Header -->
                            <button onclick="toggleUnit('${u._id}')" class="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors group/btn">
                                <div class="flex items-center gap-5 flex-grow">
                                    <!-- Unit Number Badge -->
                                    <div class="relative">
                                        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/30">
                                            ${i + 1}
                                        </div>
                                        ${unitProgress === 100 ? `
                                        <div class="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                            <i class="fas fa-check text-white text-xs"></i>
                                        </div>
                                        ` : ''}
                                    </div>
                                    
                                    <!-- Unit Info -->
                                    <div class="text-left flex-grow">
                                        <h3 class="font-bold text-white text-lg mb-1 group-hover/btn:text-blue-400 transition-colors">${u.title}</h3>
                                        <div class="flex items-center gap-4 text-sm">
                                            <span class="text-slate-400 flex items-center gap-1.5">
                                                <i class="fas fa-play-circle text-blue-500"></i>
                                                ${u.lectures.length} lectures
                                            </span>
                                            <span class="text-slate-400 flex items-center gap-1.5">
                                                <i class="fas fa-chart-line text-purple-500"></i>
                                                ${unitProgress}% complete
                                            </span>
                                        </div>
                                        
                                        <!-- Progress Bar -->
                                        <div class="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div class="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500" style="width: ${unitProgress}%"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Expand Icon -->
                                <i id="icon-${u._id}" class="fas fa-chevron-down text-slate-400 text-lg transition-transform duration-300 ml-4"></i>
                            </button>
                            
                            <!-- Lectures List -->
                            <div id="unit-${u._id}" class="hidden border-t border-white/10 bg-black/30">
                                <div class="p-4 space-y-2">
                            ${u.lectures.map((l, idx) => {
            const isDone = progress.completedLectures.includes(l._id);
            return `
                                <div onclick="launchProPlayer('${l._id}', '${u._id}')" 
                                    class="flex items-center justify-between p-4 hover:bg-blue-600/10 cursor-pointer border-b border-white/5 last:border-0 transition-all group">
                                    <div class="flex items-center gap-4">
                                        <div class="w-9 h-9 rounded-lg ${isDone ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-slate-800/50 border border-white/10 text-slate-500'} flex items-center justify-center transition-all">
                                            <i class="fas ${isDone ? 'fa-check' : 'fa-play'} text-xs"></i>
                                        </div>
                                        <div>
                                            <span class="text-sm font-medium ${isDone ? 'text-slate-500' : 'text-slate-200 group-hover:text-white'} transition-colors">
                                                ${l.title}
                                            </span>
                                            ${isDone ? '<div class="text-xs text-green-500 mt-0.5">Completed</div>' : ''}
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <span class="text-xs font-bold text-blue-500">+100 XP</span>
                                        <i class="fas fa-chevron-right text-xs text-slate-700 group-hover:text-slate-500 transition-colors"></i>
                                    </div>
                                </div>
                                `;
        }).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
    }).join('')}
            </div>
        </div>
    </div>`;

    ImmersiveEngine.open(content);
};

window.toggleUnit = function (id) {
    const el = document.getElementById(`unit-${id}`);
    const icon = document.getElementById(`icon-${id}`);
    if (el && icon) {
        const isHidden = el.classList.contains('hidden');
        el.classList.toggle('hidden');
        icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    }
};

// COMPACT & FANCY VIDEO PLAYER
window.launchProPlayer = async function (lecId, unitId) {
    const course = window.activeCourseContent;
    const unit = course.units.find(u => u._id === unitId);
    const lecture = unit.lectures.find(l => l._id === lecId);

    // Find progress - handle both populated and unpopulated courseId
    const progress = (state.user.courseProgress || []).find(p => {
        const pCourseId = p.courseId?._id || p.courseId;
        return pCourseId.toString() === course._id.toString();
    }) || { completedLectures: [], xp: 0 };

    const isDone = progress.completedLectures.includes(lecture._id);

    // Debug logging


    const content = `
    <div class="h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a15] to-[#0a0a0f] text-white flex flex-col">
        <!-- Top Bar -->
        <div class="h-14 bg-black/80 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0">
            <div class="flex items-center gap-4">
                <button onclick="renderCourseTree(window.activeCourseContent)" class="text-slate-400 hover:text-white transition-colors">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="flex flex-col">
                    <span class="text-xs text-blue-500 font-bold">${course.title}</span>
                    <span class="text-sm font-medium truncate max-w-md">${lecture.title}</span>
                </div>
            </div>
            <button onclick="ImmersiveEngine.close()" class="text-slate-400 hover:text-red-500 transition-colors">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <!-- Main Content -->
        <div class="flex-grow flex overflow-hidden">
            
            <!-- LEFT: Video + Details (compact, fancy) -->
            <div class="flex-grow flex flex-col overflow-y-auto">
                
                <!-- Video Container (Smaller with fancy glow) -->
                <div class="p-8 bg-black/30 backdrop-blur-sm">
                    <div class="max-w-5xl mx-auto">
                        <div class="relative group">
                            <!-- Animated Glow -->
                            <div class="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity animate-pulse"></div>
                            <!-- Video (16:9 ratio but smaller height) -->
                            <div class="relative aspect-[16/9.5] bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                                ${renderVideo(lecture)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Compact Details Section -->
                <div class="max-w-5xl mx-auto w-full px-8 py-4 space-y-4">
                    
                    <!-- Title & Complete Button -->
                    <div class="flex items-start justify-between gap-6">
                        <div class="flex-grow space-y-2">
                            <h2 class="text-xl font-bold leading-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                                ${lecture.title}
                            </h2>
                            <div class="flex items-center gap-3 text-sm">
                                <span class="flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full">
                                    <i class="fas fa-book-open text-blue-500 text-xs"></i>
                                    <span class="text-blue-400 font-medium">${course.title}</span>
                                </span>
                                <span class="flex items-center gap-2 px-3 py-1 bg-yellow-600/10 border border-yellow-500/20 rounded-full">
                                    <i class="fas fa-star text-yellow-500 text-xs"></i>
                                    <span class="text-yellow-400 font-bold">100 XP</span>
                                </span>
                            </div>
                        </div>
                        
                        <button id="complete-btn" onclick="toggleLectureComplete('${lecture._id}', '${course._id}')" 
                            class="relative px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex-shrink-0 group overflow-hidden ${isDone ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-green-600/30' : 'bg-gradient-to-r from-slate-800 to-slate-700 text-slate-300 hover:from-slate-700 hover:to-slate-600'}">
                            <span class="relative z-10">${isDone ? '<i class="fas fa-check mr-2"></i>Completed' : '<i class="fas fa-circle-check mr-2"></i>Mark Complete'}</span>
                            <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                        </button>
                    </div>

                    <!-- Fancy Action Buttons -->
                    <div class="flex gap-3">
                        <button id="like-btn" onclick="toggleLike('${lecture._id}')" class="relative flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600/10 to-blue-500/10 hover:from-blue-600/20 hover:to-blue-500/20 border border-blue-500/30 rounded-xl text-sm font-medium transition-all group overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-400/20 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <i id="like-icon" class="fas fa-thumbs-up text-blue-500 relative z-10"></i>
                            <span class="relative z-10">Like</span>
                            <span id="like-count" class="relative z-10 ml-1 text-xs font-bold text-blue-400">0</span>
                        </button>
                        <button id="share-btn" onclick="shareLecture('${lecture._id}')" class="relative flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600/10 to-purple-500/10 hover:from-purple-600/20 hover:to-purple-500/20 border border-purple-500/30 rounded-xl text-sm font-medium transition-all group overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-400/20 to-purple-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <i class="fas fa-share-nodes text-purple-500 relative z-10"></i>
                            <span class="relative z-10">Share</span>
                            <span id="share-count" class="relative z-10 ml-1 text-xs font-bold text-purple-400">0</span>
                        </button>
                    </div>

                    <div class="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                    <!-- Fancy Tabs -->
                    <div class="border-b border-white/10">
                        <div class="flex gap-6">
                            <button onclick="setTab('about')" id="t-about" class="tab-btn active pb-3 px-1 text-sm font-bold border-b-2 border-transparent transition-all relative group">
                                <span class="relative z-10 flex items-center gap-2">
                                    <i class="fas fa-info-circle"></i>
                                    About
                                </span>
                            </button>
                            <button onclick="setTab('comments')" id="t-comments" class="tab-btn pb-3 px-1 text-sm font-bold border-b-2 border-transparent transition-all relative group">
                                <span class="relative z-10 flex items-center gap-2">
                                    <i class="fas fa-comments"></i>
                                    Comments
                                </span>
                            </button>
                            ${lecture.notesUrl ? `
                            <button onclick="setTab('notes')" id="t-notes" class="tab-btn pb-3 px-1 text-sm font-bold border-b-2 border-transparent transition-all relative group">
                                <span class="relative z-10 flex items-center gap-2">
                                    <i class="fas fa-file-pdf"></i>
                                    Resources
                                </span>
                            </button>
                            ` : ''}
                            <button onclick="setTab('chat')" id="t-chat" class="tab-btn pb-3 px-1 text-sm font-bold border-b-2 border-transparent transition-all relative group">
                                <span class="relative z-10 flex items-center gap-2">
                                    <i class="fas fa-message"></i>
                                    Live Chat
                                </span>
                            </button>
                            <button onclick="setTab('cheat')" id="t-cheat" class="tab-btn pb-3 px-1 text-sm font-bold border-b-2 border-transparent transition-all relative group">
                                <span class="relative z-10 flex items-center gap-2">
                                    <i class="fas fa-terminal"></i>
                                    Cheat Code
                                </span>
                            </button>
                        </div>
                    </div>

                    <!-- Tab Content -->
                    <div id="tab-canvas" class="min-h-[250px]"></div>
                </div>
            </div>

            <!-- RIGHT: Fancy Playlist -->
            <div class="w-96 bg-gradient-to-b from-black/80 via-black/60 to-black/80 backdrop-blur-xl border-l border-white/10 flex flex-col overflow-hidden flex-shrink-0 shadow-2xl">
                
                <!-- Ad Label -->
                <div class="px-5 pt-4 pb-2">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Ad Content</span>
                </div>
                
                <!-- Fancy Ad Box -->
                <div class="px-5 pb-5 border-b border-white/10 flex-shrink-0">
                    ${course.adConfig && course.adConfig.enabled && course.adConfig.imageUrl ? `
                    <a href="${course.adConfig.linkUrl || '#'}" target="_blank" class="block relative rounded-2xl overflow-hidden aspect-video bg-slate-900 group cursor-pointer">
                        <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl opacity-50 group-hover:opacity-75 blur transition-opacity animate-pulse"></div>
                        <div class="relative rounded-2xl overflow-hidden">
                            <img src="${course.adConfig.imageUrl}" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        </div>
                    </a>
                    ` : `
                    <div class="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 group cursor-pointer">
                        <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl opacity-50 group-hover:opacity-75 blur transition-opacity animate-pulse"></div>
                        <div class="relative rounded-2xl overflow-hidden">
                            <img src="${course.thumbnail || ''}" class="w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500">
                            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                            <div class="absolute bottom-0 left-0 right-0 p-4">
                                <span class="inline-block px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-xs font-bold mb-2 shadow-lg">
                                    ZENITH PRO
                                </span>
                                <h4 class="text-sm font-bold">Unlock Premium</h4>
                            </div>
                        </div>
                    </div>
                    `}
                </div>

                <!-- Playlist Header -->
                <div class="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-white/5">
                    <div>
                        <h3 class="text-sm font-bold flex items-center gap-2">
                            <i class="fas fa-list text-blue-500"></i>
                            Up Next
                        </h3>
                        <span class="text-xs text-slate-500">${unit.lectures.length} lectures</span>
                    </div>
                </div>

                <!-- Playlist Items -->
                <div class="flex-grow overflow-y-auto">
                    ${unit.lectures.map((l, i) => {
        const active = l._id === lecId;
        const done = progress.completedLectures.includes(l._id);
        return `
                        <div onclick="launchProPlayer('${l._id}', '${unit._id}')" 
                            class="relative p-4 flex items-start gap-3 border-b border-white/5 cursor-pointer hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10 transition-all ${active ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-2 border-l-blue-500' : ''}">
                            ${active ? '<div class="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 animate-pulse"></div>' : ''}
                            <div class="relative w-9 h-9 rounded-xl ${active ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/40' : done ? 'bg-gradient-to-br from-green-600 to-green-500 text-white shadow-lg shadow-green-600/30' : 'bg-slate-800/50 text-slate-500 border border-white/10'} flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all">
                                ${active ? '<i class="fas fa-play animate-pulse"></i>' : done ? '<i class="fas fa-check"></i>' : i + 1}
                            </div>
                            <div class="flex-grow min-w-0 relative z-10">
                                <h4 class="text-xs font-medium line-clamp-2 ${active ? 'text-white font-bold' : 'text-slate-300'} mb-1">
                                    ${l.title}
                                </h4>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs text-slate-600">Lecture ${i + 1}</span>
                                    ${done ? '<span class="text-xs text-green-400 flex items-center gap-1"><i class="fas fa-check-circle"></i> Done</span>' : ''}
                                </div>
                            </div>
                        </div>
                        `;
    }).join('')}
                </div>
            </div>
        </div>

        <style>
            .tab-btn.active { 
                color: #3b82f6; 
                border-bottom-color: #3b82f6; 
            }
            .tab-btn { 
                color: #94a3b8; 
            }
            .tab-btn:hover {
                color: #cbd5e1;
            }
        </style>
    </div>`;

    ImmersiveEngine.open(content);
    window.activeLectureId = lecture._id;
    setTab('about');
    loadLectureStats(lecture._id); // Load like/share stats
};

window.setTab = async function (tab) {
    if (chatInterval) { clearInterval(chatInterval); chatInterval = null; }

    ['about', 'comments', 'notes', 'chat', 'cheat'].forEach(t => {
        const btn = document.getElementById(`t-${t}`);
        if (btn) btn.classList.toggle('active', t === tab);
    });

    const canvas = document.getElementById('tab-canvas');
    if (!canvas) return;
    const lecture = getActiveLecture();

    if (tab === 'about') {
        canvas.innerHTML = `
            <div class="prose prose-invert max-w-none">
                <div class="bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-xl p-6">
                    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                        <i class="fas fa-book text-blue-500"></i>
                        Lecture Description
                    </h3>
                    <div class="text-slate-300 leading-relaxed whitespace-pre-wrap">
                        ${lecture.content || "No detailed description available for this lecture."}
                    </div>
                </div>
            </div>`;
    } else if (tab === 'notes') {
        const lecture = getActiveLecture();
        if (lecture && lecture.notesUrl) {
            const downloadUrl = convertDriveLink(lecture.notesUrl);
            canvas.innerHTML = `
                <div class="max-w-4xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div class="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 shadow-xl backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-blue-500/30 transition-all">
                        <div class="flex items-center gap-5 overflow-hidden">
                            <div class="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20 shrink-0">
                                <i class="fas fa-file-pdf text-lg"></i>
                            </div>
                            <div class="truncate text-center md:text-left">
                                <h3 class="text-sm font-black text-white uppercase tracking-tight truncate">${lecture.title || "Lecture Document"}</h3>
                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">ADMIN VERIFIED RESOURCE</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 shrink-0">
                            <a href="${lecture.notesUrl}" target="_blank" class="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95">
                                Open <i class="fas fa-external-link-alt"></i>
                            </a>
                            <a href="${downloadUrl}" target="_blank" download class="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2 active:scale-95">
                                Download <i class="fas fa-download text-blue-500"></i>
                            </a>
                        </div>
                    </div>
                </div>`;
        }
    }
    else if (tab === 'comments') {
        renderComments();
    } else if (tab === 'chat') {
        renderLiveChat();
    } else if (tab === 'cheat') {
        canvas.innerHTML = `
            <div class="max-w-md mx-auto py-12">
                <div class="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                    <div class="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-all"></div>
                    
                    <div class="relative z-10">
                        <div class="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 mb-6 mx-auto">
                            <i class="fas fa-terminal text-2xl"></i>
                        </div>
                        
                        <h3 class="text-xl font-bold text-center mb-2 uppercase tracking-tight">Access Protocol</h3>
                        <p class="text-slate-500 text-center text-xs font-bold uppercase tracking-widest mb-8">Enter Neural Override Sequence</p>
                        
                        <div class="space-y-4">
                            <div class="relative">
                                <input id="cheat-input" type="text" placeholder="Protocol Code..." 
                                    class="w-full bg-white/5 border border-white/20 p-5 rounded-2xl outline-none focus:border-blue-500 text-center font-black tracking-[0.2em] text-white uppercase placeholder:text-slate-700 transition-all">
                                <div class="absolute inset-0 rounded-2xl bg-blue-600/5 -z-10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            
                            <button onclick="submitCheatCode()" 
                                class="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                                Execute Override
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    }
};

window.launchResourcePreview = function (url) {
    const container = document.getElementById('inline-resource-view');
    const iframe = document.getElementById('resource-iframe');
    if (!container || !iframe) return;
    iframe.src = convertDriveLink(url);
    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth' });
};

window.renderComments = async function () {
    const canvas = document.getElementById('tab-canvas');
    canvas.innerHTML = `<div class="flex justify-center py-12"><div class="w-8 h-8 border-2 border-slate-700 border-t-blue-600 rounded-full animate-spin"></div></div>`;
    try {
        const res = await fetch(API_BASE_URL + `/api/courses/lectures/${activeLectureId}/comments`, { headers: { 'Authorization': `Bearer ${token}` } });
        const comments = await res.json();
        canvas.innerHTML = `
            <div class="space-y-8">
                <div class="flex gap-4">
                    <img src="${state.user.profile?.avatar && state.user.profile.avatar.startsWith('/uploads') ? API_BASE_URL + state.user.profile.avatar : (state.user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${state.user.username}`)}" class="w-12 h-12 rounded-full border-2 border-white/10">
                    <div class="flex-grow space-y-3">
                        <textarea id="comment-input" class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" rows="3" placeholder="Share your thoughts..."></textarea>
                        <div class="flex justify-end">
                            <button onclick="postComment()" class="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20">
                                <i class="fas fa-paper-plane mr-2"></i>Post Comment
                            </button>
                        </div>
                    </div>
                </div>

                <div class="h-px bg-white/10"></div>

                <div class="space-y-6">
                    ${comments.map(c => {
            let avatarUrl = (c.user.profile?.avatar && c.user.profile.avatar.startsWith('/uploads')) ? API_BASE_URL + c.user.profile.avatar : (c.user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user.username}`);
            return `
                        <div class="flex gap-4 group">
                            <img src="${avatarUrl}" class="w-12 h-12 rounded-full border-2 border-white/10">
                            <div class="flex-grow">
                                <div class="flex items-center gap-3 mb-2">
                                    <span class="font-bold text-sm text-white">${c.user?.username ? ImmersiveEngine.escapeHTML(c.user.username) : 'Anonymous User'}</span>
                                    <span class="text-xs text-slate-600">${new Date(c.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p class="text-sm text-slate-300 leading-relaxed">${ImmersiveEngine.escapeHTML(c.text)}</p>
                            </div>
                        </div>
                    `;
        }).join('')}
                    ${comments.length === 0 ? `
                        <div class="text-center py-12 text-slate-600">
                            <i class="fas fa-comments text-3xl mb-3 opacity-20"></i>
                            <p class="text-sm">No comments yet. Be the first!</p>
                        </div>
                    ` : ''}
                </div>
            </div>`;
    } catch (e) { }
};

window.renderLiveChat = function () {
    const canvas = document.getElementById('tab-canvas');
    canvas.innerHTML = `
        <div class="flex flex-col h-[450px]">
            <div class="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-circle text-green-500 text-xs animate-pulse"></i>
                    <span class="font-bold">Live Chat</span>
                    <span class="text-slate-500">• Auto-delete after 60s</span>
                </div>
            </div>
            <div id="chat-stream" class="flex-grow overflow-y-auto bg-white/5 border border-white/10 rounded-xl p-5 mb-4 flex flex-col-reverse space-y-reverse space-y-3"></div>
            <div class="flex gap-3">
                <input id="chat-input" onkeypress="if(event.key==='Enter') postChat()" 
                    class="flex-grow bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                    placeholder="Type your message...">
                <button onclick="postChat()" class="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>`;
    pollChat();
};

let chatInterval = null;
async function pollChat() {
    const update = async () => {
        const stream = document.getElementById('chat-stream');
        if (!stream) { clearInterval(chatInterval); return; }
        try {
            const res = await fetch(API_BASE_URL + `/api/courses/lectures/${activeLectureId}/chats`, { headers: { 'Authorization': `Bearer ${token}` } });
            const chats = await res.json();
            stream.innerHTML = chats.slice(-25).reverse().map(c => `
                <div class="text-sm">
                    <span class="text-slate-600 text-xs">[${new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
                    <span class="text-blue-500 font-bold ml-2">${c.user?.username ? ImmersiveEngine.escapeHTML(c.user.username) : 'System'}:</span>
                    <span class="text-slate-300 ml-2">${ImmersiveEngine.escapeHTML(c.text)}</span>
                </div>
            `).join('');
        } catch (e) { }
    };
    update();
    chatInterval = setInterval(update, 5000);
}

window.postComment = async function () {
    const input = document.getElementById('comment-input');
    if (!input.value.trim()) return;
    await fetch(API_BASE_URL + `/api/courses/lectures/${activeLectureId}/comments`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: input.value }) });
    input.value = ''; renderComments();
};

window.postChat = async function () {
    const input = document.getElementById('chat-input');
    if (!input.value.trim()) return;
    const text = input.value; input.value = '';
    await fetch(API_BASE_URL + `/api/courses/lectures/${activeLectureId}/chats`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
};

window.toggleLectureComplete = async function (lecId, courseId) {
    const btn = document.getElementById('complete-btn');
    if (!btn) return;
    const isDone = btn.innerText.includes('Completed');

    // Find progress - handle both object and string courseId
    let progress = state.user.courseProgress.find(p => {
        const pCourseId = p.courseId?._id || p.courseId;
        return pCourseId.toString() === courseId.toString();
    });

    if (!progress) {
        console.error('Progress not found for courseId:', courseId);
        notify('Progress not found. Please refresh the page.');
        return;
    }

    if (isDone) {
        progress.completedLectures = progress.completedLectures.filter(id => id !== lecId);
        btn.innerHTML = '<span class="relative z-10"><i class="fas fa-circle-check mr-2"></i>Mark Complete</span>';
        btn.className = "relative px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex-shrink-0 group overflow-hidden bg-gradient-to-r from-slate-800 to-slate-700 text-slate-300 hover:from-slate-700 hover:to-slate-600";
    } else {
        if (!progress.completedLectures.includes(lecId)) progress.completedLectures.push(lecId);
        btn.innerHTML = '<span class="relative z-10"><i class="fas fa-check mr-2"></i>Completed</span>';
        btn.className = "relative px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex-shrink-0 group overflow-hidden bg-gradient-to-r from-green-600 to-green-500 text-white shadow-green-600/30";
    }

    try {
        const res = await fetch(API_BASE_URL + `/api/courses/${courseId}/progress/mark-complete`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ lectureId: lecId, completed: !isDone }) });
        const result = await res.json();

        // Update user XP
        state.user.xp = result.xp;

        // Update the progress object with server response
        if (result.progress) {
            const progressIndex = state.user.courseProgress.findIndex(p => {
                const pCourseId = p.courseId?._id || p.courseId;
                return pCourseId.toString() === courseId.toString();
            });

            if (progressIndex !== -1) {
                // Update the existing progress with server data
                state.user.courseProgress[progressIndex].completedLectures = result.progress.completedLectures;
                state.user.courseProgress[progressIndex].xp = result.progress.xp;
            }
        }

        // Refetch user to sync with database
        try {
            const userRes = await fetch(API_BASE_URL + '/api/auth/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (userRes.ok) {
                const updatedUser = await userRes.json();
                state.user = updatedUser;

            }
        } catch (e) {
            console.error('Failed to refresh user data:', e);
        }

        notify(isDone ? 'Lecture unmarked' : '✅ Completed! +100 XP');

    } catch (e) {
        notify('Failed to update progress');
        console.error('Mark complete error:', e);
    }
};

window.resumeCourse = function () {
    const course = window.activeCourseContent;

    // Find progress - handle both populated and unpopulated courseId
    const progress = (state.user.courseProgress || []).find(p => {
        const pCourseId = p.courseId?._id || p.courseId;
        return pCourseId.toString() === course._id.toString();
    });

    let targetLec = null; let targetUnit = null;
    if (progress && progress.completedLectures.length > 0) {
        for (const u of course.units) {
            for (const l of u.lectures) {
                if (!progress.completedLectures.includes(l._id)) { targetLec = l; targetUnit = u; break; }
            }
            if (targetLec) break;
        }
    }
    if (!targetLec && course.units.length > 0 && course.units[0].lectures.length > 0) {
        targetUnit = course.units[0]; targetLec = targetUnit.lectures[0];
    }
    if (targetLec) launchProPlayer(targetLec._id, targetUnit._id);
};

window.openNoteViewer = async function (id) {
    const modal = document.getElementById('zenith-modal');
    const content = document.getElementById('zenith-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
        <div class="flex items-center justify-center py-20">
            <div class="w-12 h-12 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    `;
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    try {
        const res = await fetch(API_BASE_URL + `/api/notes/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const note = await res.json();

        if (note) {
            let noteBody = '';
            if (note.content && note.content.pages) {
                noteBody = `
                    <div class="flex flex-col items-center gap-16 py-20 bg-slate-950/20 backdrop-blur-xl a4-viewer-container">
                        ${note.content.pages.map((p, idx) => `
                            <div class="a4-page-static bg-white shadow-2xl relative overflow-hidden shrink-0 bg-${p.texture || 'plain'}" style="width: 794px; height: 1123px;">
                                ${(p.blocks || []).map(b => window.renderZenithNoteBlock(b)).join('')}
                                <div class="absolute bottom-10 left-10 text-[9px] font-black text-slate-200 uppercase tracking-[0.5em] pointer-events-none">Sheet #0${idx + 1} // ${note.title}</div>
                            </div>
                        `).join('')}
                    </div>
                    <style>
                        .a4-page-static { transform-origin: top center; transition: transform 0.3s ease; }
                        .bg-lined { background-image: linear-gradient(#e2e8f0 1px, transparent 1px); background-size: 100% 28px; }
                        .bg-grid { background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 24px 24px; }
                        .bg-dots { background-image: radial-gradient(#94a3b8 1.5px, transparent 0); background-size: 24px 24px; }
                        .thought-tail-static { position: absolute; bottom: -15px; left: 50%; transform: translateX(-50%) rotate(45deg); width: 30px; height: 30px; z-index: -1; background: inherit; border-bottom: inherit; border-right: inherit; }
                        .code-static { border: 1px solid #334155; border-radius: 8px; overflow: hidden; }
                        @media screen and (max-width: 900px) { .a4-page-static { transform: scale(0.9); } }
                        @media screen and (max-width: 800px) { .a4-page-static { transform: scale(0.8); } }
                        @media screen and (max-width: 700px) { .a4-page-static { transform: scale(0.7); } }
                        @media screen and (max-width: 600px) { .a4-page-static { transform: scale(0.6); } }
                    </style>
                `;
            }
            else {
                // Fallback for old simple notes
                noteBody = `
                    <div class="glass-card p-12 rounded-[3rem] border-white/5 bg-white/5">
                        <div class="prose prose-invert prose-blue max-w-none text-slate-300 text-lg leading-relaxed font-medium">
                            ${note.content?.html || ''}
                        </div>
                    </div>
                `;
            }

            content.innerHTML = `
                <div class="min-h-screen bg-black text-white selection:bg-blue-600/30 font-['Poppins'] relative notes-body-container">
                    <!-- Fonts -->
                    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Montserrat:wght@400;700&family=Playfair+Display:ital,wght@0,700;1,700&family=Lora:ital@0;1&family=Roboto+Mono&family=Inter:wght@400;600;700&family=Oswald:wght@500&family=Raleway:wght@400;700&family=Ubuntu:wght@400;700&family=Open+Sans:wght@400;700&family=Dancing+Script&family=Merriweather&display=swap" rel="stylesheet">

                    <!-- Top Navigation Bar (Fixed for full-screen feel - FIXED Z-INDEX) -->
                    <nav class="sticky top-0 z-[1000] px-10 py-6 bg-black border-b border-white/10 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,1)]">
                        <div class="flex items-center gap-8">
                            <button onclick="closeZenithModal()" class="group flex items-center gap-4 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all">
                                <i class="fas fa-chevron-left text-blue-500 group-hover:-translate-x-1 transition-transform"></i>
                                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Back to Hub</span>
                            </button>
                            <div class="h-10 w-px bg-white/10 hidden md:block"></div>
                            <div class="hidden lg:block text-center flex-grow mx-8">
                                <h2 class="text-2xl font-black syne tracking-tighter uppercase italic leading-none mb-1 text-white">${note.title}</h2>
                                <p class="text-[8px] font-bold text-slate-500 uppercase tracking-[0.4em]">Integrated Intelligence // Zenith OS</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <button onclick="downloadNotePDF(event, '${note._id}')" class="px-8 py-4 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition shadow-2xl shadow-blue-600/30 flex items-center gap-3 group">
                                <i class="fas fa-file-pdf group-hover:scale-110 transition-transform"></i> Export PDF
                            </button>
                        </div>
                    </nav>

                    <div class="max-w-6xl mx-auto w-full py-20 px-6 relative z-10">
                        <!-- Main Header (In-page) -->
                        <div class="mb-20">
                            <div class="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20 mb-8">
                                <i class="fas fa-microchip text-blue-500 text-xs shadow-[0_0_10px_rgba(59,130,246,0.5)]"></i>
                                <span class="text-[9px] font-black text-blue-400 uppercase tracking-[0.4em]">Protocol // ${note._id}</span>
                            </div>
                            <h1 class="text-7xl font-black syne tracking-tighter uppercase italic text-white mb-10 leading-[0.8] drop-shadow-[0_0_30px_rgba(37,99,235,0.2)]">${note.title}</h1>
                            
                            <!-- Metadata Cards -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div class="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center gap-5 hover:bg-white/10 transition-all">
                                    <div class="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                                        <i class="fas fa-calendar-alt text-lg"></i>
                                    </div>
                                    <div>
                                        <div class="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Last Synchronized</div>
                                        <div class="text-sm font-bold text-white">${new Date(note.updatedAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div class="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center gap-5 hover:bg-white/10 transition-all">
                                    <div class="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400 border border-purple-500/20">
                                        <i class="fas fa-copy text-lg"></i>
                                    </div>
                                    <div>
                                        <div class="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Record Density</div>
                                        <div class="text-sm font-bold text-white">${note.content?.pages?.length || 1} Neural Units</div>
                                    </div>
                                </div>
                                <div class="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center gap-5 sm:col-span-2 lg:col-span-1 hover:bg-white/10 transition-all">
                                    <div class="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                        <i class="fas fa-shield-alt text-lg"></i>
                                    </div>
                                    <div>
                                        <div class="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Clearance Protocol</div>
                                        <div class="text-sm font-bold uppercase text-white">Zenith Secured</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="h-px bg-gradient-to-r from-blue-600 via-white/5 to-transparent mb-20 opacity-30"></div>
                        
                        <!-- Neural Records (A4 Pages) -->
                        <div class="notes-body-container flex flex-col items-center gap-20 pb-40">
                            ${noteBody}
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (e) {
        content.innerHTML = `<div class="text-center py-20 text-red-500 font-bold uppercase tracking-widest">Protocol Failure: Could not decode neural record.</div>`;
    }
};

window.closeZenithModal = function () {
    const modal = document.getElementById('zenith-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

function getActiveLecture() {
    const course = window.activeCourseContent;
    const lecId = window.activeLectureId;
    if (!course || !course.units) return {};
    for (const u of course.units) {
        const l = u.lectures.find(x => x._id === lecId);
        if (l) return l;
    }
    return {};
}

function renderVideo(lec) {
    const course = window.activeCourseContent;
    const courseId = course?._id;
    const lectureId = lec._id;

    console.log('Rendering video for lecture:', {
        lectureId: lec._id,
        title: lec.title,
        videoUrl: lec.videoUrl,
        hasVideoUrl: !!lec.videoUrl
    });

    if (lec.videoUrl) {
        let src = lec.videoUrl;
        let videoHtml = '';

        console.log('Video URL found:', src);

        if (src.includes('youtube') || src.includes('youtu.be')) {
            let id = '';
            let listId = '';

            // Extract List ID
            if (src.includes('list=')) {
                listId = src.split('list=')[1].split('&')[0];
            }

            // Extract Video ID
            if (src.includes('v=')) {
                id = src.split('v=')[1].split('&')[0];
            } else if (src.includes('youtu.be/')) {
                id = src.split('youtu.be/')[1].split('?')[0];
            } else if (src.includes('embed/')) {
                id = src.split('embed/')[1].split('?')[0];
            }

            console.log('YouTube detection:', { id, listId });

            let embedUrl = '';
            if (id) {
                // Single video (optionally with playlist context)
                embedUrl = `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1&autoplay=1&rel=0&origin=${window.location.origin}`;
                if (listId) embedUrl += `&list=${listId}`;
            } else if (listId) {
                // Playlist only
                embedUrl = `https://www.youtube-nocookie.com/embed/videoseries?list=${listId}&enablejsapi=1&autoplay=1&rel=0&origin=${window.location.origin}`;
            }

            if (embedUrl) {
                videoHtml = `<iframe id="video-player" class="w-full h-full" src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;

                // Start tracking immediately for YouTube
                setTimeout(() => {
                    if (window.startWatchTimeTracking) {
                        window.startWatchTimeTracking(lectureId, courseId);
                    }
                }, 1000);
            } else {
                console.error('Failed to parse YouTube URL:', src);
            }
        } else if (src.includes('strp2p.live') || src.includes('iframe') || src.includes('embed') || src.includes('player') || !src.endsWith('.mp4') && !src.endsWith('.webm') && !src.endsWith('.ogg')) {
            // Streaming URLs or embed links - use iframe
            console.log('Streaming/Embed URL detected, using iframe');
            videoHtml = `<iframe id="video-player" class="w-full h-full" src="${src}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen frameborder="0" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;

            setTimeout(() => {
                if (window.startWatchTimeTracking) {
                    window.startWatchTimeTracking(lectureId, courseId);
                }
            }, 1000);
        } else {
            console.log('Direct video file detected');
            videoHtml = `<video id="video-player" class="w-full h-full bg-black" controls autoplay>
                <source src="${src}" type="video/mp4">
                Your browser does not support the video tag.
            </video>`;

            // Add event listeners for HTML5 video
            setTimeout(() => {
                const videoElement = document.getElementById('video-player');
                if (videoElement && videoElement.tagName === 'VIDEO') {
                    console.log('Video element found, adding event listeners');
                    videoElement.addEventListener('play', () => {
                        if (window.startWatchTimeTracking) {
                            window.startWatchTimeTracking(lectureId, courseId);
                        }
                    });
                    videoElement.addEventListener('pause', () => {
                        if (window.stopWatchTimeTracking) {
                            window.stopWatchTimeTracking();
                        }
                    });
                    videoElement.addEventListener('ended', () => {
                        if (window.stopWatchTimeTracking) {
                            window.stopWatchTimeTracking();
                        }
                    });
                    videoElement.addEventListener('error', (e) => {
                        console.error('Video loading error:', e);
                    });

                    // Auto-start if already playing
                    if (!videoElement.paused) {
                        if (window.startWatchTimeTracking) {
                            window.startWatchTimeTracking(lectureId, courseId);
                        }
                    }
                }
            }, 1000);
        }

        return videoHtml;
    }

    console.warn('No video URL found for lecture:', lec.title);
    return `<div class="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-600">
        <i class="fas fa-video-slash text-4xl mb-3 opacity-20"></i>
        <p class="text-sm">No video available for this lecture</p>
        <p class="text-xs text-slate-700 mt-2">Please contact admin to add video URL</p>
    </div>`;
}

function convertDriveLink(url) {
    if (!url) return null;
    if (url.includes('drive.google.com')) {
        return url.replace(/\/view.*/, '/preview').replace(/\/edit.*/, '/preview').replace(/\/open\?id=/, '/file/d/').replace(/\/preview$/, '') + '/preview';
    }
    return url;
}

// --- LIKE & SHARE FUNCTIONS ---

// Load lecture stats (likes, shares) on player load
window.loadLectureStats = async function (lecId) {
    try {
        const res = await fetch(API_BASE_URL + `/api/courses/lectures/${lecId}/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const stats = await res.json();

        // Update UI
        const likeCount = document.getElementById('like-count');
        const shareCount = document.getElementById('share-count');
        const likeBtn = document.getElementById('like-btn');
        const likeIcon = document.getElementById('like-icon');

        if (likeCount) likeCount.textContent = stats.likeCount;
        if (shareCount) shareCount.textContent = stats.shareCount;

        // Update like button appearance if user has liked
        if (stats.hasLiked && likeBtn && likeIcon) {
            likeBtn.classList.add('bg-blue-600/30');
            likeIcon.classList.remove('fa-thumbs-up');
            likeIcon.classList.add('fa-heart');
            likeIcon.classList.add('text-red-500');
        }
    } catch (e) {
        console.error('Failed to load stats:', e);
    }
};

// Toggle Like
window.toggleLike = async function (lecId) {
    try {
        const res = await fetch(API_BASE_URL + `/api/courses/lectures/${lecId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await res.json();

        // Update count
        const likeCount = document.getElementById('like-count');
        const likeBtn = document.getElementById('like-btn');
        const likeIcon = document.getElementById('like-icon');

        if (likeCount) likeCount.textContent = result.likeCount;

        // Visual feedback
        if (result.liked) {
            // Liked
            if (likeBtn) likeBtn.classList.add('bg-blue-600/30');
            if (likeIcon) {
                likeIcon.classList.remove('fa-thumbs-up');
                likeIcon.classList.add('fa-heart');
                likeIcon.classList.remove('text-blue-500');
                likeIcon.classList.add('text-red-500');
            }
            notify('❤️ Lecture liked!');
        } else {
            // Unliked
            if (likeBtn) likeBtn.classList.remove('bg-blue-600/30');
            if (likeIcon) {
                likeIcon.classList.remove('fa-heart');
                likeIcon.classList.add('fa-thumbs-up');
                likeIcon.classList.remove('text-red-500');
                likeIcon.classList.add('text-blue-500');
            }
            notify('Like removed');
        }
    } catch (e) {
        notify('Failed to like lecture');
        console.error('Like error:', e);
    }
};

// Share Lecture
window.shareLecture = async function (lecId) {
    try {
        // Increment share count
        const res = await fetch(API_BASE_URL + `/api/courses/lectures/${lecId}/share`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await res.json();

        // Update count
        const shareCount = document.getElementById('share-count');
        if (shareCount) shareCount.textContent = result.shareCount;

        // Copy link to clipboard
        const shareUrl = `${window.location.origin}/course/${window.activeCourseContent._id}/lecture/${lecId}`;

        if (navigator.clipboard) {
            await navigator.clipboard.writeText(shareUrl);
            notify('🔗 Link copied to clipboard!');
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            notify('🔗 Link copied!');
        }
    } catch (e) {
        notify('Failed to share lecture');
        console.error('Share error:', e);
    }
};

// Cheat Code Submission
window.submitCheatCode = async function () {
    const input = document.getElementById('cheat-input');
    const code = input.value.trim();
    if (!code) return notify('Enter protocol code');

    try {
        const res = await fetch(API_BASE_URL + '/api/auth/cheat-code', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
        const data = await res.json();

        if (res.ok) {
            notify('🚀 ' + data.message);
            input.value = '';
            // Update UI XP if visible
            const xpEl = document.getElementById('user-xp-display');
            if (xpEl) xpEl.textContent = data.newXp;
        } else {
            notify('❌ ' + data.message);
        }
    } catch (e) {
        notify('Override Failed');
    }
};

// Enhanced Note Rendering (A4 Style)
window.renderNeuralNotes = async function (targetId = 'tab-canvas') {
    const canvas = document.getElementById(targetId);
    if (!canvas) return;
    canvas.innerHTML = `<div class="flex justify-center py-12"><div class="w-8 h-8 border-2 border-slate-700 border-t-blue-600 rounded-full animate-spin"></div></div>`;

    try {
        const res = await fetch(API_BASE_URL + `/api/notes/course/${window.activeCourseContent._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const notes = await res.json();

        if (!notes || notes.length === 0) {
            canvas.innerHTML = `<div class="text-center py-16 text-slate-600">
                <i class="fas fa-brain text-4xl mb-4 opacity-20"></i>
                <p class="text-sm">No Neural Notes found for this module</p>
            </div>`;
            return;
        }

        canvas.innerHTML = `
            <div class="space-y-12 pb-20">
                ${notes.map(note => `
                    <div class="bg-white/5 border border-white/10 rounded-3xl p-8">
                        <div class="flex items-center justify-between mb-8">
                            <div>
                                <h3 class="text-2xl font-black text-white uppercase tracking-tight">${note.title}</h3>
                                <p class="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] mt-1">Neural Documentation</p>
                            </div>
                            <button onclick="downloadNotePDF(event, '${note._id}')" class="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
                                <i class="fas fa-file-pdf text-red-500"></i> Download PDF
                            </button>
                        </div>
                        
                        <div class="a4-viewer-container space-y-8 flex flex-col items-center">
                            ${(note.content?.pages || []).map((p, idx) => `
                                <div class="a4-page-static bg-white shadow-2xl relative overflow-hidden shrink-0 bg-${p.texture || 'plain'}" style="width: 794px; height: 1123px; transform: scale(0.9); transform-origin: top center; border-radius: 4px;">
                                    ${(p.blocks || []).map(b => window.renderZenithNoteBlock(b)).join('')}
                                    <div class="absolute bottom-10 left-10 text-[9px] font-black text-slate-200 uppercase tracking-[0.5em] pointer-events-none">Sheet #0${idx + 1} // ${note.title}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (e) {
        notify('Failed to load neural notes');
    }
};

window.downloadNotePDF = function (event, noteId) {
    if (window.showToast) showToast('Formatting Neural Record...', 'info');

    const e = event || window.event;
    // Support finding in modal wrap OR inline card wrap
    const noteEl = e ? (e.currentTarget.closest('.notes-body-container') || e.currentTarget.closest('.bg-white/5')) : document.querySelector('.notes-body-container');
    if (!noteEl) return showToast('Export Failed: Context lost.', 'error');

    // Find Title: Modal Nav h2 OR Card h3
    const titleSource = noteEl.querySelector('nav h2') || noteEl.querySelector('h3');
    const noteTitle = titleSource ? titleSource.innerText : "Neural Record";

    // Attempt to find Course Name
    let courseName = document.getElementById('page-title')?.innerText || "ZENITH CORE CURRICULUM";

    // Anti-Leak Data Extraction (Security Layer)
    const downloaderName = document.getElementById('user-name')?.innerText?.trim() || "ZENITH OPERATIVE";
    const downloadId = `ZN-${new Date().getTime().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const downloadDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const pagesContainer = noteEl.querySelector('.a4-viewer-container');
    if (!pagesContainer) return showToast('Export Failed: Record Container missing.', 'error');

    // Create New Tab for "Next Page" experience
    const exportWin = window.open('', '_blank');
    if (!exportWin) return showToast('Pop-up blocked: Please allow redirects.', 'error');

    const doc = exportWin.document;
    doc.open();

    const pageEls = pagesContainer.querySelectorAll('.a4-page-static');
    let pagesCombinedHtml = '';

    pageEls.forEach((p, idx) => {
        const content = p.innerHTML;
        const textureClass = Array.from(p.classList).find(c => c.startsWith('bg-')) || 'bg-plain';

        pagesCombinedHtml += `
            <div class="note-page ${textureClass}">
                <div class="watermark">ZENITH INTELLIGENCE</div>
                
                ${idx === 0 ? `
                    <div class="registry-header">
                        <div style="font-size: 10px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.5em; margin-bottom: 12px;">ZENITH.OS // NEURAL REGISTRY</div>
                        <h1 style="font-family: 'Syne', sans-serif; font-size: 38px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.04em; margin-bottom: 8px; color: #0f172a;">${noteTitle}</h1>
                        <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px;">Course: ${courseName}</div>
                        <div style="height: 4px; width: 60px; background: #3b82f6; margin: 0 auto 20px auto; border-radius: 2px;"></div>
                        <div style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2em;">Download Date: ${downloadDate}</div>
                    </div>
                ` : '<div style="height: 60px;"></div>'}

                <div class="note-content">
                    ${content}
                </div>

                <!-- Security Footer (Anti-Leak) -->
                <div class="security-footer">
                    <div class="flex justify-between items-end w-full px-12 pb-8">
                        <div class="text-left">
                            <div style="font-size: 8px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 4px;">© 2026 ZENITH INTELLIGENCE SYSTEMS // CORE CONTENT</div>
                            <div style="font-size: 11px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">LICENSED TO: <span style="color: #3b82f6;">${downloaderName}</span></div>
                        </div>
                        <div class="text-right">
                            <div style="font-size: 8px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">SIGNATURE ID: ${downloadId}</div>
                            <div style="font-size: 11px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.3em;">SHEET #0${idx + 1}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    doc.write(`
        <html>
            <head>
                <title>${noteTitle}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@800&display=swap" rel="stylesheet">
                <style>
                    body { background: #f8fafc; margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; padding: 50px 0; }
                    
                    .note-page { 
                        background: white !important; 
                        margin: 0 auto 50px auto; 
                        width: 794px; 
                        height: 1123px; 
                        position: relative; 
                        overflow: hidden !important; 
                        padding: 0; 
                        page-break-after: always; 
                        color: black !important; 
                        box-sizing: border-box; 
                        box-shadow: 0 40px 100px -20px rgba(0,0,0,0.15);
                    }
                    
                    .note-content { 
                        position: relative; 
                        width: 100%; 
                        height: 100%; 
                    }
                    
                    .watermark { 
                        position: absolute; 
                        top: 50%; 
                        left: 50%; 
                        transform: translate(-50%, -50%) rotate(-45deg); 
                        font-size: 80px; 
                        font-weight: 900; 
                        color: rgba(0, 0, 0, 0.03); 
                        white-space: nowrap; 
                        pointer-events: none; 
                        z-index: 1000; 
                        text-transform: uppercase; 
                        letter-spacing: 0.25em; 
                    }
                    
                    .registry-header { 
                        text-align: center; 
                        margin-bottom: 30px; 
                        padding: 70px 40px 40px 40px; 
                        border-bottom: 2px solid #f1f5f9; 
                        position: relative;
                        z-index: 10;
                    }
                    
                    .security-footer { 
                        position: absolute; 
                        bottom: 0; 
                        left: 0; 
                        right: 0; 
                        height: 100px; 
                        background: white !important; 
                        border-top: 1px solid #f1f5f9; 
                        display: flex; 
                        align-items: flex-end; 
                        z-index: 1001; 
                    }
                    
                    .bg-lined { background-image: linear-gradient(#f1f5f9 1px, transparent 1px) !important; background-size: 100% 28px !important; }
                    .bg-grid { background-image: radial-gradient(#f1f5f9 1px, transparent 1px) !important; background-size: 24px 24px !important; }
                    .bg-dots { background-image: radial-gradient(#f1f5f9 1.5px, transparent 0) !important; background-size: 24px 24px !important; }
                    
                    .white-space-pre-wrap { white-space: pre-wrap !important; }
                    
                    @media print {
                        @page { margin: 0; size: auto; }
                        body { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
                        .note-page { 
                            width: 794px; 
                            height: 1123px; 
                            margin: 0 !important; 
                            box-shadow: none !important; 
                            border: none !important; 
                            overflow: hidden !important;
                            page-break-after: always;
                            box-sizing: border-box;
                        }
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important;
                    }
                </style>
            </head>
            <body class="white-space-pre-wrap">
                ${pagesCombinedHtml}
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.focus();
                            window.print();
                        }, 1000);
                    };
                </script>
            </body>
        </html>
    `);
    doc.close();
    showToast('Security Registry Dispatched', 'success');
};

window.renderZenithNoteBlock = function (b) {
    if (!b) return '';
    var style = 'position:absolute; left:' + b.x + 'px; top:' + b.y + 'px; width:' + b.w + 'px; font-size:' + (b.styles?.fontSize || 16) + 'px; font-family:' + (b.styles?.fontFamily || 'font-poppins') + '; color:' + (b.styles?.color || '#1e293b') + '; transform:rotate(' + (b.styles?.rotation || 0) + 'deg); opacity:' + (b.styles?.opacity || 1) + '; z-index:' + (b.zIndex || 10) + '; white-space: pre-wrap;';
    if (b.styles?.bgColor) style += 'background-color:' + b.styles.bgColor + ';';
    if (b.styles?.borderRadius) style += 'border-radius:' + b.styles.borderRadius + 'px;';
    if (b.styles?.padding) style += 'padding:' + (typeof b.styles.padding === 'string' ? b.styles.padding : b.styles.padding + 'px') + ';';
    if (b.styles?.borderLeft) style += 'border-left:' + b.styles.borderLeft + ';';
    if (b.styles?.borderWidth) style += 'border:' + b.styles.borderWidth + 'px solid ' + b.styles.borderColor + ';';

    var content = '';
    if (b.type === 'image') content = '<img src="' + b.content + '" style="width:100%; height:100%; object-fit:contain; border-radius:inherit; display:block;">';
    else if (b.type === 'divider') content = '<div style="width:100%; height:2px; background:#e2e8f0;"></div>';
    else if (b.type === 'code') {
        content = '<div style="background:#0f172a; padding:8px 12px; font-size:10px; color:#94a3b8; font-weight:bold; border-bottom:1px solid #334155; display:flex; justify-content:space-between;"><span>' + (b.title || 'snippet.txt') + '</span></div><div style="padding:15px; color:#38bdf8; font-family:monospace; white-space:pre; font-size:14px; background:#1e293b;">' + b.content + '</div>';
    }
    else if (b.type === 'thought') {
        content = '<div style="display:flex; align-items:center; justify-content:center; text-align:center; height:100%;">' + b.content + '</div><div class="thought-tail-static"></div>';
    }
    else content = b.content;
    return '<div style="' + style + '" class="' + b.type + '-static">' + content + '</div>';
};

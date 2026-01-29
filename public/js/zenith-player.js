/**
 * ZENITH OS v18.0 - COMPACT & FANCY
 * Smaller video, more margins, fancy UI effects
 */

window.ImmersiveEngine = {
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
        const res = await fetch(`/api/courses/${courseId}/content`, { headers: { 'Authorization': `Bearer ${token}` } });
        const course = await res.json();
        window.activeCourseContent = course;
        window.renderCourseTree(course);
    } catch (e) { ImmersiveEngine.close(); }
};

// POLISHED LANDING PAGE
window.renderCourseTree = async function (courseData) {
    if (!courseData) return;

    // Find progress - handle both populated and unpopulated courseId
    const progress = (state.user.courseProgress || []).find(p => {
        const pCourseId = p.courseId?._id || p.courseId;
        return pCourseId.toString() === courseData._id.toString();
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
    console.log('Launch Player Debug:');
    console.log('Course ID:', course._id);
    console.log('User Progress:', state.user.courseProgress);
    console.log('Found Progress:', progress);

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
                            <button onclick="setTab('notes')" id="t-notes" class="tab-btn pb-3 px-1 text-sm font-bold border-b-2 border-transparent transition-all relative group">
                                <span class="relative z-10 flex items-center gap-2">
                                    <i class="fas fa-file-pdf"></i>
                                    Resources
                                </span>
                            </button>
                            <button onclick="setTab('chat')" id="t-chat" class="tab-btn pb-3 px-1 text-sm font-bold border-b-2 border-transparent transition-all relative group">
                                <span class="relative z-10 flex items-center gap-2">
                                    <i class="fas fa-message"></i>
                                    Live Chat
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

    ['about', 'comments', 'notes', 'chat'].forEach(t => {
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
        const url = lecture.notesUrl || lecture.documentUrl;
        const filename = url ? url.split('/').pop().split('?')[0] : "Resource.pdf";
        canvas.innerHTML = url ? `
            <div class="space-y-6">
                <div class="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 p-6 rounded-xl">
                    <div class="flex items-center justify-between gap-6">
                        <div class="flex items-center gap-5">
                            <div class="w-16 h-16 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                <i class="fas fa-file-pdf text-3xl text-blue-500"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-lg mb-1">${filename}</h3>
                                <p class="text-xs text-slate-500">Study Material • PDF Document</p>
                            </div>
                        </div>
                        <div class="flex gap-3">
                            <button onclick="launchResourcePreview('${url}')" class="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all">
                                <i class="fas fa-eye mr-2"></i>View
                            </button>
                            <button onclick="window.open('${url}', '_blank')" class="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20">
                                <i class="fas fa-download mr-2"></i>Download
                            </button>
                        </div>
                    </div>
                </div>
                <div id="inline-resource-view" class="hidden rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                    <iframe id="resource-iframe" src="" class="w-full h-[600px] bg-white"></iframe>
                </div>
            </div>` : `<div class="text-center py-16 text-slate-600">
                <i class="fas fa-folder-open text-4xl mb-4 opacity-20"></i>
                <p class="text-sm">No resources available for this lecture</p>
            </div>`;
    } else if (tab === 'comments') {
        renderComments();
    } else if (tab === 'chat') {
        renderLiveChat();
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
        const res = await fetch(`/api/courses/lectures/${activeLectureId}/comments`, { headers: { 'Authorization': `Bearer ${token}` } });
        const comments = await res.json();
        canvas.innerHTML = `
            <div class="space-y-8">
                <div class="flex gap-4">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${state.user.username}" class="w-12 h-12 rounded-full border-2 border-white/10">
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
                    ${comments.map(c => `
                        <div class="flex gap-4 group">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user.username}" class="w-12 h-12 rounded-full border-2 border-white/10">
                            <div class="flex-grow">
                                <div class="flex items-center gap-3 mb-2">
                                    <span class="font-bold text-sm">${c.user.username}</span>
                                    <span class="text-xs text-slate-600">${new Date(c.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p class="text-sm text-slate-300 leading-relaxed">${c.text}</p>
                            </div>
                        </div>
                    `).join('')}
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
            const res = await fetch(`/api/courses/lectures/${activeLectureId}/chats`, { headers: { 'Authorization': `Bearer ${token}` } });
            const chats = await res.json();
            stream.innerHTML = chats.slice(-25).reverse().map(c => `
                <div class="text-sm">
                    <span class="text-slate-600 text-xs">[${new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
                    <span class="text-blue-500 font-bold ml-2">${c.user.username}:</span>
                    <span class="text-slate-300 ml-2">${c.text}</span>
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
    await fetch(`/api/courses/lectures/${activeLectureId}/comments`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: input.value }) });
    input.value = ''; renderComments();
};

window.postChat = async function () {
    const input = document.getElementById('chat-input');
    if (!input.value.trim()) return;
    const text = input.value; input.value = '';
    await fetch(`/api/courses/lectures/${activeLectureId}/chats`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
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
        console.log('Available progress:', state.user.courseProgress);
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
        const res = await fetch(`/api/courses/${courseId}/progress/mark-complete`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ lectureId: lecId, completed: !isDone }) });
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
            const userRes = await fetch('/api/auth/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (userRes.ok) {
                const updatedUser = await userRes.json();
                state.user = updatedUser;
                console.log('User data refreshed from database');
            }
        } catch (e) {
            console.error('Failed to refresh user data:', e);
        }

        notify(isDone ? 'Lecture unmarked' : '✅ Completed! +100 XP');
        console.log('Progress updated:', result);
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
            const id = src.split('v=')[1] || src.split('/').pop().split('?')[0];
            console.log('YouTube video detected, ID:', id);
            videoHtml = `<iframe id="video-player" class="w-full h-full" src="https://www.youtube.com/embed/${id}?enablejsapi=1&autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

            // Start tracking immediately for YouTube (can't detect play/pause easily)
            setTimeout(() => {
                if (window.startWatchTimeTracking) {
                    window.startWatchTimeTracking(lectureId, courseId);
                }
            }, 1000);
        } else if (src.includes('strp2p.live') || src.includes('iframe') || src.includes('embed') || src.includes('player') || !src.endsWith('.mp4') && !src.endsWith('.webm') && !src.endsWith('.ogg')) {
            // Streaming URLs or embed links - use iframe
            console.log('Streaming/Embed URL detected, using iframe');
            videoHtml = `<iframe id="video-player" class="w-full h-full" src="${src}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen frameborder="0"></iframe>`;

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
        const res = await fetch(`/api/courses/lectures/${lecId}/stats`, {
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
        const res = await fetch(`/api/courses/lectures/${lecId}/like`, {
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
        const res = await fetch(`/api/courses/lectures/${lecId}/share`, {
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

// Simple notification function
function notify(message) {
    // Check if global showToast exists
    if (typeof showToast === 'function') {
        showToast(message);
    } else {
        // Fallback: create simple toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-fade-in';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}


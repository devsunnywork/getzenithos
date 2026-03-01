// Zenith OS DSA Arena Solver Logic
// API_BASE_URL is inherited from public/js/config.js
let editor;
let currentProblemId = null;
let startTime = Date.now();
let timerInterval;

// Initialize Workspace/Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
    const editorEl = document.getElementById('monaco-editor');
    editorEl.parentElement.classList.remove('hidden');

    editor = monaco.editor.create(editorEl, {
        value: "// Loading Code Analytical Interface...\n",
        language: 'javascript',
        theme: 'vs-dark',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        wordWrap: 'off',
        cursorBlinking: 'smooth',
        lineHeight: 24,
        padding: { top: 16 },
        quickSuggestions: true,
        suggestOnTriggerCharacters: true,
        parameterHints: { enabled: true },
        formatOnType: true
    });

    monaco.editor.defineTheme('zenith-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { background: '020202' }
        ],
        colors: {
            'editor.background': '#020202',
            'editor.lineHighlightBackground': '#0a0a0a',
            'editorIndentGuide.background': '#1a1a1a',
            'editorIndentGuide.activeBackground': '#3a3a3a',
            'editorWidget.background': '#050505',
            'editorWidget.border': '#111111'
        }
    });
    monaco.editor.setTheme('zenith-dark');

    // Fetch problem logic immediately after editor is ready
    loadProblemData();
    startTimer();
});

function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        const timerEl = document.getElementById('session-timer');
        if (timerEl) timerEl.innerText = `${mins}:${secs}`;
    }, 1000);
}

// Settings Modal Logic
function toggleSettingsModal(show) {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    if (show) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

// Fetch problem data from API
async function loadProblemData() {
    const urlParams = new URLSearchParams(window.location.search);
    const pid = urlParams.get('id');
    if (!pid) {
        document.getElementById('problem-title').innerText = "Problem Sync Error";
        document.getElementById('problem-description').innerHTML = "<p class='text-red-500'>No problem ID specified in URL.</p>";
        return;
    }

    currentProblemId = pid;

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/problems/${pid}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch problem data");
        const data = await res.json();

        // Populate UI
        document.getElementById('problem-title').innerText = data.title;
        document.getElementById('problem-description').innerHTML = `<p>${(data.description || '').replace(/\n/g, '<br/>')}</p>`;

        document.getElementById('problem-xp').innerText = data.xpReward || '--';
        document.getElementById('constraint-time').innerText = data.constraints?.timeLimitMs || '--';
        document.getElementById('constraint-memory').innerText = data.constraints?.memoryLimitMb || '--';

        // Diff badge styling
        const diffBadge = document.getElementById('problem-difficulty');
        diffBadge.innerText = data.difficulty.toUpperCase();
        diffBadge.className = `px-3 py-1 border rounded-md text-[10px] font-black uppercase tracking-widest ${data.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : data.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`;

        // Bookmark State
        const bookmarkIcon = document.getElementById('bookmark-icon');
        if (bookmarkIcon) {
            if (data.isSaved) {
                bookmarkIcon.classList.remove('far', 'text-slate-500');
                bookmarkIcon.classList.add('fas', 'text-amber-500');
            } else {
                bookmarkIcon.classList.remove('fas', 'text-amber-500');
                bookmarkIcon.classList.add('far', 'text-slate-500');
            }
        }

        // Streak sync
        if (data.streakCount !== undefined) {
            const streakCountVal = document.getElementById('streak-count');
            if (streakCountVal) streakCountVal.innerText = data.streakCount;
        }

        // Populate examples
        if (data.examples && data.examples.length > 0) {
            const exContainer = document.getElementById('problem-examples');
            exContainer.innerHTML = '';
            data.examples.forEach((ex, i) => {
                exContainer.innerHTML += `
                    <div class="mb-6 p-4 bg-white/5 border border-white/5 rounded-xl">
                        <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Example ${i + 1}</h3>
                        <p class="font-mono text-xs text-slate-300 mb-2"><strong>Input:</strong> ${ex.input}</p>
                        <p class="font-mono text-xs text-slate-300 mb-2"><strong>Output:</strong> ${ex.output}</p>
                        ${ex.explanation ? `<p class="text-xs text-slate-400 mt-3 pt-3 border-t border-white/5"><em>${ex.explanation}</em></p>` : ''}
                    </div>
                `;
            });
        }

        // Set default boilerplate logic based on language
        if (editor) {
            const boilerplate = data.boilerplate || `/**\n* Problem: ${data.title}\n* Language: JavaScript\n*/\n\nfunction solve(input) {\n    // Analytical interface initialized. Write your solution code here.\n    \n}\n`;
            editor.setValue(boilerplate);
            document.getElementById('language-selector').value = 'javascript';
        }

        if (data.submissions && data.submissions.length > 0) {
            const panel = document.getElementById('submissions-panel');
            const list = document.getElementById('problem-submissions');
            if (panel && list) {
                panel.classList.remove('hidden');
                window.problemSubmissions = data.submissions.reverse();
                list.innerHTML = window.problemSubmissions.map((s, idx) => {
                    const statusColor = s.status === 'success' ? 'text-emerald-500' : 'text-red-500';
                    const dateObj = s.date ? new Date(s.date) : new Date();
                    const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return `
                        <div class="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 rounded-lg cursor-pointer transition flex items-center justify-between group" onclick="loadSubmissionIntoEditor(${idx})">
                            <div>
                                <div class="text-[10px] font-bold text-zinc-300 group-hover:text-emerald-400 transition">${s.language.toUpperCase()}</div>
                                <div class="text-[8px] text-zinc-500 mt-1">${dateStr}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-[9px] font-black uppercase tracking-widest ${statusColor}">${s.status}</div>
                                <div class="text-[8px] text-zinc-500 mt-1">${s.runtimeMs || 0}ms • ${s.memoryMb || 0}MB</div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

    } catch (e) {
        console.error(e);
        if (document.getElementById('problem-title')) {
            document.getElementById('problem-title').innerText = "System Failure";
        }
    }
}

window.loadSubmissionIntoEditor = function (idx) {
    if (!window.problemSubmissions || !window.problemSubmissions[idx]) return;
    const s = window.problemSubmissions[idx];
    const langSelect = document.getElementById('language-selector');
    if (langSelect) langSelect.value = s.language;
    if (editor) {
        let monacoLang = s.language;
        if (monacoLang === 'c' || monacoLang === 'cpp') monacoLang = 'cpp';
        monaco.editor.setModelLanguage(editor.getModel(), monacoLang);
        editor.setValue(s.code);
        appendTerminal(`\n[SYSTEM] Loaded past submission (${s.language.toUpperCase()}) from history.`, 'blue-400');
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

            // Sync Header Stats
            if (document.getElementById('header-xp')) document.getElementById('header-xp').innerText = `${data.xp || 0} XP`;
            if (document.getElementById('header-streak')) document.getElementById('header-streak').innerText = data.dsaStreak?.current || 0;
            if (document.getElementById('streak-count')) document.getElementById('streak-count').innerText = data.dsaStreak?.current || 0;

            if (data.avatarUrl) {
                const img = document.getElementById('header-avatar');
                const icon = document.getElementById('header-avatar-icon');
                if (img) {
                    img.src = data.avatarUrl;
                    img.classList.remove('hidden');
                }
                if (icon) icon.classList.add('hidden');
            }
        }
    } catch (e) {
        console.error("Profile sync failed", e);
    }
}

function changeLanguage() {
    if (!editor) return;
    const lang = document.getElementById('language-selector').value;
    let monacoLang = lang;
    if (lang === 'c' || lang === 'cpp') monacoLang = 'cpp';

    monaco.editor.setModelLanguage(editor.getModel(), monacoLang);

    // Inject language-specific boilerplate
    let boilerplate = "";
    const title = document.getElementById('problem-title')?.innerText || "Problem";

    if (lang === 'javascript') {
        boilerplate = `/**\n* Problem: ${title}\n* Language: JavaScript\n*/\n\nfunction solve(input) {\n    // Write your solution protocol here\n    \n}\n\n// Basic input handling for testing\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8');\nconsole.log(solve(input));\n`;
    } else if (lang === 'python') {
        boilerplate = `# Problem: ${title}\n# Language: Python 3\n\nimport sys\n\ndef solve():\n    # Read input from stdin\n    # data = sys.stdin.read().split()\n    pass\n\nif __name__ == "__main__":\n    solve()\n`;
    } else if (lang === 'c') {
        boilerplate = `#include <stdio.h>\n#include <stdlib.h>\n\n/* \n * Problem: ${title}\n * Language: C\n */\n\nint main() {\n    // setvbuf used for real-time terminal output sync\n    setvbuf(stdout, NULL, _IONBF, 0);\n    \n    // Write your solution logic here\n    \n    return 0;\n}\n`;
    } else if (lang === 'cpp') {
        boilerplate = `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n\nusing namespace std;\n\n/* \n * Problem: ${title}\n * Language: C++\n */\n\nint main() {\n    // Faster I/O protocol\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    // Write your solution logic here\n    \n    return 0;\n}\n`;
    } else if (lang === 'java') {
        boilerplate = `import java.util.*;\n\n/**\n* Problem: ${title}\n* Language: Java\n*/\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution logic here\n        System.out.println("Hello from Zenith OS");\n        \n    }\n}\n`;
    } else if (lang === 'csharp' || lang === 'csharp') {
        boilerplate = `using System;\n\n/* \n * Problem: ${title}\n * Language: C#\n */\n\nclass Program {\n    static void Main() {\n        // Write your solution logic here\n        Console.WriteLine("Hello from Zenith OS");\n        \n    }\n}\n`;
    }

    if (boilerplate) editor.setValue(boilerplate);
    appendTerminal(`[SYSTEM] Switched runtime language to ${lang.toUpperCase()}`, 'blue-400');
    appendTerminal(`[SYSTEM] Boilerplate initialized for ${lang.toUpperCase()} protocol.`, 'slate-500');
}

window.toggleBookmark = async function () {
    if (!currentProblemId) return;
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/problems/${currentProblemId}/bookmark`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            const bookmarkIcon = document.getElementById('bookmark-icon');
            if (data.isSaved) {
                bookmarkIcon.classList.remove('far', 'text-slate-500');
                bookmarkIcon.classList.add('fas', 'text-amber-500');
            } else {
                bookmarkIcon.classList.remove('fas', 'text-amber-500');
                bookmarkIcon.classList.add('far', 'text-slate-500');
            }
        }
    } catch (e) {
        console.error("Failed to toggle bookmark", e);
    }
}

// Socket Connection for Terminal execution
const socketToken = localStorage.getItem('token');
const socket = io(API_BASE_URL, { auth: { token: socketToken } });

socket.on('connect', () => appendTerminal("Terminal connected to execute server.", "blue-400"));

// Fixed Terminal Stream Synchronizer
socket.on('terminal-output', (data) => {
    let color = 'white';
    if (data.type === 'stderr') color = 'red-400';
    if (data.type === 'system') color = 'slate-500';
    appendTerminal(data.data, color);
});

socket.on('error', (err) => {
    appendTerminal(`[ERROR]: ${err.message || err}`, "red-500");
});

function appendTerminal(text, colorClass, block = true) {
    const term = document.getElementById('terminal');
    if (!term) return;
    const el = document.createElement(block ? 'div' : 'span');
    el.className = `text-${colorClass} whitespace-pre-wrap break-words font-mono text-[12px]`;
    if (!block) el.className += ' inline';
    else el.className += ' block mb-1';
    el.innerText = text;
    term.appendChild(el);
    term.scrollTop = term.scrollHeight;
    return el;
}

function clearTerminal() {
    document.getElementById('terminal').innerHTML = `
        <div class="text-slate-600 mb-2">// Initializing neural terminal...</div>
        <div class="text-blue-500 mb-4 font-black">ZENITH-OS INTERACTIVE EXECUTION ENGINE v5.0 [READY]</div>
    `;
}

function runCode() {
    if (!editor) return;
    const code = editor.getValue();
    const language = document.getElementById('language-selector').value;

    // Ext mapping for execution registry - Fixed for Java/C#
    let filename = 'main.js';
    if (language === 'python') filename = 'main.py';
    else if (language === 'c') filename = 'main.c';
    else if (language === 'cpp') filename = 'main.cpp';
    else if (language === 'java') filename = 'Solution.java';
    else if (language === 'csharp') filename = 'Program.cs';

    appendTerminal(`\n> EXECUTING ${language.toUpperCase()} PROTOCOL...`, "emerald-400");

    // Fixed Emitter Payload for execute-code
    socket.emit('execute-code', {
        language: language,
        file: {
            name: filename,
            content: code
        }
    });
}

window.submitSolution = async function () {
    if (!editor || !currentProblemId) return;
    const overlay = document.getElementById('submission-overlay');
    const resultBox = document.getElementById('submission-result');
    const progress = document.getElementById('verification-progress');

    if (!overlay || !resultBox || !progress) return;

    overlay.classList.remove('hidden');
    resultBox.classList.add('hidden');

    // Reset and force reflow to ensure transition triggers from 0%
    progress.style.transition = 'none';
    progress.style.width = '0%';
    void progress.offsetWidth; // Trigger reflow

    progress.style.transition = 'width 3s cubic-bezier(0.4, 0, 0.2, 1)';
    progress.style.width = '100%';

    const statusEl = document.getElementById('submission-status');
    const updateStatus = (text) => { if (statusEl) statusEl.innerText = text; };

    // Begin high-precision telemetry stream
    updateStatus("Initializing analytical sandbox...");
    setTimeout(() => updateStatus("Loading system compiler & environment..."), 800);
    setTimeout(() => updateStatus("Executing primary test case suite..."), 1600);
    setTimeout(() => updateStatus("Validating logic patterns & complexity..."), 2400);

    const code = editor.getValue();
    const lang = document.getElementById('language-selector').value;

    try {
        const token = localStorage.getItem('token');
        const now = new Date();
        const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const res = await fetch(`${API_BASE_URL}/api/problems/${currentProblemId}/submit`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, language: lang, localDate })
        });

        const data = await res.json();

        setTimeout(() => {
            if (statusEl) statusEl.innerText = "Verification sequence complete.";
            progress.style.transition = 'none';
            progress.style.width = '100%';
            resultBox.classList.remove('hidden');

            if (data.status === 'success') {
                // Real-time Header Sync
                if (document.getElementById('header-xp')) document.getElementById('header-xp').innerText = `${data.totalXp || 0} XP`;
                if (document.getElementById('header-streak')) document.getElementById('header-streak').innerText = data.streak || 0;

                resultBox.innerHTML = `
                    <div class="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl shadow-xl">
                        <div class="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-check text-2xl text-emerald-500"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white uppercase tracking-tight mb-2">Solution Accepted</h3>
                        <p class="text-zinc-500 text-xs mb-8 uppercase tracking-widest font-mono">Validation successful. All test cases passed.</p>
                        
                        <div class="grid grid-cols-2 gap-3 mb-4">
                            <div class="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                                <span class="block text-[8px] text-zinc-600 font-black uppercase mb-1">XP Reward</span>
                                <span class="text-emerald-400 font-bold text-sm">+${data.xpEarned || 0}</span>
                            </div>
                            <div class="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                                <span class="block text-[8px] text-zinc-600 font-black uppercase mb-1">Daily Streak</span>
                                <span class="text-orange-400 font-bold text-sm">${data.streak || 0} Days</span>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-3 mb-8">
                            <div class="p-3 bg-zinc-900 border border-white/[0.03] rounded-xl">
                                <span class="block text-[8px] text-zinc-600 font-black uppercase mb-1">Runtime</span>
                                <span class="text-zinc-300 font-mono text-xs">${data.runtimeMs || 0} ms</span>
                            </div>
                            <div class="p-3 bg-zinc-900 border border-white/[0.03] rounded-xl">
                                <span class="block text-[8px] text-zinc-600 font-black uppercase mb-1">Memory</span>
                                <span class="text-zinc-300 font-mono text-xs">${data.memoryMb || 0} MB</span>
                            </div>
                        </div>

                        <button onclick="window.location.href='/arena.html'" class="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-lg">Return to Arena</button>
                    </div>
                `;
            } else {
                resultBox.innerHTML = `
                    <div class="p-8 bg-red-500/5 border border-red-500/10 rounded-2xl shadow-xl">
                        <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-times text-2xl text-red-500"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white uppercase tracking-tight mb-2">Validation Failed</h3>
                        <p class="text-zinc-500 text-xs mb-6 uppercase tracking-widest font-mono">${data.message || 'One or more test cases failed to meet the required criteria.'}</p>
                        
                        <div class="grid grid-cols-2 gap-3 mb-8">
                            <div class="p-3 bg-zinc-900 border border-white/[0.03] rounded-xl">
                                <span class="block text-[8px] text-zinc-600 font-black uppercase mb-1">Runtime</span>
                                <span class="text-zinc-300 font-mono text-xs">${data.runtimeMs || 0} ms</span>
                            </div>
                            <div class="p-3 bg-zinc-900 border border-white/[0.03] rounded-xl">
                                <span class="block text-[8px] text-zinc-600 font-black uppercase mb-1">Memory</span>
                                <span class="text-zinc-300 font-mono text-xs">${data.memoryMb || 0} MB</span>
                            </div>
                        </div>

                        <button onclick="document.getElementById('submission-overlay').classList.add('hidden')" class="w-full py-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all">Review & Debug</button>
                    </div>
                `;
            }
        }, 3000);

    } catch (e) {
        console.error(e);
        progress.style.width = '0%';
        overlay.classList.add('hidden');
        alert("Solution verification failed. Server unreachable.");
    }
}

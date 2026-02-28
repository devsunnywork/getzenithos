// Zenith OS DSA Arena Solver Logic
const API_BASE_URL = location.origin;
let editor;
let currentProblemId = null;

// Initialize Workspace/Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
    const editorEl = document.getElementById('monaco-editor');
    editorEl.parentElement.classList.remove('hidden');

    editor = monaco.editor.create(editorEl, {
        value: "// Loading Code Neural Interface...\n",
        language: 'javascript',
        theme: 'vs-dark',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        wordWrap: 'off',
        cursorBlinking: 'smooth',
        lineHeight: 24,
        padding: { top: 16 }
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
});

// Settings Modal Logic
function toggleSettingsModal(show) {
    const modal = document.getElementById('settings-modal');
    if (show) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

function applySettings() {
    if (!editor) return;
    const fontSize = parseInt(document.getElementById('setting-font-size').value) || 14;
    const wordWrap = document.getElementById('setting-word-wrap').checked ? 'on' : 'off';
    const minimap = document.getElementById('setting-minimap').checked;
    const cursor = document.getElementById('setting-cursor').value;

    editor.updateOptions({
        fontSize,
        wordWrap,
        minimap: { enabled: minimap },
        cursorBlinking: cursor
    });
    toggleSettingsModal(false);
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
        const token = localStorage.getItem('zenith_token');
        const res = await fetch(`${API_BASE_URL}/api/problems/${pid}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch problem data");
        const data = await res.json();

        // Populate UI
        document.getElementById('problem-title').innerText = data.title;
        document.getElementById('problem-description').innerHTML = `<p>${data.description.replace(/\n/g, '<br/>')}</p>`;

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

        // Set default boilerplate logic based on language (optional improvement future)
        if (editor) {
            editor.setValue(`// Zenith OS Neural Compiler\n// Problem: ${data.title}\n\nfunction solve(input) {\n    // Write your solution here\n    \n}\n`);
            document.getElementById('language-selector').value = 'javascript';
        }

    } catch (e) {
        console.error(e);
        document.getElementById('problem-title').innerText = "System Failure";
        document.getElementById('problem-description').innerHTML = `<p class='text-red-500'>Could not synchronize neural parameters: ${e.message}</p>`;
    }
}

function changeLanguage() {
    if (!editor) return;
    const lang = document.getElementById('language-selector').value;
    let monacoLang = lang;
    if (lang === 'c' || lang === 'cpp') monacoLang = 'cpp';

    monaco.editor.setModelLanguage(editor.getModel(), monacoLang);
    appendTerminal(`[SYSTEM] Switched runtime language to ${lang.toUpperCase()}`, 'slate-500');
}

window.toggleBookmark = async function () {
    if (!currentProblemId) return;
    try {
        const token = localStorage.getItem('zenith_token');
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

// Socket Connection for Terminal execution (Fallback stub for standard code execution)
const socketToken = localStorage.getItem('zenith_token');
const socket = io(API_BASE_URL, {
    auth: { token: socketToken }
});

socket.on('connect', () => appendTerminal("Terminal connected to execute server.", "blue-400"));
socket.on('output', (data) => appendTerminal(data.content, "white"));
socket.on('error', (data) => appendTerminal(data.content, "red-400"));

function appendTerminal(text, colorClass, block = true) {
    const term = document.getElementById('terminal');
    const el = document.createElement(block ? 'div' : 'span');
    el.className = `text-${colorClass} whitespace-pre-wrap break-words`;
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

    appendTerminal(`\n> EXECUTING ${language.toUpperCase()} PROTOCOL...`, "blue-400");

    socket.emit('run_code', {
        code,
        language
    });
}

function submitSolution() {
    appendTerminal(`\n> SUBMITTING NEURAL SOLUTION PROTOCOL [UNAVAILABLE: Engine Under Construction]`, "yellow-400");
    alert("Submission Engine Under Construction!");
}

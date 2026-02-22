// Neural Code Nexus - File Manager First IDE Controller v2.0
let editor;
let workspace = null;
let activeFile = null;
let contextNodeId = null; // ID of the file being right-clicked

// Initialize Monaco Editor
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('monaco-editor'), {
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        minimap: { enabled: false }, // Disable minimap for cleaner look
        wordWrap: 'off'
    });

    // Add Ctrl+S / Cmd+S Shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        saveProject();
    });

    // Custom theme styling
    monaco.editor.defineTheme('zenith-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
            'editor.background': '#020202',
            'editor.lineHighlightBackground': '#ffffff05',
        }
    });
    monaco.editor.setTheme('zenith-dark');

    // Auto-save buffer to active file on change
    editor.onDidChangeModelContent(() => {
        if (activeFile) {
            activeFile.content = editor.getValue();
            // Optional: debounce saveWorkspace() here if aggressive auto-sync is needed
        }
    });

    loadWorkspace();
});

async function loadWorkspace() {
    try {
        ZLoader.show("Syncing Master Workspace...");
        const res = await fetch(`${API_BASE_URL}/api/code/workspace`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to load workspace");
        workspace = await res.json();

        renderFileExplorer();

        // Clear the editor state
        activeFile = null;
        document.getElementById('empty-state').classList.remove('hidden');
        document.getElementById('editor-wrapper').classList.add('hidden');
        document.getElementById('tab-bar').classList.add('hidden');
        ZLoader.hide();
    } catch (e) {
        console.error('Fetch Workspace Failed:', e);
        showToast("Failed to connect to Neural Link", "error");
        ZLoader.hide();
    }
}

// ----------------------------------------------------
// UI Rendering
// ----------------------------------------------------

function renderFileExplorer() {
    const explorer = document.getElementById('file-explorer');
    explorer.innerHTML = workspace.files.map(f => `
        <div onclick="openFileById('${f._id}')" oncontextmenu="handleContextMenu(event, '${f._id}')" class="file-item ${activeFile?._id === f._id ? 'active' : ''}">
            <i class="fas ${getFileIcon(f.language)} ${activeFile?._id === f._id ? 'text-blue-500' : 'text-slate-500'}"></i>
            <span class="font-bold tracking-tight uppercase">${f.name}</span>
        </div>
    `).join('');
}

function getFileIcon(lang) {
    if (lang === 'java') return 'fa-brands fa-java';
    if (lang === 'cpp' || lang === 'c') return 'fas fa-c';
    if (lang === 'csharp' || lang === 'cs') return 'fas fa-hashtag';
    if (lang === 'javascript' || lang === 'js') return 'fa-brands fa-js';
    if (lang === 'python' || lang === 'py') return 'fa-brands fa-python';
    return 'fa-file-code';
}

function openFileById(id) {
    const f = workspace.files.find(f => f._id === id);
    if (f) openFile(f);
}

function openFile(file) {
    activeFile = file;

    // Set editor language (Monaco language map)
    let langMap = {
        'java': 'java', 'cpp': 'cpp', 'c': 'c', 'cs': 'csharp', 'csharp': 'csharp',
        'js': 'javascript', 'javascript': 'javascript', 'py': 'python', 'python': 'python'
    };
    let lang = langMap[file.language] || 'plaintext';

    const oldModel = editor.getModel();
    const newModel = monaco.editor.createModel(file.content, lang);
    editor.setModel(newModel);
    if (oldModel) oldModel.dispose();

    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('editor-wrapper').classList.remove('hidden');
    document.getElementById('editor-wrapper').classList.add('flex');
    document.getElementById('tab-bar').classList.remove('hidden');

    renderTabs();
    renderFileExplorer();
}

function renderTabs() {
    const bar = document.getElementById('tab-bar');
    if (!activeFile) { bar.innerHTML = ''; return; }
    bar.innerHTML = `
        <div class="tab-item active">
            <i class="fas ${getFileIcon(activeFile.language)} text-[10px] text-blue-500"></i>
            <span>${activeFile.name.toUpperCase()}</span>
        </div>
    `;
}

// ----------------------------------------------------
// File Operations (CRUD)
// ----------------------------------------------------

async function createNewFile() {
    const name = prompt("Enter file name (e.g., Script.js, Main.java):");
    if (!name) return;

    // Determine basic lang from extension
    const ext = name.split('.').pop().toLowerCase();

    // Generate Template Boilerplate
    let defaultContent = `// New ${ext.toUpperCase()} Source File\n`;
    if (ext === 'java') {
        const className = name.split('.')[0];
        defaultContent = `public class ${className} {\n    public static void main(String[] args) {\n        System.out.println("Neural Link Established: Java Module active!");\n    }\n}`;
    } else if (ext === 'c') {
        defaultContent = `#include <stdio.h>\n\nint main() {\n    printf("Neural Link Established: C Module active!\\n");\n    return 0;\n}`;
    } else if (ext === 'cpp') {
        defaultContent = `#include <iostream>\n\nint main() {\n    std::cout << "Neural Link Established: C++ Module active!" << std::endl;\n    return 0;\n}`;
    } else if (ext === 'py') {
        defaultContent = `print("Neural Link Established: Python Module active!")`;
    } else if (ext === 'html') {
        defaultContent = `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>Document</title>\n</head>\n<body>\n    \n</body>\n</html>`;
    } else if (ext === 'js') {
        defaultContent = `console.log("Neural Link Established: JS Module active!");`;
    }

    // Create new file object
    const newFile = {
        name: name,
        content: defaultContent,
        language: ext,
        path: name
    };

    workspace.files.push(newFile);
    await saveWorkspace();

    // Automatically open the new file (which now has an _id from the server)
    // Hide context menu automatically
    document.getElementById('file-context-menu').classList.add('hidden');
}

function openInEditor() {
    if (contextNodeId) {
        openFileById(contextNodeId);
        document.getElementById('file-context-menu').classList.add('hidden');
    }
}

// Temporary disabled folders for flat structure, can be expanded later
function createNewFolder() {
    showToast("Folder structure coming in v1.1", "error");
}

function handleContextMenu(e, id) {
    e.preventDefault();
    contextNodeId = id;
    const menu = document.getElementById('file-context-menu');
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    menu.classList.remove('hidden');
}

document.addEventListener('click', () => {
    document.getElementById('file-context-menu').classList.add('hidden');
});

async function renameActiveNode() {
    if (!contextNodeId) return;
    const f = workspace.files.find(file => file._id === contextNodeId);
    if (!f) return;

    const newName = prompt(`Rename ${f.name} to:`, f.name);
    if (newName && newName !== f.name) {
        f.name = newName;
        f.path = newName;
        f.language = newName.split('.').pop().toLowerCase();

        // If active file is renamed, force re-open to trigger language syntax update
        if (activeFile && activeFile._id === f._id) {
            openFile(f);
        } else {
            renderFileExplorer();
        }
        await saveWorkspace();
    }
}

async function deleteActiveNode() {
    if (!contextNodeId) return;
    const f = workspace.files.find(file => file._id === contextNodeId);
    if (!f) return;

    if (confirm(`Are you sure you want to permanently delete ${f.name}?`)) {
        workspace.files = workspace.files.filter(file => file._id !== contextNodeId);

        if (activeFile && activeFile._id === contextNodeId) {
            activeFile = null;
            if (workspace.files.length > 0) {
                openFile(workspace.files[0]);
            } else {
                editor.setModel(monaco.editor.createModel('// File deleted.', 'plaintext'));
                document.getElementById('tab-bar').innerHTML = '';
            }
        }
        renderFileExplorer();
        await saveWorkspace();
    }
}

async function saveWorkspace() {
    if (!workspace) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/code/projects/${workspace._id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: workspace.files,
                folders: workspace.folders || []
            })
        });
        if (res.ok) {
            workspace = await res.json(); // refresh to get new _ids if any
            renderFileExplorer();
        } else {
            showToast("Sync Failure", "error");
        }
    } catch (e) {
        showToast("Sync Failure", "error");
    }
}

// ----------------------------------------------------
// Interactive Execution Engine (Socket.io)
// ----------------------------------------------------

let currentTerminalInput = '';
let terminalActive = false;
const socket = io();

// Receive output from server
socket.on('terminal-output', (payload) => {
    if (payload.type === 'stderr') {
        appendTerminal(payload.data, 'red-500');
    } else if (payload.type === 'system') {
        appendTerminal(payload.data, 'slate-500 font-bold');
        terminalActive = false;
        flushTerminalInput();
    } else {
        appendTerminal(payload.data, 'white');
    }
});

// Handle inline terminal keystrokes
document.getElementById('terminal').addEventListener('keydown', (e) => {
    if (!terminalActive) return;

    if (e.key === 'Enter') {
        e.preventDefault();
        const val = currentTerminalInput;
        // The characters are already rendered via standard echo, just submit
        socket.emit('terminal-input', { input: val });
        currentTerminalInput = ''; // Reset buffer
        appendTerminal('', 'white'); // visual newline
    } else if (e.key === 'Backspace') {
        if (currentTerminalInput.length > 0) {
            e.preventDefault();
            currentTerminalInput = currentTerminalInput.slice(0, -1);
            // Replace the last line visually
            const term = document.getElementById('terminal');
            if (term.lastElementChild) term.lastElementChild.innerText = currentTerminalInput;
        }
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        currentTerminalInput += e.key;

        // Either append to existing inline, or create new block
        const term = document.getElementById('terminal');
        if (currentTerminalInput.length === 1 || !term.lastElementChild) {
            appendTerminal(e.key, 'blue-400');
        } else {
            term.lastElementChild.innerText = currentTerminalInput;
        }
    }
});

function flushTerminalInput() {
    currentTerminalInput = '';
}

// Map frontend extensions (which user might use) to executor identifiers
function getPistonLanguageAlias(ext) {
    const map = {
        'js': 'javascript',
        'py': 'python',
        'java': 'java',
        'c': 'c',
        'cpp': 'cpp',
        'cs': 'csharp',
        'csharp': 'csharp'
    };
    return map[ext] || ext;
}

async function runCode() {
    if (!activeFile || !workspace) return;

    // Force autosave before run
    activeFile.content = editor.getValue();
    await saveWorkspace();

    clearTerminal();
    appendTerminal(`[SYSTEM] Initializing interactive execution engine for ${activeFile.name}...`, 'slate-500');

    // Enable inline terminal processing
    terminalActive = true;
    currentTerminalInput = '';
    document.getElementById('terminal').focus();

    const langAlias = getPistonLanguageAlias(activeFile.language);

    // Stream execution via Socket.io instead of static Fetch
    socket.emit('execute-code', {
        language: langAlias,
        file: { name: activeFile.name, content: activeFile.content }
    });
}

function saveProject() {
    saveWorkspace();
    showToast("Workspace Synced", "success");
}

// ----------------------------------------------------
// Editor Settings
// ----------------------------------------------------

let editorConfig = {
    fontSize: 14,
    wordWrap: 'off',
    minimap: false,
    suggestions: true,
    cursorBlinking: 'smooth'
};

function toggleSettingsModal(show) {
    const modal = document.getElementById('settings-modal');
    if (show) {
        modal.classList.remove('hidden');
        document.getElementById('setting-font-size').value = editorConfig.fontSize;
        document.getElementById('setting-word-wrap').checked = editorConfig.wordWrap === 'on';
        document.getElementById('setting-minimap').checked = editorConfig.minimap;
        document.getElementById('setting-suggestions').checked = editorConfig.suggestions;
        document.getElementById('setting-cursor').value = editorConfig.cursorBlinking;
    } else {
        modal.classList.add('hidden');
    }
}

function applySettings() {
    editorConfig.fontSize = parseInt(document.getElementById('setting-font-size').value) || 14;
    editorConfig.wordWrap = document.getElementById('setting-word-wrap').checked ? 'on' : 'off';
    editorConfig.minimap = document.getElementById('setting-minimap').checked;
    editorConfig.suggestions = document.getElementById('setting-suggestions').checked;
    editorConfig.cursorBlinking = document.getElementById('setting-cursor').value;

    if (editor) {
        editor.updateOptions({
            fontSize: editorConfig.fontSize,
            wordWrap: editorConfig.wordWrap,
            minimap: { enabled: editorConfig.minimap },
            quickSuggestions: editorConfig.suggestions,
            suggestOnTriggerCharacters: editorConfig.suggestions,
            cursorBlinking: editorConfig.cursorBlinking
        });
    }

    toggleSettingsModal(false);
    // showToast("Editor Settings Updated", "success"); // Removed toast so it is quiet and slick
}

function appendTerminal(text, colorClass) {
    const term = document.getElementById('terminal');
    const div = document.createElement('div');
    if (colorClass === 'blue-400') {
        // user input lines shouldn't break visually in a weird way, force inline behavior
        div.className = `text-${colorClass} whitespace-pre-wrap font-bold break-all inline-block w-full`;
    } else {
        div.className = `text-${colorClass} mb-1 whitespace-pre-wrap break-all`;
    }
    div.innerText = text;
    term.appendChild(div);
    term.scrollTop = term.scrollHeight;
}

function clearTerminal() {
    document.getElementById('terminal').innerHTML = '';
}

function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} rounded-2xl text-white font-black uppercase text-[10px] tracking-widest z-[200] animate-in slide-in-from-bottom-10 shadow-2xl`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

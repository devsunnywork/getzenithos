// Neural Code Nexus - File Manager First IDE Controller v2.0

// Set up Monaco Environment to bypass CSP Worker Blob blocks
window.MonacoEnvironment = {
    getWorkerUrl: function (workerId, label) {
        return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = { baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/' };
            importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/base/worker/workerMain.js');
        `)}`;
    }
};

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
            const oldContent = activeFile.content;
            activeFile.content = editor.getValue();
            if (oldContent !== activeFile.content) {
                activeFile.isDirty = true;
                renderTabs();
            }
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
    explorer.innerHTML = workspace.files.map(f => {
        const isEditing = f._isRenaming;
        const nameDisplay = isEditing
            ? `<input type="text" id="rename-input-${f._id}" value="${f.name}" class="bg-transparent border-b border-blue-500 text-white outline-none w-full ml-2" onblur="commitRename('${f._id}')" onkeydown="handleRenameKey(event, '${f._id}')">`
            : `<span class="font-bold tracking-tight uppercase ml-2">${f.name}</span>`;

        return `
            <div onclick="if(!${isEditing}) openFileById('${f._id}')" oncontextmenu="handleContextMenu(event, '${f._id}')" class="file-item ${activeFile?._id === f._id ? 'active' : ''}">
                <i class="fas ${getFileIcon(f.language)} ${activeFile?._id === f._id ? 'text-blue-500' : 'text-slate-500'}"></i>
                ${nameDisplay}
            </div>
        `;
    }).join('');

    // Auto-focus input if one exists
    const input = document.querySelector('input[id^="rename-input-"]');
    if (input) {
        input.focus();
        input.select();
    }
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
    const dirtyDot = activeFile.isDirty ? `<div class="w-2 h-2 rounded-full bg-white ml-2"></div>` : '';
    bar.innerHTML = `
        <div class="tab-item active flex items-center">
            <i class="fas ${getFileIcon(activeFile.language)} text-[10px] text-blue-500"></i>
            <span>${activeFile.name.toUpperCase()}</span>
            ${dirtyDot}
        </div>
    `;
}

// ----------------------------------------------------
// File Operations (CRUD)
// ----------------------------------------------------

async function createNewFile() {
    // Generate temporary ID
    const tempId = 'temp_' + Date.now();

    // Create new file object in renaming state
    const newFile = {
        _id: tempId,
        name: 'Untitled.js',
        content: '// New file\n',
        language: 'js',
        path: 'Untitled.js',
        _isRenaming: true,
        _isNew: true
    };

    workspace.files.push(newFile);
    renderFileExplorer();

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

    f._isRenaming = true;
    renderFileExplorer();
    document.getElementById('file-context-menu').classList.add('hidden');
}

function handleRenameKey(e, id) {
    if (e.key === 'Enter') {
        e.preventDefault();
        commitRename(id);
    } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelRename(id);
    }
}

function cancelRename(id) {
    const f = workspace.files.find(file => file._id === id);
    if (!f) return;

    if (f._isNew) {
        // Cancel creating new file
        workspace.files = workspace.files.filter(file => file._id !== id);
    } else {
        f._isRenaming = false;
    }
    renderFileExplorer();
}

async function commitRename(id) {
    const f = workspace.files.find(file => file._id === id);
    if (!f) return;

    const input = document.getElementById(`rename-input-${id}`);
    if (!input) return;

    const newName = input.value.trim();
    if (!newName) {
        cancelRename(id);
        return;
    }

    const oldName = f.name;
    f.name = newName;
    f.path = newName;

    const ext = newName.split('.').pop().toLowerCase();
    f.language = ext;
    f._isRenaming = false;

    // Expand boilerplate if it's a new file
    if (f._isNew) {
        delete f._isNew;
        delete f._id; // Remove temp ID so server assigns a real one

        let defaultContent = `// New ${ext.toUpperCase()} Source File\n`;
        if (ext === 'java') {
            const className = newName.split('.')[0];
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
        f.content = defaultContent;
    }

    // Refresh editor language if active
    if (activeFile && activeFile.name === oldName) {
        openFile(f);
    } else {
        renderFileExplorer();
    }

    await saveWorkspace();
    if (f.content) openFile(workspace.files.find(file => file.name === f.name));
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
        // Strip out any UI-only flags before sending
        const payloadFiles = workspace.files.map(f => {
            const copy = { ...f };
            delete copy._isRenaming;
            delete copy._isNew;
            delete copy.isDirty;
            return copy;
        });

        const res = await fetch(`${API_BASE_URL}/api/code/projects/${workspace._id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: payloadFiles,
                folders: workspace.folders || []
            })
        });
        if (res.ok) {
            workspace = await res.json(); // refresh to get new _ids if any

            // Re-bind activeFile to new object and clear dirty flag
            if (activeFile) {
                activeFile = workspace.files.find(f => f.name === activeFile.name);
                if (activeFile) activeFile.isDirty = false;
            }

            renderFileExplorer();
            renderTabs();
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

// Ensure Socket connects across origins if UI is hosted on a Live Server (5500)
// This will naturally throw a ReferenceError if the library maliciously fails to load,
// which is much better than silently keeping socket = null forever.
// token is already declared globally
const socket = io(typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:5000', {
    auth: {
        token: token
    }
});

let currentTerminalLineDiv = null;

// Receive output from server
socket.on('terminal-output', (payload) => {
    if (payload.type === 'stderr') {
        appendTerminal(payload.data, 'red-500', true);
        currentTerminalLineDiv = null;
    } else if (payload.type === 'system') {
        appendTerminal(payload.data, 'text-slate-500 font-bold', true);
        terminalActive = false;
        flushTerminalInput();
        currentTerminalLineDiv = null;
        updateTerminalCursor(false);
    } else {
        // stdout output
        if (!currentTerminalLineDiv || currentTerminalLineDiv.querySelector('.typed-input')) {
            currentTerminalLineDiv = appendTerminal(payload.data, 'white', false);
        } else {
            const term = document.getElementById('terminal');
            const cursor = term.querySelector('.terminal-cursor');
            if (cursor) term.removeChild(cursor);

            currentTerminalLineDiv.innerText += payload.data;

            if (terminalActive) updateTerminalCursor(true);
            term.scrollTop = term.scrollHeight;
        }

        // Always ensure cursor is visible at the end of output if terminal is active
        if (terminalActive) updateTerminalCursor(true);
    }
});

// Handle inline terminal keystrokes
document.getElementById('terminal').addEventListener('keydown', (e) => {
    if (!terminalActive || !socket) return;

    if (e.key === 'Enter') {
        e.preventDefault();
        const val = currentTerminalInput;
        // Submit the input
        socket.emit('terminal-input', { input: val });
        currentTerminalInput = ''; // Reset buffer

        // Finalize typed input so it can't be modified
        if (currentTerminalLineDiv) {
            let typedSpan = currentTerminalLineDiv.querySelector('.typed-input');
            if (typedSpan) typedSpan.classList.remove('typed-input');
        }

        appendTerminal('', 'white', true); // New line after enter
        currentTerminalLineDiv = null;
        updateTerminalCursor(false);
    } else if (e.key === 'Backspace') {
        if (currentTerminalInput.length > 0) {
            e.preventDefault();
            currentTerminalInput = currentTerminalInput.slice(0, -1);
            updateTerminalInputLine();
        }
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        currentTerminalInput += e.key;
        updateTerminalInputLine();
    }
});

function updateTerminalInputLine() {
    const term = document.getElementById('terminal');

    if (!currentTerminalLineDiv || !currentTerminalLineDiv.querySelector('.typed-input')) {
        currentTerminalLineDiv = appendTerminal('', 'blue-400 font-bold', false);
    }

    let typedSpan = currentTerminalLineDiv.querySelector('.typed-input');
    if (typedSpan) {
        typedSpan.innerText = currentTerminalInput;
    }

    updateTerminalCursor(true);
    term.scrollTop = term.scrollHeight;
}

function updateTerminalCursor(show) {
    const term = document.getElementById('terminal');
    let cursor = term.querySelector('.terminal-cursor');

    // Create cursor if it doesn't exist and needs to be shown
    if (!cursor && show) {
        cursor = document.createElement('span');
        cursor.className = 'terminal-cursor text-white';
    }

    // Always append cursor to the very end of the terminal container
    if (cursor) {
        if (show) {
            term.appendChild(cursor);
            cursor.style.display = 'inline-block';
        } else {
            cursor.style.display = 'none';
        }
    }
}

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
    currentTerminalLineDiv = null;

    document.getElementById('terminal').focus();
    updateTerminalCursor(true);

    const ext = activeFile.name.split('.').pop().toLowerCase();
    const langAlias = getPistonLanguageAlias(ext);

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
}

function appendTerminal(text, colorClass, block = true) {
    const term = document.getElementById('terminal');

    // Temporarily remove cursor to append before it
    const cursor = term.querySelector('.terminal-cursor');
    if (cursor) term.removeChild(cursor);

    const el = document.createElement(block ? 'div' : 'span');

    if (colorClass.includes('blue-400')) {
        el.className = `text-blue-400 whitespace-pre-wrap font-bold break-words inline`;
        el.innerHTML = '<span class="typed-input text-blue-400"></span>';
    } else {
        el.className = `text-${colorClass} whitespace-pre-wrap break-words`;
        if (!block) el.className += ' inline';
        else el.className += ' block mb-1';
        el.innerText = text;
    }

    term.appendChild(el);
    if (cursor) term.appendChild(cursor); // Put cursor back at the end

    term.scrollTop = term.scrollHeight;
    return el;
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

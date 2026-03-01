const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const Project = require('../models/Project');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// @route   GET /api/code/workspace
// @desc    Get or create the master workspace for a user
router.get('/workspace', auth, async (req, res) => {
    try {
        let workspace = await Project.findOne({ user: req.user._id, name: 'Master Workspace' });

        if (!workspace) {
            // Auto-provision if it doesn't exist
            const newWorkspace = new Project({
                user: req.user._id,
                name: 'Master Workspace',
                description: 'Unified file manager workspace',
                language: 'multi',
                files: [{
                    name: 'Main.java',
                    content: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Neural Link Established: Hello, Java operative!");\n    }\n}',
                    language: 'java',
                    path: 'Main.java'
                }]
            });
            workspace = await newWorkspace.save();
        }
        res.json(workspace);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/code/projects/:id
// @desc    Update project (files/folders)
router.put('/projects/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project || project.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        project.files = req.body.files || project.files;
        project.folders = req.body.folders || project.folders;
        project.updatedAt = Date.now();

        await project.save();
        res.json(project);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/code/run
// @desc    Execute code locally
router.post('/run', auth, async (req, res) => {
    const { language, version, files } = req.body;

    if (!files || files.length === 0) return res.status(400).json({ error: 'No files provided' });

    const file = files[0];
    const tempDir = path.join(__dirname, '../../temp_execution_' + Date.now());

    try {
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const filePath = path.join(tempDir, file.name);
        fs.writeFileSync(filePath, file.content);

        let execCommand = '';
        const lang = language.toLowerCase();

        if (lang === 'java') {
            // Java requires the class name to match exactly, but let's blindly compile and run the file name
            const className = file.name.replace('.java', '');
            execCommand = `javac "${file.name}" && java "${className}"`;
        } else if (lang === 'python' || lang === 'py') {
            execCommand = `python3 "${file.name}"`;
        } else if (lang === 'javascript' || lang === 'js') {
            execCommand = `node "${file.name}"`;
        } else if (lang === 'cpp') {
            execCommand = `g++ "${file.name}" -o out && ./out`;
        } else if (lang === 'c') {
            execCommand = `gcc "${file.name}" -o out && ./out`;
        } else if (lang === 'csharp' || lang === 'cs') {
            execCommand = `mcs "${file.name}" && mono "${file.name.replace('.cs', '.exe')}"`;
        } else {
            return res.status(400).json({ error: 'Unsupported local execution language' });
        }

        exec(execCommand, { cwd: tempDir, timeout: 5000 }, (error, stdout, stderr) => {
            // Clean up
            try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) { }

            if (error) {
                return res.json({ run: { stdout: stdout, stderr: stderr || error.message } });
            }
            res.json({ run: { stdout: stdout, stderr: stderr } });
        });

    } catch (err) {
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) { }
        console.error('Local Execution Error:', err);
        res.status(500).json({ error: 'Code execution failed' });
    }
});

function getDefaultCode(lang) {
    if (lang === 'java') return 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Neural Link Established: Hello, Java operative!");\n    }\n}';
    if (lang === 'cpp') return '#include <iostream>\n\nint main() {\n    std::cout << "Neural Link Established: Hello, C++ operative!" << std::endl;\n    return 0;\n}';
    if (lang === 'c') return '#include <stdio.h>\n\nint main() {\n    printf("Neural Link Established: Hello, C operative!\\n");\n    return 0;\n}';
    if (lang === 'csharp') return 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Neural Link Established: Hello, C# operative!");\n    }\n}';
    return '';
}

module.exports = router;

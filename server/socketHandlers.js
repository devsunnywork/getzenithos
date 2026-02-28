const jwt = require('jsonwebtoken');
const Group = require('./models/Group');
const User = require('./models/User');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Store active processes per socket ID
const activeProcesses = {};

const killProcessTree = (child) => {
    try {
        if (process.platform === 'win32') {
            exec(`taskkill /pid ${child.pid} /T /F`, () => { });
        } else {
            child.kill('SIGKILL');
        }
    } catch (err) { }
};

module.exports = (io) => {
    // Middleware to authenticate socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error'));

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
            socket.user = decoded;
            next();
        });
    });

    io.on('connection', (socket) => {
        console.log(`User connected via WS: ${socket.user.id}`);

        socket.on('join_channel', async ({ groupId, channelId }) => {
            try {
                // Verify user is member of group
                const group = await Group.findById(groupId);
                if (!group) return;

                const isMember = group.isMember(socket.user.id);
                if (!isMember && group.visibility === 'private') {
                    // Admins could potentially view, but generally must be a member
                    const userRecord = await User.findById(socket.user.id);
                    if (!userRecord || userRecord.role !== 'admin') {
                        return socket.emit('error', { message: 'Not a member of this group' });
                    }
                }

                // Leave previous channels
                Array.from(socket.rooms).forEach(room => {
                    if (room !== socket.id) socket.leave(room);
                });

                // Join the new channel room
                const roomName = `${groupId}:${channelId}`;
                socket.join(roomName);
                console.log(`User ${socket.user.id} joined channel ${roomName}`);
            } catch (err) {
                console.error('Socket Join Error:', err);
            }
        });

        socket.on('typing', ({ groupId, channelId, username }) => {
            const roomName = `${groupId}:${channelId}`;
            socket.to(roomName).emit('typing', { username });
        });

        // ==========================================
        // Code execution streams
        // ==========================================
        socket.on('execute-code', ({ language, file }) => {
            if (activeProcesses[socket.id]) {
                // Kill existing if re-running
                killProcessTree(activeProcesses[socket.id]);
                delete activeProcesses[socket.id];
            }

            const tempDir = path.join(__dirname, '../temp_execution_' + socket.id + '_' + Date.now());
            try {
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const filePath = path.join(tempDir, file.name);
                fs.writeFileSync(filePath, file.content);

                let command = '';
                let args = [];
                const lang = language.toLowerCase();

                if (lang === 'java') {
                    const className = file.name.replace('.java', '');
                    command = `javac "${file.name}" && java "${className}"`;
                    args = [];
                } else if (lang === 'python' || lang === 'py') {
                    command = `python -u "${file.name}"`; // Force unbuffered output
                    args = [];
                } else if (lang === 'javascript' || lang === 'js') {
                    command = `node "${file.name}"`;
                    args = [];
                } else if (lang === 'cpp') {
                    const regex = /(int|void)\s+main\s*\([^)]*\)\s*\{/;
                    if (regex.test(file.content)) fs.writeFileSync(filePath, file.content.replace(regex, `$& setvbuf(stdout, NULL, _IONBF, 0);`));
                    command = `g++ "${file.name}" -o out.exe && out.exe`;
                    args = [];
                } else if (lang === 'c') {
                    const regex = /(int|void)\s+main\s*\([^)]*\)\s*\{/;
                    if (regex.test(file.content)) fs.writeFileSync(filePath, file.content.replace(regex, `$& setvbuf(stdout, NULL, _IONBF, 0);`));
                    command = `gcc "${file.name}" -o out.exe && out.exe`;
                    args = [];
                } else if (lang === 'csharp' || lang === 'cs') {
                    command = `csc /out:program.exe "${file.name}" && program.exe`;
                    args = [];
                }

                // Explicitly spawn with shell: true for correct parsing of chained operators (&&) and quotes
                const child = spawn(command, args, {
                    cwd: tempDir,
                    shell: true,
                    env: { ...process.env, PYTHONUNBUFFERED: '1' }
                });
                activeProcesses[socket.id] = child;

                child.on('error', (err) => {
                    socket.emit('terminal-output', { type: 'stderr', data: `\n[Execution Engine Failed to Start]: ${err.message}` });
                });

                if (child.stdout) {
                    child.stdout.on('data', (data) => {
                        socket.emit('terminal-output', { type: 'stdout', data: data.toString() });
                    });
                }

                if (child.stderr) {
                    child.stderr.on('data', (data) => {
                        socket.emit('terminal-output', { type: 'stderr', data: data.toString() });
                    });
                }

                child.on('close', (code) => {
                    socket.emit('terminal-output', { type: 'system', data: `\n[Process exited with code ${code}]` });
                    delete activeProcesses[socket.id];
                    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) { }
                });

            } catch (err) {
                socket.emit('terminal-output', { type: 'stderr', data: `Error initializing execution: ${err.message}` });
                try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) { }
            }
        });

        socket.on('terminal-input', ({ input }) => {
            const child = activeProcesses[socket.id];
            if (child && child.stdin) {
                child.stdin.write(input + '\n');
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected WS: ${socket.user.id}`);
            if (activeProcesses[socket.id]) {
                killProcessTree(activeProcesses[socket.id]);
                delete activeProcesses[socket.id];
            }
        });
    });
};

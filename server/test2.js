const { spawn } = require('child_process');
const child = spawn('javac "main.java" && java "main"', [], { shell: true });
child.stdout.on('data', d => console.log('OUT:', d.toString()));
child.stderr.on('data', d => console.error('ERR:', d.toString()));

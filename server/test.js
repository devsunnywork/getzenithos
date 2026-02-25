const { spawn } = require('child_process');
const child = spawn('cmd.exe', ['/c', 'javac "main.java" && java "main"'], { shell: false });
child.stdout.on('data', d => console.log(typeof d, d.toString()));
child.stderr.on('data', d => console.error(typeof d, d.toString()));

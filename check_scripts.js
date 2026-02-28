
const fs = require('fs');
const content = fs.readFileSync('c:\\Advik\\Development\\Project Alpha\\admin.html', 'utf-8');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let i = 0;
while ((match = scriptRegex.exec(content)) !== null) {
    const code = match[1];
    if (code.trim()) {
        const tempFile = `c:\\Advik\\Development\\Project Alpha\\tmp_script_${i}.js`;
        fs.writeFileSync(tempFile, code);
        console.log(`Checking script ${i}...`);
        try {
            require('child_process').execSync(`node --check "${tempFile}"`);
            console.log(`Script ${i} is VALID.`);
        } catch (e) {
            console.error(`Script ${i} has syntax ERRORS:`);
            console.error(e.stderr?.toString() || e.message);
        }
        i++;
    }
}

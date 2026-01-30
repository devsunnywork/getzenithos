const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public/js/explore-tree.js');
let content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

let fixed = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(".replace(/`([^ `]*)` / g")) {
        console.log(`Found broken line at index ${i}: ${lines[i].trim()}`);
        lines[i] = lines[i].replace(".replace(/`([^ `]*)` / g", ".replace(/`([^`]*)`/g");
        fixed = true;
    }
}

if (fixed) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log("File updated successfully via line search.");
} else {
    console.log("Could not find the broken line.");
}

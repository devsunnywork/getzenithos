async function run() {
    try {
        const res = await fetch('https://wandbox.org/api/list.json');
        const data = await res.json();
        const langs = {};
        for (const c of data) {
            if (!langs[c.language]) langs[c.language] = [];
            langs[c.language].push(c.name);
        }
        console.log("Java:", langs["Java"][0]);
        console.log("Python:", langs["Python"][0]);
        console.log("C++:", langs["C++"][0]);
        console.log("C:", langs["C"][0]);
        console.log("JavaScript:", langs["JavaScript"][0]);
    } catch (e) {
        console.error(e);
    }
}
run();

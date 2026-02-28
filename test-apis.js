const urls = [
    'https://piston.sillyta.co/api/v2/piston/execute',
    'https://piston.minigame.vip/api/v2/piston/execute',
    'https://piston.hosted.fun/api/v2/piston/execute',
    'https://api.piston.rs/api/v2/piston/execute',
    'https://ce.judge0.com/submissions?base64_encoded=false&wait=true',
];

async function run() {
    for (const url of urls) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: 'java',
                    version: '15.0.2',
                    files: [{ content: 'public class Main { public static void main(String[] args) { System.out.println("working"); } }' }],
                    source_code: 'public class Main { public static void main(String[] args) { System.out.println("working"); } }', // for judge0
                    language_id: 62 // java for judge0
                })
            });
            const text = await res.text();
            console.log(url, res.status, text.substring(0, 100));
        } catch (e) {
            console.log(url, e.message);
        }
    }
}
run();

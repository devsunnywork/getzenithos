// fetch is directly available

async function run() {
    try {
        const res = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: 'java',
                version: '*',
                files: [
                    { content: 'public class Main { public static void main(String[] args) { System.out.println("Hello Piston"); } }' }
                ]
            })
        });
        const data = await res.json();
        console.log(data);
    } catch (e) {
        console.error(e);
    }
}
run();

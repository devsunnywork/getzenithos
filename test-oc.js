async function run() {
    try {
        const res = await fetch('https://onecompiler.com/api/code/exec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: 'java',
                files: [{ name: 'Main.java', content: 'public class Main { public static void main(String[] args) { System.out.println("working_OC"); } }' }]
            })
        });
        const text = await res.text();
        console.log(res.status, text.substring(0, 100));
    } catch (e) {
        console.log(e.message);
    }
}
run();

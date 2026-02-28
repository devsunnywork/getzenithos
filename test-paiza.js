async function run() {
    try {
        const createRes = await fetch('http://api.paiza.io/runners/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source_code: 'public class Main { public static void main(String[] args) { System.out.println("Hello PAIZA " + args[0]); } }',
                language: 'java',
                input: 'World', // stdin? wait, we can just print
                api_key: 'guest'
            })
        });
        const createData = await createRes.json();
        console.log(createData);

        await new Promise(r => setTimeout(r, 2000));

        const detailsRes = await fetch(`http://api.paiza.io/runners/get_details?id=${createData.id}&api_key=guest`);
        const detailsData = await detailsRes.json();
        console.log(detailsData);
    } catch (e) {
        console.error(e);
    }
}
run();

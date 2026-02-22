const axios = require('axios');

async function test() {
    try {
        const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
            language: 'java',
            version: '*',
            files: [{ name: 'Main.java', content: 'public class Main { public static void main(String[] args) { System.out.println("Hello Java"); } }' }]
        });
        console.log("Success:", response.data);
    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}

test();

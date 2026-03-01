const axios = require('axios');

async function testJavac() {
    try {
        console.log('Sending request to render server...');
        const res = await axios.post('https://getzenithos.onrender.com/api/code/run', {
            language: 'java',
            files: [{
                name: 'Main.java',
                content: 'public class Main { public static void main(String[] args) { System.out.println("It works!"); } }'
            }]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Response:', res.data);
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

testJavac();

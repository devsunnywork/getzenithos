const https = require('https');
const fs = require('fs');

async function getPlaylistTitles(playlistId) {
    const url = `https://www.youtube.com/playlist?list=${playlistId}`;
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                const titles = [];
                const regex = /"title":\{"runs":\[\{"text":"(.*?)"\}\]/g;
                let match;
                while ((match = regex.exec(data)) !== null) {
                    const title = match[1];
                    if (title && !titles.includes(title) && !title.includes('||')) {
                        titles.push(title);
                    }
                }

                const videoIds = [];
                const idRegex = /"videoId":"(.*?)"/g;
                while ((match = idRegex.exec(data)) !== null) {
                    const id = match[1];
                    if (id && !videoIds.includes(id)) {
                        videoIds.push(id);
                    }
                }
                resolve({ titles, videoIds });
            });
        }).on('error', reject);
    });
}

const p2 = 'PLm4NqDEJsy5q0TxHudNPCW0cqjjK7PjEu'; // Unit 2
const p3 = 'PLm4NqDEJsy5oIzJdTsO9pJQOHz442SU9R'; // Unit 3
const p4 = 'PLm4NqDEJsy5rb2C6O862nYrq2Qbn-Aki1'; // Unit 4

(async () => {
    const results = {
        unit2: await getPlaylistTitles(p2),
        unit3: await getPlaylistTitles(p3),
        unit4: await getPlaylistTitles(p4)
    };
    fs.writeFileSync('playlist_results.json', JSON.stringify(results, null, 2));
    console.log('Results written to playlist_results.json');
})();

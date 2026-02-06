const https = require('https');

const apiKey = 'AIzaSyC8Fb7ANGVvLK38Z8xW8xqsvD2GVbJsuNU';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        try {
            const data = JSON.parse(body);
            if (data.models) {
                console.log('Available Models:');
                data.models.forEach(m => console.log(`- ${m.name}`));
            } else {
                console.log('No models found in response.');
                console.log('Response:', body);
            }
        } catch (e) {
            console.error('JSON Parse Error:', e);
            console.log('Raw body:', body);
        }
    });
}).on('error', (e) => {
    console.error('Request Error:', e);
});

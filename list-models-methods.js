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
                console.log('Available Models and Methods:');
                data.models.forEach(m => {
                    const methods = m.supportedMethods ? m.supportedMethods.join(', ') : 'none';
                    console.log(`- ${m.name} [${methods}]`);
                });
            } else {
                console.log('No models found.');
            }
        } catch (e) {
            console.error('JSON Parse Error');
        }
    });
}).on('error', (e) => {
    console.error('Request Error:', e);
});

const https = require('https');

const apiKey = 'AIzaSyC8Fb7ANGVvLK38Z8xW8xqsvD2GVbJsuNU';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response Body:', body);
    });
}).on('error', (e) => {
    console.error('Request Error:', e);
});

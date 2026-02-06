const https = require('https');

const apiKey = 'AIzaSyC8Fb7ANGVvLK38Z8xW8xqsvD2GVbJsuNU';
const model = 'gemini-1.5-flash';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const data = JSON.stringify({
    contents: [{
        parts: [{ text: "Hello" }]
    }]
});

const req = https.request(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response Body:', body);
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e);
});

req.write(data);
req.end();

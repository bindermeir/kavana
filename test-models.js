const https = require('https');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log('Fetching models from:', url);

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error('Error:', JSON.stringify(json.error, null, 2));
            } else {
                console.log('Available Models:');
                if (json.models) {
                    json.models.forEach(m => {
                        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                            console.log(`- ${m.name}`);
                        }
                    });
                } else {
                    console.log('No models found in response:', json);
                }
            }
        } catch (e) {
            console.error('Parse error:', e);
            console.log('Raw data:', data);
        }
    });
}).on('error', (e) => {
    console.error("Got error: " + e.message);
});

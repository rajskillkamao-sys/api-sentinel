const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/check', async (req, res) => {
    try {
        let { url } = req.body;

        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        const start = Date.now();

        const response = await axios.get(url, {
            timeout: 5000,
            validateStatus: () => true
        });

        const latency = Date.now() - start;

        res.json({
            online: response.status < 500,
            status: response.status,
            latency,
            url
        });

    } catch (error) {
        res.json({
            online: false,
            status: 'ERROR',
            latency: 0,
            url: req.body.url
        });
    }
});

app.listen(PORT, () => {
    console.log(`APP-SENTINEL running on http://localhost:${PORT}`);
});
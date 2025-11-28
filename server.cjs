const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Ensure node-fetch is installed: npm install node-fetch
require('dotenv').config(); // Ensure dotenv is installed: npm install dotenv

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Root route for verification
app.get('/', (req, res) => {
    res.send('Area Checker API is running');
});

// Configuration
const API_KEY = process.env.AREA_API_KEY; // Server-side secret key
const BASE_URL = 'https://api.example.com'; // Replace with real provider URL

// 1. Proxy for Suggestions
app.get('/api/suggestions', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query required' });

    try {
        const response = await fetch(`${BASE_URL}/areas/suggest?q=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        if (!response.ok) throw new Error('Provider error');

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Suggestion Error:', error);
        res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
});

// 2. Proxy for Area Check
app.post('/api/check', async (req, res) => {
    const { areaId } = req.body;
    if (!areaId) return res.status(400).json({ error: 'Area ID required' });

    try {
        const response = await fetch(`${BASE_URL}/areas/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({ areaId })
        });

        if (!response.ok) throw new Error('Provider error');

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Check Error:', error);
        res.status(500).json({ error: 'Failed to check area' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

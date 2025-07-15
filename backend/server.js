const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

function prompt(text) {
    return `In one sentence, what does this code do?

Code: ${text}

Answer:`;
}

async function callGeminiAPI(text) {
    try {
        console.log('API Key exists:', !!process.env.API_KEY);
        console.log('Calling Gemini API...');
        
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt(text));
        const response = await result.response;
        const textResult = response.text();
        
        console.log('API call successful');
        return textResult;
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}



app.post('/api/explain', async (req, res) => {
    try {
        const { text } = req.body;
        
        // Validate input
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Invalid input: text is required and must be a non-empty string' 
            });
        }
        
        // Limit text length to prevent abuse
        if (text.length > 10000) {
            return res.status(400).json({ 
                error: 'Text too long: maximum 10,000 characters allowed' 
            });
        }
        
        console.log('Received text for explanation:', text.substring(0, 100) + '...');
        
        // Call AI API
        const explanation = await callGeminiAPI(text);
        
        // Send response back to frontend
        res.json({
            success: true,
            explanation: explanation,
            originalText: text.substring(0, 200) + (text.length > 200 ? '...' : '')
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'An error occurred while processing the request'
        });
    }
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Not found'
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


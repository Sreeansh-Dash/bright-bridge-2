const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PythonShell } = require('python-shell');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, userName } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Configure Python shell options
        const options = {
            mode: 'text',
            pythonPath: 'python3',
            pythonOptions: ['-u'],
            scriptPath: './brightbridgeDir',
            args: [message, userName || 'User']
        };

        // Run the Python script
        PythonShell.run('chat_interface.py', options, (err, results) => {
            if (err) {
                console.error('Python script error:', err);
                return res.status(500).json({ 
                    error: 'Sorry, I encountered an issue processing your request. Please try again.',
                    details: err.message 
                });
            }

            // Get the last result (the agent's response)
            const response = results && results.length > 0 ? results[results.length - 1] : 'I apologize, but I couldn\'t generate a response right now. Please try again.';
            
            res.json({ response });
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Internal server error. Please try again later.',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🌈 BrightBridge server running on http://localhost:${PORT}`);
    console.log('Ready to help neurodivergent individuals! 💙');
});
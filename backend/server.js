const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { spawn } = require('child_process');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// WebSocket server setup
const wss = new WebSocketServer({ server });

// Setup multer for image upload (optional if you want to upload files directly)
const upload = multer({ dest: 'uploads/' });

// Define WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Handle messages from client (e.g., image frame data)
  ws.on('message', (message) => {
    console.log('Received message from client');

    // Assuming message is an image frame or related data (base64 encoded)
    const frameData = message;

    // Generate unique output file name
    const outputFileName = Date.now() + '_output.jpg';
    const outputPath = path.join('outputs', outputFileName);

    // Ensure outputs folder exists
    if (!fs.existsSync('outputs')) {
      fs.mkdirSync('outputs');
    }

    // Spawn the Python process for inference
    const pythonProcess = spawn('python', ['python/inference.py', frameData, outputPath]);

    pythonProcess.stdout.on('data', (data) => {
      // Send back the results of the pose estimation to the client
      const result = data.toString();
      ws.send(result);  // Send data back to client in real-time
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
    });
  });

  // Close connection when done
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start the HTTP server
server.listen(3000, () => {
  console.log('WebSocket server running on port 3000');
});
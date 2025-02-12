const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const upload = multer({ dest: 'uploads/' });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received message from client');

    const frameData = message;
    console.log(frameData);

    const outputFileName = Date.now() + '_output.jpg';
    console.log(outputFileName);
    const outputPath = path.join('outputs', outputFileName);

    if (!fs.existsSync('outputs')) {
      fs.mkdirSync('outputs');
    }

    const pythonProcess = spawn('python', ['python/inference.py', frameData, outputPath]);

    pythonProcess.stdout.on('data', (data) => {
      const result = data.toString();
      ws.send(result);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(3000, () => {
  console.log('WebSocket server running on port 3000');
});
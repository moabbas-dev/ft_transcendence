const express = require('express');
const path = require('path');
const chokidar = require('chokidar');
const WebSocket = require('ws');

const app = express();
const port = 8080;

// Serve static files from 'public'
app.use(express.static('public'));

// Also serve your 'src' folder if you need to load JS modules
app.use('/src', express.static(path.join(__dirname, 'src')));

// SPA fallback: serve index.html for all unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Set up WebSocket server attached to the same HTTP server
const wss = new WebSocket.Server({ server });

// Broadcast reload message to all connected clients
function broadcastReload() {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send('reload');
    }
  });
}

// Watch for changes in the 'public' and 'src' directories
const watcher = chokidar.watch([path.join(__dirname, 'public'), path.join(__dirname, 'src')], {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
});

// Use a debounce to avoid too many reloads
let reloadTimeout;
watcher.on('change', filePath => {
  console.log(`File changed: ${filePath}`);
  if (reloadTimeout) clearTimeout(reloadTimeout);
  reloadTimeout = setTimeout(() => {
    broadcastReload();
  }, 100); // Adjust debounce delay as needed
});
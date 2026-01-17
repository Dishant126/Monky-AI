const { spawn } = require('child_process');
const path = require('path');

// Start WebSocket server
const wsServer = spawn('node', ['websocket-server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Start Next.js dev server using npm
const nextServer = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'next-dev'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  wsServer.kill();
  nextServer.kill();
  process.exit();
});

process.on('exit', () => {
  wsServer.kill();
  nextServer.kill();
});

console.log('Starting WebSocket server and Next.js dev server...');

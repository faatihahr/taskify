const { exec } = require('child_process');
const path = require('path');

// Start server in server directory
const serverPath = path.join(__dirname, 'server');
const startCmd = 'npm run dev-stable';

console.log('Starting Taskify Server...');
console.log('Server will run stably without auto-restarting on file changes.');
console.log('To stop the server, press Ctrl+C');
console.log('');

const child = exec(startCmd, { cwd: serverPath });

child.stdout.on('data', (data) => {
  console.log(data.toString().trim());
});

child.stderr.on('data', (data) => {
  console.error(data.toString().trim());
});

child.on('close', (code) => {
  console.log(`Server stopped with exit code ${code}`);
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  child.kill('SIGINT');
});

// Handle other termination signals
process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  child.kill('SIGTERM');
});

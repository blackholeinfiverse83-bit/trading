#!/usr/bin/env node

/**
 * Run frontend development server from root directory
 * This script changes to the trading-dashboard directory and runs npm run dev
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the trading-dashboard directory path
const tradingDashboardPath = path.join(__dirname, 'trading-dashboard');

// Check if trading-dashboard directory exists
if (!fs.existsSync(tradingDashboardPath)) {
  console.error('Error: trading-dashboard directory not found!');
  process.exit(1);
}

// Check if package.json exists in trading-dashboard
const packageJsonPath = path.join(tradingDashboardPath, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found in trading-dashboard directory!');
  process.exit(1);
}

// Change to trading-dashboard directory
process.chdir(tradingDashboardPath);

console.log('Running frontend development server...');
console.log(`Directory: ${tradingDashboardPath}\n`);

// Determine npm command (use npm.cmd on Windows)
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Spawn npm run dev process
const child = spawn(npmCmd, ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: tradingDashboardPath
});

// Handle process exit
child.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle errors
child.on('error', (err) => {
  console.error('Error starting frontend server:', err);
  process.exit(1);
});


const fs = require('node:fs');
const path = require('node:path');

const env = process.env.NODE_ENV || 'development';
const logsDir = path.join(__dirname, '..', 'logs', env === 'production' ? 'prod' : 'dev');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'error.log');

const logger = {
  error: (message, err) => {
    const timestamp = new Date().toISOString();
    const errorMessage = err ? (err.stack || err.message || err) : '';
    const logEntry = `[${timestamp}] [ERROR] ${message} ${errorMessage}\n`;
    
    console.error(logEntry);
    
    fs.appendFile(logFile, logEntry, (writeErr) => {
      if (writeErr) console.error('Failed to write to log file:', writeErr);
    });
  },
  info: (message) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [INFO] ${message}\n`;
    
    console.log(logEntry);
    
    fs.appendFile(logFile, logEntry, (writeErr) => {
      if (writeErr) console.error('Failed to write to log file:', writeErr);
    });
  },
  warn: (message) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [WARN] ${message}\n`;
    
    console.warn(logEntry);
    
    fs.appendFile(logFile, logEntry, (writeErr) => {
      if (writeErr) console.error('Failed to write to log file:', writeErr);
    });
  }
};

module.exports = logger;

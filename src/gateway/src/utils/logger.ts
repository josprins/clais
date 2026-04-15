import pino from 'pino';
import fs from 'fs';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create logs directory:', err);
  }
}

// Create log streams
const logStreams = [];

// Always log to console (for PM2 to capture)
logStreams.push({ stream: process.stdout });

// In production, also log to file
if (isProduction) {
  try {
    const errorLogStream = fs.createWriteStream(
      path.join(logsDir, 'error.log'),
      { flags: 'a' }
    );
    const combinedLogStream = fs.createWriteStream(
      path.join(logsDir, 'combined.log'),
      { flags: 'a' }
    );
    
    // Error level and above go to error.log
    logStreams.push({
      stream: errorLogStream,
      level: 'error'
    });
    
    // All levels go to combined.log
    logStreams.push({
      stream: combinedLogStream
    });
  } catch (err) {
    console.error('Failed to create log files:', err);
  }
}

// Create logger instance
const logger = pino({
  level: logLevel,
  transport: isProduction ? undefined : {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    }
  },
  serializers: {
    error: pino.stdSerializers.err
  }
}, pino.multistream(logStreams));

export default logger;
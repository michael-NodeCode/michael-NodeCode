type LogLevel = 'info' | 'warn' | 'error';

async function logToFile(level: LogLevel, message: string) {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, message }),
    });
  } catch (error) {
    console.error('Failed to log message:', error);
  }
}

const logging = {
  info: (msg: string) => logToFile('info', msg),
  warn: (msg: string) => logToFile('warn', msg),
  error: (msg: string) => logToFile('error', msg),
};

export default logging;

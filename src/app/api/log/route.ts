import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const logFilePath = path.join(process.cwd(), 'logs', 'client-logs.log');

if (!fs.existsSync(path.dirname(logFilePath))) {
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const { level = 'info', message } = await req.json();
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}\n`;

    fs.appendFileSync(logFilePath, logMessage);
    return NextResponse.json({ message: 'Log written successfully' });
  } catch (error) {
    console.error('Failed to write log:', error);
    return NextResponse.json({ message: 'Error writing log' }, { status: 500 });
  }
}

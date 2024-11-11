import {
    writeTextFile,
    BaseDirectory
} from "@tauri-apps/plugin-fs";


const logFileName = 'frontend-log.txt';


async function logToFile(message: unknown) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    try {

        await writeTextFile(logFileName, logMessage, {
            baseDir: BaseDirectory.AppConfig,
            append: true
        });
    } catch (error) {

        console.error('Error writing to log file:', error);
    }
}


function log(message: unknown) {
    console.log(message);
    logToFile(message);
}

export default log;
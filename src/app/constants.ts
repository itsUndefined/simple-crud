import { remote } from 'electron';

const appPath = remote.app.getAppPath();
const mainProcessPID = remote.process.pid;

export { appPath, mainProcessPID };

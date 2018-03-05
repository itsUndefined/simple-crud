import { app, BrowserWindow, ipcMain } from 'electron';

let win: BrowserWindow;

app.on('ready', () => {
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: 800,
    height: 800
  });


  win.loadURL('http://localhost:4200');

});

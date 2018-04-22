import { app, BrowserWindow, ipcMain } from 'electron';

let win: BrowserWindow;

let readyToClose = false;

app.on('ready', () => {
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: 800,
    height: 800
  });


  win.loadURL('http://localhost:4200');

  win.on('close', (event) => {
    if (!readyToClose) {
      event.sender.send('closing');
      event.preventDefault();
      setTimeout(() => {
        process.hang();
      }, 2000);
    }
  });

  ipcMain.on('readyToClose', () => {
    readyToClose = true;
    win.close();
  });

});

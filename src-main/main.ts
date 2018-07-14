import { app, BrowserWindow, ipcMain, Menu } from 'electron';

let win: BrowserWindow;

let readyToClose = false;

app.on('ready', () => {
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: 800,
    height: 800,
    webPreferences: {
      webSecurity: false
    }
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

  const selectionMenu = Menu.buildFromTemplate([
    { role: 'copy' },
    { type: 'separator' },
    { role: 'selectall' },
  ]);

  const inputMenu = Menu.buildFromTemplate([
    { role: 'undo' },
    { role: 'redo' },
    { type: 'separator' },
    { role: 'cut' },
    { role: 'copy' },
    { role: 'paste' },
    { type: 'separator' },
    { role: 'selectall' },
  ]);

  win.webContents.on('context-menu', (e, props) => {
    const { selectionText, isEditable } = props;
    if (isEditable) {
      inputMenu.popup({window: win});
    } else if (selectionText && selectionText.trim() !== '') {
      selectionMenu.popup({window: win});
    }
  });

});

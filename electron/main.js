import { app, BrowserWindow } from "electron";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        nodeIntegration: false
    }
  });

  if (app.isPackaged) {

  } else {
    win.loadURL("http://localhost:1420")
  }
}

app.whenReady().then(() => {
  createWindow()
})

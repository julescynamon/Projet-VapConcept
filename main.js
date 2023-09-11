const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const ipc = ipcMain;

// Création d'une fenêtre
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1024,
    minHeight: 640,
    frame: false,
    // enleve la barre de frame sur mac
    titleBarStyle: "hiddenInset",
    // enleve les boutons de frame sur mac
    titleBarStyle: "customButtonsOnHover",
    icon: path.join(__dirname, "./icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      devTools: true,
    },
  });

  // Chargement de l'index.html
  win.loadFile(path.join(__dirname, "index.html"));
  // win.webContents.openDevTools();

  // gestion des demandes ipc
  ipc.on("reduceApp", () => {
    win.minimize();
  });

  ipc.on("closeApp", () => {
    win.close();
  });

  ipc.on("sizeApp", () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  // Gestion des fenêtres
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quitter l'application
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

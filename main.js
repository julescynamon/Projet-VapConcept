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
      contextIsolation: false,
      devTools: true,
    },
  });

  // Chargement de l'index.html
  win.loadFile(path.join(__dirname, "index.html"));
  win.webContents.openDevTools();

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

  // Manipulation de la base de donnéees
  ipc.on("factureImport", (e, data) => {
    const dataStore = require("nedb");
    const db = new dataStore({ filename: "facture.db", autoload: true });
    db.insert(data, (err, newRec) => {
      if (err) {
        console.log("erreur =", err);
        return;
      }
      console.log("created =", newRec);
      win.reload();
    });
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

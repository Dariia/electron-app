const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron')
const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== "production";
let mainWindow;

// Create main window
const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        title: "Image resizer",
        width: isDev ? 1000 : 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, './preload.js')
        }
    })

    // Open dev tools if dev env
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
};

const createAboutWindow = () => {
    const aboutWindow = new BrowserWindow({
        title: "About Image resizer",
        width: 300,
        height: 300,
    })

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

// App is ready
app.whenReady().then(() => {
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    mainWindow.on('closed', () => mainWindow = null);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
});

const menu = [
    ...(isMac
        ? [
            {
                label: app.name,
                submenu: [
                    {
                        label: 'About',
                        click: createAboutWindow,
                    },
                ],
            },
        ]
        : []),
    {
        role: 'fileMenu',
    },
    ...(!isMac
        ? [
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'About',
                        click: createAboutWindow,
                    },
                ],
            },
        ]
        : []),
    ...(isDev
        ? [
            {
                label: 'Developer',
                submenu: [
                    { role: 'reload' },
                    { role: 'forcereload' },
                    { type: 'separator' },
                    { role: 'toggledevtools' },
                ],
            },
        ]
        : []),
];

app.on('window-all-closed', () => {
    if (isMac) app.quit();
})

async function resizeImage ({ imgPath, height, width, dest }) {
  try {
      const newPath = await resizeImg(fs.readFileSync(imgPath), {
          width: +width,
          height: +height
      });
      const fileName = path.basename(imgPath);
      if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest);
      }
      fs.writeFileSync(path.join(dest, fileName), newPath);
      shell.openPath(dest);
      mainWindow.webContents.send('image:done');
  } catch (error) {
      console.log(error)
  }
}

// Respond to ipcRender
ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageResizer');
    resizeImage(options);
    console.log('ipcMain image:resize : ', e, options);
})



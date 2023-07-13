
const { app, BrowserWindow } = require('electron')

const path = require('path')
const {ipcMain} = require('electron')
function createWindow () {
	  const win = new BrowserWindow({
	width: 800,
	height: 600,
	frame: false,
	webPreferences: {
	  preload: path.join(__dirname, 'src/js/preload.js'),
	  devTools: true
	}
  })

  win.loadFile('src/index.html')

  ipcMain.on('closeApp', (event, arg) => {
	  app.quit();
  })
}

app.whenReady().then(() => {
	createWindow()
}
)

app.on('window-all-closed', () => {
	  if (process.platform !== 'darwin') {
	app.quit()
  }
}
)

app.on('activate', () => {
	  if (BrowserWindow.getAllWindows().length === 0) {
	createWindow()
  }
}
)


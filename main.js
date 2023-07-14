
const { app, BrowserWindow, shell } = require('electron')

const path = require('path')
const {ipcMain} = require('electron')
function createWindow () {
	  const win = new BrowserWindow({
	width: 1200,
	height: 600,
	minWidth: 800,
	minHeight: 600,
	frame: false,
	icon: path.join(__dirname, 'src/assets/img/logo/240px.png'),
	webPreferences: {
	  preload: path.join(__dirname, 'src/js/preload.js'),
	  devTools: true
	}
  })

  win.loadFile('src/index.html')

  ipcMain.on('closeApp', (event, arg) => {
	  app.quit();
  });

  ipcMain.on('minimizeApp', (event, arg) => {
	  win.minimize();
  }
  );

  ipcMain.on('maximizeApp', (event, arg) => {
	  if (win.isMaximized()) {
		win.restore();
	  }
	  else {
		win.maximize();
	  }
	});

	  ipcMain.on('openExternal', (event, arg) => {
		  console.log('openExternal: ' + arg);
		  shell.openExternal(arg);
	  });
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


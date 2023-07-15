
const { app, BrowserWindow, shell, Tray, Menu, Notification } = require('electron')
const url = require("url");


const path = require('path')
const {ipcMain, dialog} = require('electron')
let win;
function createWindow () {
	win = new BrowserWindow({
	width: 1200,
	height: 600,
	minWidth: 800,
	minHeight: 600,
	frame: false,
	icon: path.join(__dirname, 'src/assets/img/logo/240px.png'),
	webPreferences: {			
	  	devTools: true,
	  	nodeIntegration: true,
	  	contextIsolation: false
	}
  })

  win.loadFile('src/index.html')

  ipcMain.on('closeApp', (event, arg) => {
	event.preventDefault();
	win.hide();
	new Notification({title: 'CyberX+ Download Manager', body: 'CyberX+ Download Manager is still running in the background.', icon: path.join(__dirname, 'src/assets/img/logo/240px.png')}).show();

  });

  ipcMain.on('minimizeApp', (event, arg) => {
	event.preventDefault();
	win.hide();
  }
  );

  ipcMain.handle('download-location', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })
    if (canceled) {
      return
    } else {
      return filePaths[0]
    }
  })


  ipcMain.on('maximizeApp', (event, arg) => {
	  if (win.isMaximized()) {
		win.restore();
	  }
	  else {
		win.maximize();
	  }
	});

	tray = new Tray(path.join(__dirname, 'src/assets/img/logo/240px.png'))
	const contextMenu = Menu.buildFromTemplate([
		{ label: 'Show App', click:  function(){
			win.show();
		}
		},
		{ label: 'Quit', click:  function(){
			app.isQuiting = true;
			app.quit();
		}
	},
	])
	tray.setToolTip('CyberX+ Download Manager')
	tray.setContextMenu(contextMenu)
	win.on('minimize',function(event){
		event.preventDefault();
		win.hide();
	}
	);

	tray.on('double-click', function(event){
		win.show();
	}
	);

	



}

app.whenReady().then(() => {
	createWindow()
	if (process.platform == 'win32') {
		app.setAppUserModelId('CX+ Download Manager');
	  }
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


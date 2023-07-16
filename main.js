
const { app, BrowserWindow, shell, Tray, Menu, Notification } = require('electron')
const url = require("url");
const path = require('path')
const {ipcMain, dialog} = require('electron')
const fs = require('fs');
let win;

function createWindow () {

	// Check settings file is present or not
	const app_version = app.getVersion();
	const settings_file = path.join(__dirname, 'system','settings.json');
	if (fs.existsSync(settings_file)) {
		console.log('Settings file exists.');
	}
	else {

		var settings = {"settings": 
		{
			"language": "en",
			"location": {
				"general": path.join(os.homedir(), 'Downloads'),
				"music": path.join(os.homedir(), 'Downloads', 'Music'),
				"video": path.join(os.homedir(), 'Downloads', 'Video'),
				"image": path.join(os.homedir(), 'Downloads', 'Image'),
				"document": path.join(os.homedir(), 'Downloads', 'Document'),
				"program": path.join(os.homedir(), 'Downloads', 'Program'),
				"compressed": path.join(os.homedir(), 'Downloads', 'Compressed'),
				"torrent": path.join(os.homedir(), 'Downloads', 'Torrent'),
				"other": path.join(os.homedir(), 'Downloads', 'Other'),
				"temp": path.join(os.homedir(), 'Downloads', 'Temp'),
			},
			"threads": 4,
			"maxSpeed": 0,
			"user-agent": "CyberX+ Download Manager/1.0.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36",
			"retry": 3,
			"retryDelay": 1000,
			"timeout": 10000,
			"proxy": "Default",
			"proxyType": "",
			"proxyUrl": "",
			"proxyPort": "",
			"proxyUsername": "",
			"proxyPassword": "",
			"proxySocks": "",
			"proxySocksVersion": "",
			"ignoreProxy": ["localhost"],
			"fileTypes": ["zip", "rar", "avi", "mp4", "iso", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "exe", "msi", "apk", "torrent", "mp3", "wav", "flac", "ogg", "jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "ico", "txt", "html", "css", "js", "php", "json", "xml", "md", "csv", "ts", "tsx", "jsx", "py", "java", "c", "cpp", "h", "hpp", "cs", "go", "rb", "sh", "ps1", "psm1", "psd1", "bat", "cmd", "vbs", "vbe", "wsf", "wsh", "ps1xml", "psc1", "msh", "msh1", "msh2", "mshxml", "msh1xml", "msh2xml", "scf", "lnk", "inf", "reg", "url", "m3u", "m3u8", "flv", "ogg", "webm", "mkv", "mpg", "mpeg", "3gp", "3g2", "m4v", "wmv", "mov", "tar.gz"],
			
		}
	};
		fs.writeFileSync(settings_file, JSON.stringify(settings, null, 4));
		console.log('Settings file created.');
}
	// Check version file is present or not

	const version_file = path.join(__dirname, 'system','version.json');
	if (fs.existsSync(version_file)) {
		console.log('Version file exists.');
	} else {
		var version = {"version": app_version, "last_update": ""};
		fs.writeFileSync(version_file, JSON.stringify(version, null, 4));
		console.log('Version file created.');
	}

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

  process.on('warning', (warning) => {
    console.log(warning.stack);
});

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



const { app, BrowserWindow, shell, Tray, Menu, Notification } = require('electron')
const url = require("url");
const path = require('path')
const {ipcMain, dialog} = require('electron')
const fs = require('fs');
const Downloader = require('easydl');
const utilities = require('./src/utilities.js');
let win;

const version_file = path.join(__dirname, 'system','version.json');
var download_list_file = path.join(__dirname, 'system','download_list.json');
var download_list = JSON.parse(fs.readFileSync(download_list_file));
var array_downloader = {};

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
			var data = JSON.parse(fs.readFileSync(path.join(__dirname, 'system','download_list.json')));
			if(data.downloading.length > 0){
				var options = {
					type: 'question',
					buttons: ['Yes', 'No'],
					defaultId: 2,
					title: 'CyberX+ Download Manager',
					message: 'Are you sure you want to quit?',
					detail: 'There are still active downloads. If you quit now, the downloads will be cancelled.',
				  };
				  dialog.showMessageBox(null, options).then((response) => {
					if (response.response == 0){
						data.stopped = data.stopped.concat(data.downloading);
						data.downloading = [];
						fs.writeFileSync(path.join(__dirname, 'system','download_list.json'), JSON.stringify(data, null, 4));
						app.isQuiting = true;
						app.quit();
					}
				  });

			} else {
				app.isQuiting = true;
				app.quit();
			}

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

	// Downloader Action
	
	
	ipcMain.handle('download-add-queue', async(event, arg) => {
		try{
			check_file_exist(arg);
			var data = await downloader(arg);
			array_downloader[arg.init_time] = data;
			return arg.init_time;
		} catch(err) {
			console.log(err);
			return false;
		}
		
	});

	

	ipcMain.handle('download-pause', (event, arg) => {
		if(arg in array_downloader.keys()) {
			array_downloader[arg].destroy();
			return true;
		} else {
			return false;
		}
	});

	ipcMain.handle('download-data', async(event, arg) => {
		// var data = {"status": array_downloader[arg]._status, "progress": array_downloader[arg].totalProgress, "size": array_downloader[arg].size};
		// return data;
		var data = {};
		for (i in array_downloader) {
			data[i] = {"resume": array_downloader[i].isResume,"status": array_downloader[i]._status, "progress": array_downloader[i].totalProgress, "size": array_downloader[i].size};
		}
		return data;
	});

	ipcMain.handle('download-array', (event, arg) => {
		return Object.keys(array_downloader);
	});





		
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

async function downloader(arg){
	var dler = new Downloader(uel=arg.url, dest=arg.temp_location,{
		connections: arg.connections,
		httpOptions:  {"headers": { "User-Agent": "CX+ Download Manager/1.0.0", "accept": "*/*", 'accept-enconding': '*', 'accept-language': 'en-US,en;q=0.9', 'cache-control': 'no-cache', 'pragma': 'no-cache', 'dnt': '1'
	}},
		maxRetry: arg.maxRetry,
		existBehavior: arg.existBehavior,
		reportInterval: arg.reportInterval,
	});

	
	dler.start();
	return dler;
}

function updateDownloadList(download_list_file, download_list){
	fs.writeFileSync(download_list_file, JSON.stringify(download_list));
}




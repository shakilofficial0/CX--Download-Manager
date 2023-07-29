
const { app, BrowserWindow, shell, Tray, Menu, Notification } = require('electron')
const request = require('request');
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
			var data = await downloader(arg);
			array_downloader[arg.init_time] = data;
			return arg.init_time;

		} catch(err) {
			console.log(err);
			return false;
		}
		
	});

	ipcMain.handle('download-check', async(event, arg, response) => {
		
				if ('last-modified' in response.headers) {
					var content_length = response.headers['content-length'];
					var content_type = response.headers['content-type'];
					var last_modified = response.headers['last-modified'];
					
					var flag = checkDownload(download_list, last_modified, content_length, arg.filename);
	
					if(flag == false){
						var info ={"completed":checkCompleted(download_list, last_modified, content_length, arg.filename), "paused":checkPaused(download_list, last_modified, content_length, arg.filename), "stopped":checkStopped(download_list, last_modified, content_length, arg.filename)}; 
						
	
						if(info.paused != false){
	
							if(info.stopped != false){
								fs.rmSync(download_list.stopped[info.stopped].temp_location, { recursive: true });
								delete download_list.stopped[info.stopped];
							}
	
							download_list.paused[info.paused].status = "downloading";
							download_list.paused[info.paused].init_time = arg.init_time;
							download_list.downloading[arg.init_time] = download_list.paused[info.paused];
							delete download_list.paused[info.paused];
							updateDownloadList(download_list_file, download_list);
	
						} else if(info.stopped != false){
							fs.rmSync(download_list.stopped[info.stopped].temp_location, { recursive: true });
							folderCreate(arg.temp_location,{"content_length": content_length, "content_type": content_type, "last_modified": last_modified});
							download_list.stopped[info.stopped].status = "downloading";
							download_list.stopped[info.stopped].init_time = arg.init_time;
							download_list.downloading[arg.init_time] = download_list.stopped[info.stopped];
							delete download_list.stopped[info.stopped];
							updateDownloadList(download_list_file, download_list);
						} else if(info.completed != false){
							console.log('File checking completed.');
							if(locationUpdate(arg, {"content_length": content_length, "content_type": content_type, "last_modified": last_modified}, download_list) != false){
							var temp_p = path.parse(arg.temp_location);
							arg.filename = temp_p.name + temp_p.ext;
							var data = {"url": arg.url, "temp_location": arg.temp_location, "filename": arg.filename, "headers": JSON.parse(arg.headers), "username": arg.username, "password": arg.password, "connections": arg.connections, "maxRetry": arg.maxRetry, "existBehavior": arg.existBehavior, "reportInterval": arg.reportInterval, "init_time": arg.init_time, "content_length": content_length, "content_type": content_type, "last_modified": last_modified, "status": "downloading", "progress": 0, "downloaded": 0, "eta": 0, "ext": temp_p.ext, "location": arg.location};
							download_list.downloading[arg.init_time] = data;
							updateDownloadList(download_list_file, download_list);
							} else {
								return false;
							}
							
						} else {
							console.log('File not found in server.');
							folderCreate(arg.temp_location,{"content_length": content_length, "content_type": content_type, "last_modified": last_modified});
							var data = {"url": arg.url, "temp_location": arg.temp_location, "filename": arg.filename, "headers": JSON.parse(arg.headers), "username": arg.username, "password": arg.password, "connections": arg.connections, "maxRetry": arg.maxRetry, "existBehavior": arg.existBehavior, "reportInterval": arg.reportInterval, "init_time": arg.init_time, "content_length": content_length, "content_type": content_type, "last_modified": last_modified, "status": "downloading", "progress": 0, "downloaded": 0, "eta": 0, "ext": path.parse(arg.temp_location).ext, "location": arg.location};
							download_list.downloading[arg.init_time] = data;
							updateDownloadList(download_list_file, download_list);
	
						}
					} else {
						console.log('File already downloading.');
						return false;
					}
	
					console.log('Returning true.');
					return arg.temp_location;
	
				} else {
					if(fs.existsSync(arg.temp_location)){
						if(locationUpdate(arg, {"content_length": 0, "content_type": "", "last_modified": ""}) != false){
							var data = {"url": arg.url, "temp_location": arg.temp_location, "filename": arg.filename, "headers": JSON.parse(arg.headers), "username": arg.username, "password": arg.password, "connections": arg.connections, "maxRetry": arg.maxRetry, "existBehavior": arg.existBehavior, "reportInterval": arg.reportInterval, "init_time": arg.init_time, "content_length": 0, "content_type": "", "last_modified": "", "status": "downloading", "progress": 0, "downloaded": 0, "eta": 0, "ext": path.parse(arg.temp_location).ext, "location": arg.location};
							download_list.downloading[arg.init_time] = data;
							updateDownloadList(download_list_file, download_list);
	
						return arg.temp_location;
						} else {
							return false;
						}
						
					} else {
						console.log('File not found in server.2');
						folderCreate(arg.temp_location,{"content_length": 0, "content_type": "", "last_modified": ""});
						var data = {"url": arg.url, "temp_location": arg.temp_location, "filename": arg.filename, "headers": JSON.parse(arg.headers), "username": arg.username, "password": arg.password, "connections": arg.connections, "maxRetry": arg.maxRetry, "existBehavior": arg.existBehavior, "reportInterval": arg.reportInterval, "init_time": arg.init_time, "content_length": 0, "content_type": "", "last_modified": "", "status": "downloading", "progress": 0, "downloaded": 0, "eta": 0, "ext": path.parse(arg.temp_location).ext, "location": arg.location};
						download_list.downloading[arg.init_time] = data;
						updateDownloadList(download_list_file, download_list);
						return arg.temp_location;
					}
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
		
		var data = {};
		for (i in array_downloader) {
			console.log(array_downloader[i]);
			data[i] = {"status": array_downloader[i]._status, "progress": array_downloader[i].totalProgress.percentage, "content_length": array_downloader[i].size, "speed": array_downloader[i].totalProgress.speed, "downloaded": array_downloader[i].totalProgress.bytes, "filename": download_list.downloading[i].filename, "ext": download_list.downloading[i].ext, "url": download_list.downloading[i].url, "merge_percent": array_downloader[i]._margeStatus.percentage, "init_time": download_list.downloading[i].init_time};
		}
		return data;
	});

	ipcMain.handle('download-completed', (event, arg) => {
		if(Object.keys(array_downloader).includes(''+arg)) {
			download_list.completed[arg] = download_list.downloading[arg];
			download_list.completed[arg]['time_taken'] = (new Date().getTime() - download_list.completed[arg].init_time)/1000;
			delete download_list.downloading[arg];
			delete array_downloader[arg];
			updateDownloadList(download_list_file, download_list);
			return download_list.completed[arg]['time_taken'];
		} else {
			return false;
		}

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
	var dler = new Downloader(url=arg.url, dest=arg.temp_location,{
		connections: arg.connections,
		httpOptions:  JSON.parse(arg.headers),
		maxRetry: arg.maxRetry,
		existBehavior: arg.existBehavior,
		reportInterval: arg.reportInterval,
		location: arg.location
	});

	
	dler.start();
	return dler;
}







// Function

function updateDownloadList(download_list_file, download_list){
	fs.writeFileSync(download_list_file, JSON.stringify(download_list));
}



function locationUpdate(arg, http_data, download_list){
	var temp_location = path.parse(arg.temp_location);
	counter =1;
	
	while(true){
		
		var way =path.join(temp_location.dir, temp_location.name + '(' + counter + ')' + temp_location.ext);
		var flag = checkCompleted(download_list, http_data.last_modified, http_data.content_length, temp_location.name + '(' + counter + ')' + temp_location.ext);
		
		if(flag == false){
			var downloading = checkDownload(download_list, http_data.last_modified, http_data.content_length, temp_location.name + '(' + counter + ')' + temp_location.ext);
			if(downloading != false){
				return false;
			}
			
			if(fs.existsSync(way)){
				if(fs.statSync(way).isDirectory()){
					var paused = checkPaused(download_list, http_data.last_modified, http_data.content_length, temp_location.name + '(' + counter + ')' + temp_location.ext);
					if(paused != false){
						var prime = download_list.paused[paused];
						prime.init_time = arg.init_time;
						delete download_list.paused[paused];
						prime.status = "downloading";
						download_list.downloading[arg.init_time] = prime;
						updateDownloadList(download_list_file, download_list);
						return way;
					}

					var stopped = checkStopped(download_list, http_data.last_modified, http_data.content_length, temp_location.name + '(' + counter + ')' + temp_location.ext);
					if(stopped != false){
						var prime = download_list.stopped[stopped];
						prime.init_time = arg.init_time;
						delete download_list.stopped[stopped];
						prime.status = "downloading";
						download_list.downloading[arg.init_time] = prime;
						updateDownloadList(download_list_file, download_list);
						return way;
					}
					console.log('didnt find in paused or stopped');
					counter += 1;
					
				} else {
					counter += 1;
				}
			} else {
				arg.temp_location = way;
				console.log('dif:',way);
				return folderCreate(way, http_data);
			}
		} else {

			counter += 1;
		}

	}

}

function folderCreate(way,http_data){
	if(!fs.existsSync(way)){
		fs.mkdirSync(way);
	}

	fs.writeFileSync(path.join(way,'log.json'), JSON.stringify(http_data));
	return way;
}

function checkDownload(download_list, last_modified, content_length, filename){
	for (i in download_list.downloading) {
		if (download_list.downloading[i].last_modified == last_modified && download_list.downloading[i].content_length == content_length && download_list.downloading[i].filename == filename) {
			console.log('File already downloading.');
			return i;
		}
	}
	return false;
}

function checkCompleted(download_list, last_modified, content_length, filename){
	for (i in download_list.completed) {
		if (download_list.completed[i].last_modified == last_modified && download_list.completed[i].content_length == content_length && download_list.completed[i].filename == filename) {
			console.log('File found in completed list.');
			return i;
		}
	}
	return false;
}

function checkPaused(download_list, last_modified, content_length, filename){
	for (i in download_list.paused) {
		if (download_list.paused[i].last_modified == last_modified && download_list.paused[i].content_length == content_length && download_list.paused[i].filename == filename) {
			console.log('File found in Paused list.');
			return i;
		}
	}
	return false;
}

function checkStopped(download_list, last_modified, content_length, filename){
	for (i in download_list.stopped) {
		if (download_list.stopped[i].last_modified == last_modified && download_list.stopped[i].content_length == content_length && download_list.stopped[i].filename == filename) {
			console.log('File found in Stopped list.');
			return i;
		}
	}
	return false;
}







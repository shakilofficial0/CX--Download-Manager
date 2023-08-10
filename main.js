const { app, BrowserWindow, shell, Tray, Menu, Notification } = require('electron')
const request = require('request');
const path = require('path')
const {ipcMain, dialog} = require('electron')
const fs = require('fs');
const Downloader = require('easydl');
const utilities = require('./src/utilities.js');
const express = require('express');
const os = require('os');

let win;

const version_file = path.join(__dirname, '..', 'system','version.json');
var download_list_file = path.join(__dirname, '..', 'system','download_list.json');
let system_var = null;
var download_list = JSON.parse(fs.readFileSync(download_list_file));
var array_downloader = {};


for (i in download_list.downloading) {
	download_list.stopped[i] = download_list.downloading[i];
	download_list.stopped[i].status = "stopped";
	delete download_list.downloading[i];
}
updateDownloadList(download_list_file, download_list);



function createWindow () {

	// Check settings file is present or not
	const app_version = app.getVersion();
	const settings_file = path.join(__dirname, '..', 'system','settings.json');
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
				"max_download": 0,
				"maxSpeed": 0,
				"user_agent": "CyberX+ Download Manager/1.0.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36",
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
			if(fs.existsSync(path.join(os.homedir(), 'Downloads')) == false){
				fs.mkdirSync(path.join(os.homedir(), 'Downloads'));
			}
			if(fs.existsSync(path.join(os.homedir(), 'Downloads', 'Music')) == false){
				fs.mkdirSync(path.join(os.homedir(), 'Downloads', 'Music'));
			}
			if(fs.existsSync(path.join(os.homedir(), 'Downloads', 'Video')) == false){
				fs.mkdirSync(path.join(os.homedir(), 'Downloads', 'Video'));
			}
			if(fs.existsSync(path.join(os.homedir(), 'Downloads', 'Image')) == false){
				fs.mkdirSync(path.join(os.homedir(), 'Downloads', 'Image'));
			}
			if(fs.existsSync(path.join(os.homedir(), 'Downloads', 'Document')) == false){
				fs.mkdirSync(path.join(os.homedir(), 'Downloads', 'Document'));
			}
			if(fs.existsSync(path.join(os.homedir(), 'Downloads', 'Program')) == false){
				fs.mkdirSync(path.join(os.homedir(), 'Downloads', 'Program'));
			}
			if(fs.existsSync(path.join(os.homedir(), 'Downloads', 'Compressed')) == false){
				fs.mkdirSync(path.join(os.homedir(), 'Downloads', 'Compressed'));
			}
			if(fs.existsSync(path.join(os.homedir(), 'Downloads', 'Torrent')) == false){
				fs.mkdirSync(path.join(os.homedir(), 'Downloads', 'Torrent'));
			}
			if(fs.existsSync(path.join(os.homedir(), 'Downloads', 'Other')) == false){
				fs.mkdirSync(path.join(os.homedir(), 'Downloads', 'Other'));
			}
			if(fs.existsSync(path.join(os.homedir(), 'Downloads', 'Temp')) == false){
				fs.mkdirSync(path.join(os.homedir(), 'Downloads', 'Temp'));
			}
			fs.writeFileSync(settings_file, JSON.stringify(settings, null, 4));
			
	}
	system_var = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'system', 'settings.json'), 'utf8')).settings;
	// Check version file is present or not

	

	if (fs.existsSync(version_file)) {
		console.log('Version file exists.');
	} else {
		var version = {"version": app_version, "last_update": ""};
		fs.writeFileSync(version_file, JSON.stringify(version, null, 4));
		
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

  const server = express();
  server.use(express.json());
  server.post('/download-add', async function(r, response){

	
	if(r.body == "" || r.body == undefined){
		response.send({"status": false, "message": "Data is required."});
		return;
	}
	var data = r.body;

	if(data.url == "" || data.url == undefined){
		response.send({"status": false, "message": "URL is required."});
		return;
	}

	if(data.filename == "" || data.filename == undefined){
		response.send({"status": false, "message": "Filename is required."});
		return;
	}

	data["temp_location"] = path.join(system_var.location.temp, data.filename);
	data["init_time"] = new Date().getTime();
	data["headers"]["user-agent"] = system_var["user_agent"];
	data["headers"]["accept"] = "*/*";
	data["headers"]["accept-encoding"] = "*";
	data["headers"]["accept-language"] = "en-US,en;q=0.9";
	data["headers"]["cache-control"] = "no-cache";
	data["headers"]["pragma"] = "no-cache";
	data["headers"]["sec-ch-ua"] = '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"';
	data["headers"]["sec-ch-ua-mobile"] = "?0";
	data["headers"]["sec-ch-ua-platform"] = '"Windows"';
	data["headers"]["dnt"] = "1";

	data["headers"] = JSON.stringify({"headers": data["headers"]});

	

	

	data["connections"] = system_var.threads;
	data["maxRetry"] = system_var.retry;
	data["existBehavior"] = "overwrite";
	data["reportInterval"] = 600;
	data["location"] = system_var.location[utilities.nameToCategory(data.filename)];
	data["username"] = "";
	data["password"] = "";
	data["status"] = "queued";

	// request action
	
	var req = request({
		url: data.url,
		method: 'HEAD',
		headers: JSON.parse(data.headers).headers
	}, async function (err, res, body) {
		if(err){
			response.send({"status": false, "message": "Error occured. Error: "+err});
			return;
		} else {

			var result =downlod_check(data, {"headers": res.headers});
			if(result == false){
				
				response.send({"status": false, "message": "File already downloading."});
				return;
			} else {
				data["temp_location"] = result;
				
				try{
					var datar = await downloader(data);
					array_downloader[data.init_time] = datar;
					response.send({"status": true, "message": "Download added to queue."});
					new Notification({title: 'CyberX+ Download Manager', body: 'Download Added! File Name: '+data.filename, icon: path.join(__dirname, 'src/assets/img/logo/240px.png')}).show();
					return;
		
				} catch(err) {
					response.send({"status": false, "message": "Error occured."});
					return;
				}

				
			}

		}
		
		

	});

	

  });

  server.listen(23087, () => console.log('Server ready'));
  clearDumb();
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
      return false
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
			var data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'system','download_list.json')));
			
			if(Object.keys(data.downloading).length > 0){
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
						for (i in data.downloading) {
							array_downloader[i].destroy();
							download_list.stopped[i] = download_list.downloading[i];
							download_list.stopped[i].status = "stopped";
							delete download_list.downloading[i];
							delete array_downloader[i];
						}
						fs.writeFileSync(path.join(__dirname, '..', 'system','download_list.json'), JSON.stringify(data, null, 4));
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
			return false;
		}
		
	});

	ipcMain.handle('download-check', async(event, arg, response) => {
		
				return downlod_check(arg, response);
			
			

	});

	

	ipcMain.handle('download-pause', (event, arg) => {
		

		if(Object.keys(array_downloader).includes(''+arg)) {
			download_list.paused[arg] = download_list.downloading[arg];
			download_list.paused[arg].status = "paused";
			download_list.paused[arg].progress = array_downloader[arg].totalProgress.percentage;
			download_list.paused[arg].downloaded = array_downloader[arg].totalProgress.bytes;
			delete download_list.downloading[arg];
			updateDownloadList(download_list_file, download_list);
			array_downloader[arg].destroy();
			delete array_downloader[arg];
			return true;
		} else {
			return false;
		}
	});

	ipcMain.handle('download-resume', async(event, arg) => {
		var data ;
		if(Object.keys(download_list.paused).includes(''+arg)) {
			data = download_list.paused[arg];
		} else if(Object.keys(download_list.stopped).includes(''+arg)) {
			data = download_list.stopped[arg];
		}
		data.init_time = new Date().getTime();
		data.status = "queued";
		var result =downlod_check(data, {"headers": {"content-length": data.content_length, "content-type": data.content_type, "last-modified": data.last_modified}});
		if(result == false){
			return false;
		}
		data.temp_location = result;
		try{
			data.headers = JSON.stringify(data.headers);
			var datar = await downloader(data);

			array_downloader[data.init_time] = datar;
			delete download_list.paused[arg];
			data.headers = JSON.parse(data.headers);
			download_list.downloading[data.init_time] = data;
			updateDownloadList(download_list_file, download_list);
			return true;

		} catch(err) {
			return false;
		}
	});

	ipcMain.handle('download-data', async(event, arg) => {
		
		var data = {};
		for (i in array_downloader) {
			data[i] = {"status": array_downloader[i]._status, "progress": array_downloader[i].totalProgress.percentage, "content_length": array_downloader[i].size, "speed": array_downloader[i].totalProgress.speed, "downloaded": array_downloader[i].totalProgress.bytes, "filename": download_list.downloading[i].filename, "ext": download_list.downloading[i].ext, "url": download_list.downloading[i].url, "merge_percent": array_downloader[i]._margeStatus.percentage, "init_time": download_list.downloading[i].init_time,"location": download_list.downloading[i].location};
		}
		return data;
	});

	ipcMain.handle('download-completed', (event, arg) => {
		if(Object.keys(array_downloader).includes(''+arg)) {
			
			download_list.completed[arg] = download_list.downloading[arg];
			download_list.completed[arg]['time_taken'] = (new Date().getTime() - download_list.completed[arg].init_time)/1000;
			delete download_list.downloading[arg];
			array_downloader[arg]._status = "completed";
			delete array_downloader[arg];
			updateDownloadList(download_list_file, download_list);

			new Notification({title: 'CyberX+ Download Manager', body: 'Download Finished! File Name: '+download_list.completed[arg].filename, icon: path.join(__dirname, 'src/assets/img/logo/240px.png')}).show();
			fs.rm(download_list.completed[arg].temp_location, { recursive: true , force: true}, (err) => {
				updateDumb(download_list.completed[arg].temp_location)

			});
			return download_list.completed[arg]['time_taken'];
		} else {
			return false;
		}

	});

	ipcMain.handle('download-array', (event, arg) => {
		return Object.keys(array_downloader);
	});

	win.on('close', function (event) {
		if(!app.isQuiting){
			event.preventDefault();
			win.hide();
		}
	
		return false;
	});


	ipcMain.handle('download-delete', (event, arg) => {
		if(Object.keys(array_downloader).includes(''+arg)) {
			array_downloader[arg].destroy();
			delete array_downloader[arg];
			fs.rm(download_list.downloading[arg].temp_location, { recursive: true , force: true}, (err) => {
				updateDumb(download_list.downloading[arg].temp_location)
				delete download_list.downloading[arg];
				updateDownloadList(download_list_file, download_list);
			});
			return true;
		} else {
			return false;
		}
	});

	ipcMain.handle('download-ps', (event, arg, place) => {
		if(place == "paused"){
			fs.rm(download_list.paused[arg].temp_location, { recursive: true , force: true}, (err) => {
				updateDumb(download_list.paused[arg].temp_location)
				delete download_list.paused[arg];
				updateDownloadList(download_list_file, download_list);
			});

		} else if(place == "stopped"){
			fs.rm(download_list.stopped[arg].temp_location, { recursive: true , force: true}, (err) => {
				updateDumb(download_list.stopped[arg].temp_location)
				delete download_list.stopped[arg];
				updateDownloadList(download_list_file, download_list);
			});
		} else if(place == "completed"){
				delete download_list.completed[arg];
				updateDownloadList(download_list_file, download_list);
		}

		return true;
	});

	ipcMain.handle('download-clear-all-completed', (event, arg) => {
		download_list.completed = {};
		updateDownloadList(download_list_file, download_list);
		return true;
	});

	ipcMain.handle('download-clear-full-list', (event, arg) => {

		download_list.completed = {};
		for (var i in download_list.paused) {
			var flag = download_list.paused[i].temp_location;
			fs.rm(download_list.paused[i].temp_location, { recursive: true , force: true}, (err) => {
				updateDumb(flag);
			});
			
		}
		for (var i in download_list.stopped) {
			var flag = download_list.stopped[i].temp_location;
			fs.rm(download_list.stopped[i].temp_location, { recursive: true , force: true}, (err) => {
				updateDumb(flag);
				
			});
		}
		download_list.paused = {};
		download_list.stopped = {};
		updateDownloadList(download_list_file, download_list);
		return true;

	});


	ipcMain.handle('download-pause-all', (event, arg) => {

		for (var i in array_downloader) {
			download_list.paused[i] = download_list.downloading[i];
			download_list.paused[i].status = "paused";
			download_list.paused[i].progress = array_downloader[i].totalProgress.percentage;
			download_list.paused[i].downloaded = array_downloader[i].totalProgress.bytes;
			delete download_list.downloading[i];
			array_downloader[i].destroy();
			delete array_downloader[i];
		}
		updateDownloadList(download_list_file, download_list);
		return true;

	});

	ipcMain.handle('download-resume-all', async(event, arg) => {

		for (var i in download_list.paused) {
			var data = download_list.paused[i];
			data.init_time = new Date().getTime();
			data.status = "queued";
			var result =downlod_check(data, {"headers": {"content-length": data.content_length, "content-type": data.content_type, "last-modified": data.last_modified}});
			data.temp_location = result;
			try{
				data.headers = JSON.stringify(data.headers);
				var datar = await downloader(data);
				array_downloader[data.init_time] = datar;
				delete download_list.paused[i];
				data.headers = JSON.parse(data.headers);
				download_list.downloading[data.init_time] = data;
				
			} catch(err) {
			}
			
		}
		updateDownloadList(download_list_file, download_list);

		for (var i in download_list.stopped) {
			var data = download_list.stopped[i];
			data.init_time = new Date().getTime();
			data.status = "queued";
			var result =downlod_check(data, {"headers": {"content-length": data.content_length, "content-type": data.content_type, "last-modified": data.last_modified}});
			data.temp_location = result;
			try{
				data.headers = JSON.stringify(data.headers);
				var datar = await downloader(data);
				array_downloader[data.init_time] = datar;
				delete download_list.stopped[i];
				data.headers = JSON.parse(data.headers);
				download_list.downloading[data.init_time] = data;
				
			} catch(err) {
			}
		}
		updateDownloadList(download_list_file, download_list);
		return true;
	});






		
}

app.whenReady().then(() => {

	const singleInstanceLock = app.requestSingleInstanceLock();
	if (process.platform == 'win32') {
		app.setAppUserModelId('CX+ Download Manager');
	  }
	if (!singleInstanceLock) {
		new Notification({title: 'CyberX+ Download Manager', body: 'CyberX+ Download Manager is still running in the background.', icon: path.join(__dirname, 'src/assets/img/logo/240px.png')}).show();
		app.quit();
		return;
	}

	createWindow()
	app.setLoginItemSettings({
		openAtLogin: true    
	})
	
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
	fs.writeFileSync(download_list_file, JSON.stringify(download_list, null, 4));
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
					
					counter += 1;
					
				} else {
					counter += 1;
				}
			} else {
				arg.temp_location = way;
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
			return i;
		}
	}
	return false;
}

function checkCompleted(download_list, last_modified, content_length, filename){
	for (i in download_list.completed) {
		if (download_list.completed[i].last_modified == last_modified && download_list.completed[i].content_length == content_length && download_list.completed[i].filename == filename) {
			return i;
		}
	}
	return false;
}

function checkPaused(download_list, last_modified, content_length, filename){
	for (i in download_list.paused) {
		if (download_list.paused[i].last_modified == last_modified && download_list.paused[i].content_length == content_length && download_list.paused[i].filename == filename) {
			return i;
		}
	}
	return false;
}

function checkStopped(download_list, last_modified, content_length, filename){
	for (i in download_list.stopped) {
		if (download_list.stopped[i].last_modified == last_modified && download_list.stopped[i].content_length == content_length && download_list.stopped[i].filename == filename) {
			return i;
		}
	}
	return false;
}

function downlod_check(arg, response){
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
				folderCreate(arg.temp_location,{"content_length": content_length, "content_type": content_type, "last_modified": last_modified});
				var data = {"url": arg.url, "temp_location": arg.temp_location, "filename": arg.filename, "headers": JSON.parse(arg.headers), "username": arg.username, "password": arg.password, "connections": arg.connections, "maxRetry": arg.maxRetry, "existBehavior": arg.existBehavior, "reportInterval": arg.reportInterval, "init_time": arg.init_time, "content_length": content_length, "content_type": content_type, "last_modified": last_modified, "status": "downloading", "progress": 0, "downloaded": 0, "eta": 0, "ext": path.parse(arg.temp_location).ext, "location": arg.location};
				download_list.downloading[arg.init_time] = data;
				updateDownloadList(download_list_file, download_list);

			}
		} else {
			return false;
		}

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
			folderCreate(arg.temp_location,{"content_length": 0, "content_type": "", "last_modified": ""});
			var data = {"url": arg.url, "temp_location": arg.temp_location, "filename": arg.filename, "headers": JSON.parse(arg.headers), "username": arg.username, "password": arg.password, "connections": arg.connections, "maxRetry": arg.maxRetry, "existBehavior": arg.existBehavior, "reportInterval": arg.reportInterval, "init_time": arg.init_time, "content_length": 0, "content_type": "", "last_modified": "", "status": "downloading", "progress": 0, "downloaded": 0, "eta": 0, "ext": path.parse(arg.temp_location).ext, "location": arg.location};
			download_list.downloading[arg.init_time] = data;
			updateDownloadList(download_list_file, download_list);
			return arg.temp_location;
		}
	}
}

function updateDumb(data){
	var dumb = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'system','dumb.json')));
	var init_time = new Date().getTime();
	dumb[init_time] = {"temp_location": data};
	fs.writeFileSync(path.join(__dirname, '..', 'system','dumb.json'), JSON.stringify(dumb));
	return;
}


function clearDumb(){
	var dumb = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'system','dumb.json')));
	var new_dumb = {};
	for (var i in dumb) {
		fs.rm(dumb[i].temp_location, { recursive: true }, (err) => {
			if (err) {
				new_dumb[i] = dumb[i];
			}
		});
		delete dumb[i];
	}
	fs.writeFileSync(path.join(__dirname, '..', 'system','dumb.json'), JSON.stringify(new_dumb));
	return;

}



	
	








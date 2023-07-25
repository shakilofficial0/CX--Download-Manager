const path = require('path');
const fs = require('fs');
const request = require('request');
const { count } = require('console');


const updateDownloadList=(download_list_file, download_list)=>{
	fs.writeFileSync(download_list_file, JSON.stringify(download_list));
}

const check_file_exist=(arg, download_list_file, download_list)=>{
	try{
	var data = request({
		method: 'HEAD',
		url: arg.url,
		headers: JSON.parse(arg.headers).headers
	}, function (error, response, body) {
		if (error) {
			console.log(error);
		} else {
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
						var data = {"url": arg.url, "temp_location": arg.temp_location, "filename": arg.filename, "headers": JSON.parse(arg.headers), "username": arg.username, "password": arg.password, "connections": arg.connections, "maxRetry": arg.maxRetry, "existBehavior": arg.existBehavior, "reportInterval": arg.reportInterval, "init_time": arg.init_time, "content_length": content_length, "content_type": content_type, "last_modified": last_modified, "status": "downloading", "progress": 0, "downloaded": 0, "eta": 0, "ext": temp_p.ext};
						download_list.downloading[arg.init_time] = data;
						updateDownloadList(download_list_file, download_list);
						} else {
							return false;
						}
						
					} else {
						folderCreate(arg.temp_location,{"content_length": content_length, "content_type": content_type, "last_modified": last_modified});
						var data = {"url": arg.url, "temp_location": arg.temp_location, "filename": arg.filename, "headers": JSON.parse(arg.headers), "username": arg.username, "password": arg.password, "connections": arg.connections, "maxRetry": arg.maxRetry, "existBehavior": arg.existBehavior, "reportInterval": arg.reportInterval, "init_time": arg.init_time, "content_length": content_length, "content_type": content_type, "last_modified": last_modified, "status": "downloading", "progress": 0, "downloaded": 0, "eta": 0, "ext": path.parse(arg.temp_location).ext};
						download_list.downloading[arg.init_time] = data;
						updateDownloadList(download_list_file, download_list);

					}
				}

				
				return true;

			} else {
				if(fs.existsSync(arg.temp_location)){
					if(locationUpdate(arg, {"content_length": 0, "content_type": "", "last_modified": ""}) != false){
						var data = {"url": arg.url, "temp_location": arg.temp_location, "filename": arg.filename, "headers": JSON.parse(arg.headers), "username": arg.username, "password": arg.password, "connections": arg.connections, "maxRetry": arg.maxRetry, "existBehavior": arg.existBehavior, "reportInterval": arg.reportInterval, "init_time": arg.init_time, "content_length": 0, "content_type": "", "last_modified": "", "status": "downloading", "progress": 0, "downloaded": 0, "eta": 0, "ext": path.parse(arg.temp_location).ext};
						download_list.downloading[arg.init_time] = data;
						updateDownloadList(download_list_file, download_list);

					return true;
					} else {
						return false;
					}
					
				} else {
					folderCreate(arg.temp_location,{"content_length": 0, "content_type": "", "last_modified": ""});
					var data = {"url": arg.url, "temp_location": arg.temp_location, "filename": arg.filename, "headers": JSON.parse(arg.headers), "username": arg.username, "password": arg.password, "connections": arg.connections, "maxRetry": arg.maxRetry, "existBehavior": arg.existBehavior, "reportInterval": arg.reportInterval, "init_time": arg.init_time, "content_length": 0, "content_type": "", "last_modified": "", "status": "downloading", "progress": 0, "downloaded": 0, "eta": 0, "ext": path.parse(arg.temp_location).ext};
					download_list.downloading[arg.init_time] = data;
					updateDownloadList(download_list_file, download_list);
					return true;
				}
			}
		}
		});
	} catch(err) {
		if(fs.existsSync(arg.temp_location)){
			if(locationUpdate(arg, {"content_length": 0, "content_type": "", "last_modified": ""}) != false){
			return true;
			} else {
				return false;
			}
			
		} else {
			folderCreate(arg.temp_location,{"content_length": 0, "content_type": "", "last_modified": ""});
			return true;
		}
		
	}
}

const locationUpdate=(arg, http_data, download_list)=>{
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

const folderCreate=(way,http_data)=>{
	if(!fs.existsSync(way)){
		fs.mkdirSync(way);
	}

	fs.writeFileSync(path.join(way,'log.json'), JSON.stringify(http_data));
	return way;
}

const checkDownload=(download_list, last_modified, content_length, filename)=>{
	for (i in download_list.downloading) {
		if (download_list.downloading[i].last_modified == last_modified && download_list.downloading[i].content_length == content_length && download_list.downloading[i].filename == filename) {
			console.log('File already downloading.');
			return i;
		}
	}
	return false;
}

const checkCompleted=(download_list, last_modified, content_length, filename)=>{
	for (i in download_list.completed) {
		if (download_list.completed[i].last_modified == last_modified && download_list.completed[i].content_length == content_length && download_list.completed[i].filename == filename) {
			console.log('File found in completed list.');
			return i;
		}
	}
	return false;
}

const checkPaused=(download_list, last_modified, content_length, filename)=>{
	for (i in download_list.paused) {
		if (download_list.paused[i].last_modified == last_modified && download_list.paused[i].content_length == content_length && download_list.paused[i].filename == filename) {
			console.log('File found in Paused list.');
			return i;
		}
	}
	return false;
}

const checkStopped=(download_list, last_modified, content_length, filename)=>{
	for (i in download_list.stopped) {
		if (download_list.stopped[i].last_modified == last_modified && download_list.stopped[i].content_length == content_length && download_list.stopped[i].filename == filename) {
			console.log('File found in Stopped list.');
			return i;
		}
	}
	return false;
}

module.exports = { updateDownloadList, check_file_exist, locationUpdate, folderCreate };
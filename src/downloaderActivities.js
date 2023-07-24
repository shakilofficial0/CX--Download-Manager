const fs = require('fs');
const path = require('path');
const utilities = require('./utilities.js');
const { ipcRenderer } = require('electron');



const system_var = JSON.parse(fs.readFileSync(path.join(__dirname,'..','system', 'settings.json'), 'utf8')).settings;
var download_list = JSON.parse(fs.readFileSync(path.join(__dirname,'..','system', 'download_list.json'), 'utf8'));

var download_list_path = path.join(__dirname,'..','system', 'download_list.json');




function updateDownloadList(){
	fs.writeFileSync(download_list_path, JSON.stringify(download_list));
}



var downloadBtn = document.getElementById('download-submit');
var downloadarray =	[];
function isUrl(string){
	var matcher = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/;
	return matcher.test(string);
  }
downloadBtn.addEventListener('click', (event) => {
	event.preventDefault();
	var action_url = document.getElementById('download-url').value,
	location = document.getElementById('download-location').value,
	filename = document.getElementById('download-name').value,
	headers = document.getElementById('download-header').value,
	username = document.getElementById('download-username').value,
	password = document.getElementById('download-password').value;
	console.log(utilities.urlToFilename(action_url));

	if(action_url == '' || isUrl(action_url) == false){
		Swal.fire({
			icon: 'error',
			title: 'Oops...',
			html: 'Please enter a valid URL!',
			showConfirmButton: true,
			confirmButtonText: 'Go Back',
			customClass: {
				confirmButton: 'btn btn-primary',
			},
			buttonsStyling: false
			
		});
		return;
	} else {
		var temp_location = system_var.location.temp;
		var init_time = new Date().getTime();
		var filename = filename || utilities.urlToFilename(action_url);
		var temp_location = path.join(temp_location, filename);

		var headers = {"headers": { "User-Agent": "CX+ Download Manager/1.0.0", "accept": "*/*", 'accept-enconding': '*', 'accept-language': 'en-US,en;q=0.9', 'cache-control': 'no-cache', 'pragma': 'no-cache', 'dnt': '1',
		}};

		console.log();

		ipcRenderer.invoke('download-add-queue', {
			url: action_url,
			temp_location: temp_location,
			location: location,
			filename: filename,
			headers: JSON.stringify(headers),
			username: username,
			password: password,
			init_time: init_time,
			status: 'queued',
			maxRetry: 10,
			existBehavior: "overwrite",
			reportInterval: 1000,
			connections: 10,
		}).then((result) => {
			console.log(result);
		}
		);
	
	}

	
});

setInterval(() => {
			
	ipcRenderer.invoke('download-data', 'download-data').then((result) => {
		console.log(result);
	});

}, 1000);

// Module Rewrite
// Path: node_modules\easydl\dist\index.js

// chunkSize: (size) => {
// 	if(size < 1048576){
// 		return size/4;
// 	}else if (size < 5242880){
// 		return size/10;
// 	} else if(size < 104857600){
// 		return size/15;
// 	} else if(size < 1048576000){
// 		return size/20;
// 	} else {
// 		return size/25;
// 	}
// },
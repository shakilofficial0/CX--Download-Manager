const fs = require('fs');
const path = require('path');
const utilities = require('./utilities.js');
const { ipcRenderer } = require('electron');



const system_var = JSON.parse(fs.readFileSync(path.join(__dirname,'..','system', 'settings.json'), 'utf8')).settings;
var download_list_file = path.join(__dirname, '..', 'system', 'download_list.json');
var download_list = JSON.parse(fs.readFileSync(download_list_file));

// section Creation on Starting

for (var index in download_list.paused) {
	var download_list_html = document.getElementById('Paused');
			var sub_html = '<div class="card shadow-none border border-warning mb-3" id="dl-'+index+'">';
			sub_html +='<div class="card-body">';
			sub_html +='<div class="card-title header-elements">';
			sub_html +='<div class="card-header-elements ms-auto" id="dl-status-'+index+'">';
			sub_html +='<i class="ti ti-player-play ti-sm" dl-data="'+index+'"></i>';
			sub_html +='<i class="ti ti-trash ti-sm" dl-data="'+index+'"></i>';
			sub_html +='</div>';
			sub_html +='</div>';

			sub_html +='<div class="row">';
			sub_html +='<div class="col-2 m-2 avatar avatar-xl">';
			sub_html +='<img src="'+utilities.extToIcon(download_list.paused[index].ext)+'" alt class="h-auto" />';
			sub_html +='</div>';
			sub_html +='<div class="col-9">';
			sub_html +='<span class="fw-semibold d-block">File Name: <span class="fw-semibold">'+download_list.paused[index].filename+'</span></span>';
				  
			sub_html +='<div class="d-flex">';
			sub_html +='<span class="fw-semibold d-block">File Size: '+utilities.humanReadableByte(download_list.paused[index].content_length)+'</span>';
			sub_html +='<span class="fw-semibold d-block ms-auto">Download Speed: <span id="dl-speed-'+index+'">0 B/s</span></span>';
			sub_html +='</div>';
			sub_html +='<div class="d-flex">';
					  
			sub_html +='<span class="fw-semibold d-block">Downloaded: <span id="dl-downloaded-'+index+'">'+utilities.humanReadableByte(download_list.paused[index].downloaded)+'</span></span>';
			sub_html +='<span class="fw-semibold d-block mb-3 ms-auto" >Time Left: <span id="dl-eta-'+index+'">---</span></span>';
			sub_html +='</div>';
				  
			sub_html +='<div class="progress">';
			sub_html +='<div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" id="dl-progress-'+index+'" role="progressbar" style="width: '+utilities.humanReadablePercent(download_list.paused[index].progress)+'%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>';
			sub_html +='</div>';
			sub_html +='</div>';

			sub_html +='</div>';

			sub_html +='</div>';
			sub_html +='</div>';

			download_list_html.innerHTML = sub_html + download_list_html.innerHTML;
}




var downloadBtn = document.getElementById('download-submit');
var downloadarray =	{};
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
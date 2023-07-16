const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const url = require('url');
const Downloader = require('easydl');
const utilities = require('./utilities');



const system_var = JSON.parse(fs.readFileSync(path.join(__dirname,'..','system', 'settings.json'), 'utf8')).settings;
var download_list = JSON.parse(fs.readFileSync(path.join(__dirname,'..','system', 'download_list.json'), 'utf8'));

var download_list_path = path.join(__dirname,'..','system', 'download_list.json');

var download_list_html = document.getElementById('Downloading');


function updateDownloadList(){
	fs.writeFileSync(download_list_path, JSON.stringify(download_list));
}

var object_downloader = [];

var downloadBtn = document.getElementById('download-submit');

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
		if(fs.existsSync(temp_location) == false){
			fs.mkdirSync(temp_location);
		}

		

		var filename = filename || '';
		var temp_location = path.join(temp_location, filename);
		var init_time = new Date().getTime();

		const dler = new Downloader(action_url, temp_location, {
		connections: 10,
		httpOptions: {
			headers: {
			"User-Agent": "EasyDL",
			},
		},
		maxRetry: 10,
		existBehavior: "overwrite",
		reportInterval: 1000,

		})
		


		object_downloader.push([dler, init_time]);
		var index = object_downloader.length - 1;
		object_downloader[index][0].on("metadata", (meta) => {
			var data = {"name": utilities.pathToFilename(object_downloader[index][0].savedFilePath),"size":utilities.humanReadableByte(object_downloader[index][0].size), "percent":0, "status":"Starting", "speed":"0 B/s", "eta":"---", "downloaded_size":"0 MB","link":object_downloader[index][0].finalAddress, "path":object_downloader[index][0].savedFilePath, "date_time":init_time,"extention":utilities.filenameToExtention(object_downloader[index][0].savedFilePath)};
			download_list.downloading.unshift(data);
			updateDownloadList();

			// init html

			var sub_html = '<div class="card shadow-none border border-primary mb-3" id="dl-'+init_time+'">'
			sub_html +='<div class="card-body">'
			sub_html +='<div class="card-title header-elements">'
			sub_html +='<div class="card-header-elements ms-auto">'
			sub_html +='<i class="ti ti-player-pause ti-sm" dl-data="'+init_time+'"></i>'
			sub_html +='<i class="ti ti-trash ti-sm" dl-data="'+init_time+'"></i>'
			sub_html +='</div>'
			sub_html +='/div>'

			sub_html +='<div class="row">'
			sub_html +='<div class="col-2 m-2 avatar avatar-xl">'
			sub_html +='<img src="./assets/img/icons/extension-icons/ZIP.png" alt class="h-auto" />'
			sub_html +='</div>'
			sub_html +='<div class="col-9">'
			sub_html +='<span class="fw-semibold d-block">File Name: <span class="fw-semibold">'+data.name+'</span></span>'
				  
			sub_html +='<div class="d-flex">'
			sub_html +='<span class="fw-semibold d-block">File Size: '+data.size+'</span>'
			sub_html +='<span class="fw-semibold d-block ms-auto">Download Speed: <span id="dl-speed-'+init_time+'">0 B/s</span></span>'
			sub_html +='</div>'
			sub_html +='<div class="d-flex">'
					  
			sub_html +='<span class="fw-semibold d-block">Downloaded: <span id="dl-downloaded-'+init_time+'">0 Byte</span></span>'
			sub_html +='<span class="fw-semibold d-block mb-3 ms-auto" >Time Left: <span id="dl-eta-'+init_time+'">---</span></span>'
			sub_html +='</div>'
				  
			sub_html +='<div class="progress">'
			sub_html +='<div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" id="dl-progress-'+init_time+'" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>'
			sub_html +='</div>'
			sub_html +='</div>'

			sub_html +='</div>'

			sub_html +='</div>'
			sub_html +='</div>'

			download_list_html.innerHTML = sub_html + download_list_html.innerHTML;


		});

		object_downloader[index][0].on("build", (progress) => {
			console.log("merging files ...", progress.percentage, "%");
			console.log(progress);
			if(progress.percentage < 10){
			var data_index = utilities.nameToJsonIndex(download_list.downloading, utilities.pathToFilename(object_downloader[index][0].savedFilePath));
			var data = {"name": utilities.pathToFilename(object_downloader[index][0].savedFilePath),"size":utilities.humanReadableByte(object_downloader[index][0].size), "percent":progress.percentage, "status":"Merging", "speed":"0 B/s", "eta":"---", "downloaded_size":utilities.humanReadableByte(object_downloader[index][0].totalProgress.bytes),"link":object_downloader[index][0].finalAddress, "path":object_downloader[index][0].savedFilePath, "date_time":init_time,"extention":utilities.filenameToExtention(object_downloader[index][0].savedFilePath)};
			download_list.downloading[data_index] = data;
			updateDownloadList();
			}
		  })
		
		object_downloader[index][0].on("end", () => {
			var data_index = utilities.nameToJsonIndex(download_list.downloading, utilities.pathToFilename(object_downloader[index][0].savedFilePath));
			var data = {"name":"","size":"", "status":"Completed", "time_taken": (init_time - new Date().getTime()),"link":object_downloader[index][0].finalAddress, "path":object_downloader[index][0].savedFilePath, "date_time":init_time,"extention":utilities.filenameToExtention(object_downloader[index][0].savedFilePath)};
			download_list.downloading.splice(data_index, 1);
			download_list.completed.unshift(data);
			updateDownloadList();
		  })

		object_downloader[index][0].start();

		var banger = setInterval(() => {
			console.log(object_downloader[index][0]);
			if(object_downloader[index][0]._done == true){
				clearInterval(banger);
			}
		}, 1000);
		


		

		

		
		

		

		



	}

	
});

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
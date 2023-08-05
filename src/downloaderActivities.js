const fs = require('fs');
const path = require('path');
const utilities = require('./utilities.js');
const { shell,ipcRenderer } = require('electron');
const request = require('request');



const system_var = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..','system', 'settings.json'), 'utf8')).settings;
var download_list_file = path.join(__dirname, '..', '..', 'system', 'download_list.json');
var download_list = JSON.parse(fs.readFileSync(download_list_file));

// section Creation on Starting
createPausedSection(download_list.paused);
createCompleteSection(download_list.completed);
createStoppedSection(download_list.stopped);



document.getElementById('download-header').value = '{"headers": { "User-Agent": "CX+ Download Manager/1.0.0", "accept": "*/*", "accept-enconding": "*", "accept-language": "en-US,en;q=0.9", "cache-control": "no-cache", "pragma": "no-cache", "dnt": "1"}}';




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

		headers = headers || '{"headers": { "User-Agent": "CX+ Download Manager/1.0.0", "accept": "*/*", "accept-enconding": "*", "accept-language": "en-US,en;q=0.9", "cache-control": "no-cache", "pragma": "no-cache", "dnt": "1"}}';

		

		

		
		var requestData = request({
			method: 'HEAD',
			url: action_url ,
			headers: JSON.parse(headers).headers
		}, function (error, response, body) {

			if (error) {
				console.log(error);
				Swal.fire({
					icon: 'error',
					title: 'Oops...',
					html: 'Error: '+error+'<br>Please check your URL and try again!',
					showConfirmButton: true,
					confirmButtonText: 'Go Back',
					customClass: {
						confirmButton: 'btn btn-primary',
					},
					buttonsStyling: false
					
				});
			} else {
				$('#addNewDownload').modal('hide');
				ipcRenderer.invoke('download-check', {
					url: action_url,
					temp_location: temp_location,
					location: location,
					filename: filename,
					headers: headers,
					username: username,
					password: password,
					init_time: init_time,
					status: 'queued',
					maxRetry: 10,
					existBehavior: "overwrite",
					reportInterval: 1000,
					connections: 10,
				}, {"headers": response.headers}).then((result) => {
					
					if(result == false){
						Swal.fire({
							icon: 'error',
							title: 'Oops...',
							html: 'Download already in queue! Please wait for it to complete or delete it from the queue.',
							showConfirmButton: true,
							confirmButtonText: 'Go Back',
							customClass: {
								confirmButton: 'btn btn-primary',
							},
							buttonsStyling: false
							
						});
					} else {

						ipcRenderer.invoke('download-add-queue', {
							url: action_url,
							temp_location: result,
							location: location,
							filename: filename,
							headers: headers,
							username: username,
							password: password,
							init_time: init_time,
							status: 'queued',
							maxRetry: 10,
							existBehavior: "overwrite",
							reportInterval: 1000,
							connections: 10,
						}).then((result) => {
						});
						
					}
				});


			}


		});
	
	}

	
});

setInterval(() => {
			
	ipcRenderer.invoke('download-data', 'download-data').then((result) => {
		

		for (var i in result) {
			var section = document.getElementById('dl-'+i);
			var init = {};
			init[i] = result[i];
			if(section == null){
				if(result[i].status == 'paused'){
					createPausedSection(init);
				} else if(result[i].status == 'stopped'){
					createStoppedSection(init);
				} else if(result[i].status == 'finished'){
					createCompleteSection(init);
				} else if(result[i].status == 'started'){
					createDownloadingSection(init);
				}

			} else {
				// check status and section
				if(result[i].status == 'paused' && section.parentElement.id != 'Paused'){
					section.remove();
					createPausedSection(init);
				} else if(result[i].status == 'stopped' && section.parentElement.id != 'Stopped'){
					section.remove();
					createStoppedSection(init);
				} else if(result[i].status == 'finished' && section.parentElement.id != 'Completed'){
					section.remove();
					createCompleteSection(init);
				} else if((result[i].status == 'started')&& section.parentElement.id != 'Downloading'){
					section.remove();
					createDownloadingSection(init);
				}

				if(result[i].status == 'started'){
					var progress = document.getElementById('dl-progress-'+i);
					var speed = document.getElementById('dl-speed-'+i);
					var downloaded = document.getElementById('dl-downloaded-'+i);
					var eta = document.getElementById('dl-eta-'+i);
					var size = document.getElementById('dl-size-'+i);

					size.innerHTML = utilities.humanReadableByte(result[i].content_length);

					progress.style.width = utilities.humanReadablePercent(result[i].progress) + '%';
					speed.innerHTML = utilities.humanReadableByte(result[i].speed) + '/s';
					downloaded.innerHTML = utilities.humanReadableByte(result[i].downloaded);
					eta.innerHTML = utilities.getEta(result[i].content_length, result[i].downloaded, result[i].speed);
					
				} else if (result[i].status == 'merging'){
					var progress = document.getElementById('dl-progress-'+i);
					if(progress.classList.contains('bg-primary')){
						progress.classList.remove('bg-primary');
						progress.classList.add('bg-success');
					} else if(progress.classList.contains('bg-success')){

					}
					progress.style.width = utilities.humanReadablePercent(result[i].merge_percent) + '%';
					
				} else if (result[i].status == 'finished'){
					console.log('OK');
					var section = document.getElementById('dl-'+i);
					if(section.parentElement.id == 'Downloading'){
						section.remove();
						createCompleteSection(init);
					}
					ipcRenderer.invoke('download-completed', i).then((result) => {
						console.log(result);
						if(result != false){
							var time_taken = document.getElementById('dl-cltd-time-taken-'+i);
							time_taken.innerHTML = 'Time: '+utilities.humanReadableTime(result);
						}
					});

				}

			}
		}
		

		
	});

}, 500);

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

function createPausedSection(arg){

		var sub_html = '';
		for (var index in arg) {

			sub_html += '<div class="card shadow-none border border-warning mb-3" id="dl-'+index+'">';
			sub_html +='<div class="card-body">';
			sub_html +='<div class="card-title header-elements">';
			sub_html +='<div class="card-header-elements ms-auto" id="dl-status-'+index+'">';
			sub_html +='<i class="ti ti-player-play ti-sm" dl-data="'+index+'" onclick="resumeDownload('+index+')"></i>';
			sub_html +='<i class="ti ti-trash ti-sm" dl-data="'+index+'" onclick="deletePS(\''+index+'\', \'paused\')"></i>';
			sub_html +='</div>';
			sub_html +='</div>';

			sub_html +='<div class="row">';
			sub_html +='<div class="col-2 m-2 avatar avatar-xl">';
			sub_html +='<img src="'+utilities.extToIcon(arg[index].ext)+'" alt class="h-auto" />';
			sub_html +='</div>';
			sub_html +='<div class="col-9">';
			sub_html +='<span class="fw-semibold d-block">File Name: <span class="fw-semibold">'+arg[index].filename+'</span></span>';
				  
			sub_html +='<div class="d-flex">';
			sub_html +='<span class="fw-semibold d-block">File Size: '+utilities.humanReadableByte(arg[index].content_length)+'</span>';
			sub_html +='<span class="fw-semibold d-block ms-auto">Download Speed: <span id="dl-speed-'+index+'">0 B/s</span></span>';
			sub_html +='</div>';
			sub_html +='<div class="d-flex">';
					  
			sub_html +='<span class="fw-semibold d-block">Downloaded: <span id="dl-downloaded-'+index+'">'+utilities.humanReadableByte(arg[index].downloaded)+'</span></span>';
			sub_html +='<span class="fw-semibold d-block mb-3 ms-auto" >Time Left: <span id="dl-eta-'+index+'">---</span></span>';
			sub_html +='</div>';
				  
			sub_html +='<div class="progress">';
			sub_html +='<div class="progress-bar progress-bar-striped progress-bar-animated bg-warning" id="dl-progress-'+index+'" role="progressbar" style="width: '+utilities.humanReadablePercent(arg[index].progress)+'%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>';
			sub_html +='</div>';
			sub_html +='</div>';

			sub_html +='</div>';

			sub_html +='</div>';
			sub_html +='</div>';

			
		}
		var paused_list_html = document.getElementById('Paused');
		paused_list_html.innerHTML = sub_html + paused_list_html.innerHTML;

}

function createCompleteSection(arg){
	var arg_keys = Object.keys(arg).reverse();

	var sub_html = '';
	for (var i in arg_keys) {
				var a = new Date(arg[arg_keys[i]].init_time);
				var month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
				sub_html += '<div class="card shadow-none border border-success mb-3" id="dl-'+arg_keys[i]+'">';
				sub_html += '<div class="card-body">';
				sub_html +='<div class="card-title header-elements">';
				sub_html +='<div class="card-header-elements ms-auto">';
				sub_html +='<i class="ti ti-folder ti-sm" onclick="gotoFolder(\''+arg[arg_keys[i]].location.replace(/\\/g,'\\\\')+'\', \''+arg[arg_keys[i]].filename+'\')"></i>';
				sub_html +='<i class="ti ti-trash ti-sm" onclick="deletePS(\''+arg_keys[i]+'\', \'completed\')"></i>';
				sub_html +='</div>';
				sub_html +='</div>';
				sub_html +='<div class="row">';
				sub_html +='<div class="col-2 m-2 avatar avatar-xl">';
				sub_html +='<img src="'+utilities.extToIcon(arg[arg_keys[i]].ext)+'" alt class="h-auto" />';
				sub_html +='</div>';
				sub_html +='<div class="col-9">';
				sub_html +='<span class="fw-semibold d-block text-truncate">File Name: <span class="fw-bold" >'+arg[arg_keys[i]].filename+'</span></span>';
				sub_html +='<div class="d-flex">';
				sub_html +='<span class="fw-semibold d-block">File Size: '+utilities.humanReadableByte(arg[arg_keys[i]].content_length)+'</span>';
				if(arg[arg_keys[i]].time_taken != undefined){
				sub_html +='<span class="fw-semibold d-block ms-auto mb-1" id="dl-cltd-time-taken-'+arg_keys[i]+'">Time: '+utilities.humanReadableTime(arg[arg_keys[i]].time_taken)+'</span>';
				} else {
					sub_html +='<span class="fw-semibold d-block ms-auto mb-1" id="dl-cltd-time-taken-'+arg_keys[i]+'">Time: Counting..</span>';
				}
				sub_html +='</div>';
				sub_html +='<div class="d-flex">';
				sub_html +='<span class="d-block text-truncate">Link: <span class="text-primary">'+arg[arg_keys[i]].url+'</span></span>';	
				sub_html +='</div>';
				sub_html +='</div>';
				sub_html +='<div class="col-12"><span class="text-end d-block" style="font-size: 0.7rem; letter-spacing: 0.13rem;">'+month[a.getMonth()]+' '+a.getDate()+', '+a.getFullYear()+'  '+a.getHours()+':'+a.getMinutes()+'</span></div>';
				sub_html +='</div>';
				sub_html +='</div>';
				sub_html +='</div>';
	
	}
	
	var completed_list_html = document.getElementById('Completed');
	completed_list_html.innerHTML = sub_html + completed_list_html.innerHTML;
}

function createStoppedSection(arg){
	var sub_html = '';
	for (var index in arg) {
	
				sub_html += '<div class="card shadow-none border border-danger mb-3" id="dl-'+index+'">';
				sub_html +='<div class="card-body">';
				sub_html +='<div class="card-title header-elements">';
				sub_html +='<div class="card-header-elements ms-auto" id="dl-status-'+index+'">';
				sub_html +='<i class="ti ti-player-play ti-sm" dl-data="'+index+'" onclick="resumeDownload('+index+')"></i>';
				sub_html +='<i class="ti ti-trash ti-sm" dl-data="'+index+'" onclick="deletePS(\''+index+'\', \'stopped\')"></i>';
				sub_html +='</div>';
				sub_html +='</div>';
	
				sub_html +='<div class="row">';
				sub_html +='<div class="col-2 m-2 avatar avatar-xl">';
				sub_html +='<img src="'+utilities.extToIcon(arg[index].ext)+'" alt class="h-auto" />';
				sub_html +='</div>';
				sub_html +='<div class="col-9">';
				sub_html +='<span class="fw-semibold d-block">File Name: <span class="fw-semibold">'+arg[index].filename+'</span></span>';
					  
				sub_html +='<div class="d-flex">';
				sub_html +='<span class="fw-semibold d-block">File Size: '+utilities.humanReadableByte(arg[index].content_length)+'</span>';
				sub_html +='<span class="fw-semibold d-block ms-auto">Download Speed: <span id="dl-speed-'+index+'">0 B/s</span></span>';
				sub_html +='</div>';
				sub_html +='<div class="d-flex">';
						  
				sub_html +='<span class="fw-semibold d-block">Downloaded: <span id="dl-downloaded-'+index+'">'+utilities.humanReadableByte(arg[index].downloaded)+'</span></span>';
				sub_html +='<span class="fw-semibold d-block mb-3 ms-auto" >Time Left: <span id="dl-eta-'+index+'">---</span></span>';
				sub_html +='</div>';
					  
				sub_html +='<div class="progress">';
				sub_html +='<div class="progress-bar progress-bar-striped progress-bar-animated bg-danger" id="dl-progress-'+index+'" role="progressbar" style="width: '+utilities.humanReadablePercent(arg[index].progress)+'%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>';
				sub_html +='</div>';
				sub_html +='</div>';
	
				sub_html +='</div>';
	
				sub_html +='</div>';
				sub_html +='</div>';
	
	}
	var stopped_list_html = document.getElementById('Stopped');
	stopped_list_html.innerHTML = sub_html + stopped_list_html.innerHTML;
}

function createDownloadingSection(arg){
	console.log(arg);
	var sub_html = '';
	for (var index in arg) {
				console.log(arg[index]);
				sub_html += '<div class="card shadow-none border border-primary mb-3" id="dl-'+index+'">';
				sub_html +='<div class="card-body">';
				sub_html +='<div class="card-title header-elements">';
				sub_html +='<div class="card-header-elements ms-auto" id="dl-status-'+index+'">';
				sub_html +='<i class="ti ti-player-pause ti-sm" onclick="pauseDownload('+index+')"></i>';
				sub_html +='<i class="ti ti-trash ti-sm" dl-data="'+index+'" onclick="deleteDownloading(\''+index+'\')"></i>';
				sub_html +='</div>';
				sub_html +='</div>';
	
				sub_html +='<div class="row">';
				sub_html +='<div class="col-2 m-2 avatar avatar-xl">';
				sub_html +='<img src="'+utilities.extToIcon(arg[index].ext)+'" alt class="h-auto" />';
				sub_html +='</div>';
				sub_html +='<div class="col-9">';
				sub_html +='<span class="fw-semibold d-block">File Name: <span class="fw-semibold">'+arg[index].filename+'</span></span>';
					  
				sub_html +='<div class="d-flex">';
				sub_html +='<span class="fw-semibold d-block">File Size: <span id="dl-size-'+index+'">'+utilities.humanReadableByte(arg[index].content_length)+'</span></span>';
				sub_html +='<span class="fw-semibold d-block ms-auto">Download Speed: <span id="dl-speed-'+index+'">'+utilities.humanReadableByte(arg[index].speed)+'/s</span></span>';
				sub_html +='</div>';
				sub_html +='<div class="d-flex">';
						  
				sub_html +='<span class="fw-semibold d-block">Downloaded: <span id="dl-downloaded-'+index+'">'+utilities.humanReadableByte(arg[index].downloaded)+'</span></span>';
				sub_html +='<span class="fw-semibold d-block mb-3 ms-auto" >Time Left: <span id="dl-eta-'+index+'">'+utilities.getEta(arg[index].content_length, arg[index].downloaded, arg[index].speed)+'</span></span>';
				sub_html +='</div>';
					  
				sub_html +='<div class="progress">';
				sub_html +='<div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" id="dl-progress-'+index+'" role="progressbar" style="width: '+utilities.humanReadablePercent(arg[index].progress)+'%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>';
				sub_html +='</div>';
				sub_html +='</div>';
	
				sub_html +='</div>';
	
				sub_html +='</div>';
				sub_html +='</div>';
	
	}
	var download_list_html = document.getElementById('Downloading');
	download_list_html.innerHTML = sub_html + download_list_html.innerHTML;
}

function pauseDownload(id){


	
	var place = document.getElementById("dl-"+id);
	
	ipcRenderer.invoke('download-pause', id).then((result) => {
		if(result == true){
			place.remove();
			// update list
			var download_list = JSON.parse(fs.readFileSync(download_list_file));
			createPausedSection(download_list.paused);

		}
		
	});

}

function resumeDownload(id){
	var place = document.getElementById("dl-"+id);
	ipcRenderer.invoke('download-resume', id).then((result) => {
		if(result == true){
			place.remove();
		}
		
	});
}


function gotoFolder(location, filename){

	location = path.join(location, filename);
	if(fs.existsSync(location)){
		shell.showItemInFolder(location);
	} else {
		Swal.fire({
			icon: 'error',
			title: 'Oops...',
			html: 'File removed Locally!',
			showConfirmButton: true,
			confirmButtonText: 'Go Back',
			customClass: {
				confirmButton: 'btn btn-primary',
			},
			buttonsStyling: false
			
		});
	}
}


function deleteDownloading(id){

	Swal.fire({
		icon: 'warning',
		title: 'Are you sure?',
		html: 'You won\'t be able to revert this!',
		showCancelButton: true,
		confirmButtonText: 'Yes, delete it!',
		customClass: {
			confirmButton: 'btn btn-primary',
			cancelButton: 'btn btn-outline-danger ms-2'
		},
		buttonsStyling: false
	}).then(function (result) {
		if (result) {

			var place = document.getElementById("dl-"+id);
			ipcRenderer.invoke('download-delete', id).then((result) => {
				if(result == true){
					place.remove();
				}
				
			});
		}
	});

}

function deletePS(id, place){
	Swal.fire({
		icon: 'warning',
		title: 'Are you sure?',
		html: 'You won\'t be able to revert this!',
		showCancelButton: true,
		confirmButtonText: 'Delete',
		customClass: {
			confirmButton: 'btn btn-primary',
			cancelButton: 'btn btn-outline-danger ms-2'
		},
		buttonsStyling: false
	}).then(function (result) {
		var pl = document.getElementById("dl-"+id);
		if (result) {
			ipcRenderer.invoke('download-ps', id, place).then((result) => {
				if(result == true){
					pl.remove();
				}
				
			});
		}
	});
}
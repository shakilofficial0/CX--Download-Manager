const Downloader = require('mt-files-downloader');

const downloader = new Downloader();

var array = [];

var downloadBtn = document.getElementById('addNewDownload');

function isUrl(string){
	var matcher = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/;
	return matcher.test(string);
  }
downloadBtn.addEventListener('submit', (event) => {
	event.preventDefault();
	var url = document.getElementById('download-url').value,
	location = document.getElementById('download-location').value,
	filename = document.getElementById('download-name').value,
	headers = document.getElementById('download-header').value,
	username = document.getElementById('download-username').value,
	password = document.getElementById('download-password').value;

	if(url == '' || isUrl(url) == false){
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
	}

	if(location == ''){
		loca
});
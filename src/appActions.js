const { ipcRenderer, shell } = require('electron');
const path = require('path');
const Downloader = require('mt-files-downloader');
var closeBtn = document.getElementById('closeBtn');
var minBtn = document.getElementById('minBtn');
var maxBtn = document.getElementById('maxBtn');
var os   = require('os');


closeBtn.addEventListener('click', () => {
	console.log('closeBtn clicked');
	ipcRenderer.send('closeApp', 'closeApp');
}
);

minBtn.addEventListener('click', () => {
	console.log('minBtn clicked');
	ipcRenderer.send('minimizeApp', 'minimizeApp');
}
);
let maximize = false;
maxBtn.addEventListener('click', () => {

	console.log('maxBtn clicked');
	if(maximize == false) {
		maxBtn.innerHTML = '<i class="ti ti-window-minimize me-2 ti-sm"></i><span class="align-middle">Windowed</span>';
		maximize = true;
	} else {
		maxBtn.innerHTML = '<i class="ti ti-window-maximize me-2 ti-sm"></i><span class="align-middle">Maximize</span>';
		maximize = false;
	}
	ipcRenderer.send('maximizeApp', 'maximizeApp');
}
);


$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
});


var download_location = document.getElementById('download-location');
download_location.value = path.join(os.homedir(), 'Downloads');
download_location.addEventListener('click', (event) => {
	ipcRenderer.invoke('download-location', 'download-location').then((result) => {
		console.log(result);
		document.getElementById('download-location').value = result;
	}
	);

	
}
);




// Create new downloader
var downloader = new Downloader();

// Add download with custom headers




// Path: src\js\preload.js
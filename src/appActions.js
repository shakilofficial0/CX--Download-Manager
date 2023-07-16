const { ipcRenderer, shell } = require('electron');
const path = require('path');
var closeBtn = document.getElementById('closeBtn');
var minBtn = document.getElementById('minBtn');
var maxBtn = document.getElementById('maxBtn');
var os   = require('os');
const https = require('https');
const fs = require('fs');


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
		maxBtn.innerHTML = '<i class="ti ti-window-maximize me-2 ti-sm"></i><span class="align-middle">Fullscreen</span>';
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

// updater code

// Check if internet connection is available

var internetAvailable = require("internet-available");
var update_info = JSON.parse(fs.readFileSync(path.join(__dirname,'..','system', 'version.json'), 'utf8'));

// Set a timeout and a limit of attempts to check for connection
if(!update_info.version || update_info.last_update != new Date().toLocaleDateString()) {
internetAvailable({
    timeout: 4000,
    retries: 10,
}).then(function(){
    // check update available
	let url = "https://raw.githubusercontent.com/shakilofficial0/shakilofficial0.github.io/master/actions/updater/cyberxplus-download-manager.json";

	https.get(url,(res) => {
		let body = "";

		res.on("data", (chunk) => {
			body += chunk;
		});

		res.on("end", () => {
			try {
				let json = JSON.parse(body);
				// get app version from version.json
				let app_version = update_info.version;
				// get latest version from cyberxplus-download-manager.json
				let latest_version = json.version;
				// compare versions
				if (app_version != latest_version) {
					console.log('Update available');
					Swal.fire({
						icon: 'info',
						title: 'New Update Available!',
						html: '<p>Update to '+latest_version+' !</p><p>Added new features and fixed some bugs. Please update to the latest version. Click the button below to Download the latest version.</p>',
						footer: '<a href="https://codebumble.net/product/cyberx-plus-download-manager">What is New this Time?</a>',
						showCloseButton: true,
						confirmButtonText:'<i class="ti ti-download me-2"></i> Download Now',
						customClass: {
						  confirmButton: 'btn btn-warning',

						},
						buttonsStyling: false
					  }).then((result) => {
						if (result.isConfirmed) {
							shell.openExternal('https://codebumble.net/product/cyberx-plus-download-manager');
						}
					});			

				} else {
					console.log('No update available');
				}

				// update version.json
				update_info.last_update = new Date().toLocaleDateString();
				//fs.writeFileSync(path.join(__dirname,'..','system', 'version.json'), JSON.stringify(update_info));

				
			} catch (error) {
				console.error(error.message);
			};
		});

	}).on("error", (error) => {
		console.error(error.message);
	});


}).catch(function(){
    console.log("No internet");
});

} else {
	console.log('No Need to check for update');
}

// Create new downloader


// Add download with custom headers




// Path: src\js\preload.js
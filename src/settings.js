const { del } = require("request");

var settings_path = path.join(__dirname, '..','..','system', 'settings.json');
var settings_data = JSON.parse(fs.readFileSync(settings_path, 'utf8'));
var temp = document.getElementById("temp-location"),
	general = document.getElementById("general-location"),
	music = document.getElementById("music-location"),
	video = document.getElementById("video-location"),
	image = document.getElementById("image-location"),
	documentt = document.getElementById("document-location"),
	program = document.getElementById("program-location"),
	compressed = document.getElementById("compressed-location"),
	torrent = document.getElementById("torrent-location"),
	other = document.getElementById("other-location"),
	apply_location = document.getElementById("location-submit");



temp.value = settings_data.settings.location.temp;
general.value = settings_data.settings.location.general;
music.value = settings_data.settings.location.music;
video.value = settings_data.settings.location.video;
image.value = settings_data.settings.location.image;
documentt.value = settings_data.settings.location.document;
program.value = settings_data.settings.location.program;
compressed.value = settings_data.settings.location.compressed;
torrent.value = settings_data.settings.location.torrent;
other.value = settings_data.settings.location.other;

temp.addEventListener("click", async () => {
	ipcRenderer.invoke('download-location').then((result) => {
		if(result != false){
			temp.value = result+"\\";
		}
		
	});
});

general.addEventListener("click", async () => {
	ipcRenderer.invoke('download-location').then((result) => {
		if(result != false){
			general.value = result+"\\";
		}
		
	});
});

music.addEventListener("click", async () => {
	ipcRenderer.invoke('download-location').then((result) => {
		if(result != false){
			music.value = result+"\\";
		}
		
	});
});

video.addEventListener("click", async () => {
	ipcRenderer.invoke('download-location').then((result) => {
		if(result != false){
			video.value = result+"\\";
		}
		
	});
});

image.addEventListener("click", async () => {
	ipcRenderer.invoke('download-location').then((result) => {
		if(result != false){
			image.value = result+"\\";
		}
		
	});
});

documentt.addEventListener("click", async () => {
	ipcRenderer.invoke('download-location').then((result) => {
		if(result != false){
			documentt.value = result+"\\";
		}
		
	});
});

program.addEventListener("click", async () => {
	ipcRenderer.invoke('download-location').then((result) => {
		if(result != false){
			program.value = result+"\\";
		}
		
	});
});

compressed.addEventListener("click", async () => {
	ipcRenderer.invoke('download-location').then((result) => {
		if(result != false){
			compressed.value = result+"\\";
		}
		
	});
});

torrent.addEventListener("click", async () => {
	ipcRenderer.invoke('download-location').then((result) => {
		if(result != false){
			torrent.value = result+"\\";
		}
		
	});
});

other.addEventListener("click", async () => {
	ipcRenderer.invoke('download-location').then((result) => {
		if(result != false){
			other.value = result+"\\";
		}
		
	});
});

apply_location.addEventListener("click", async () => {
	console.log("apply location clicked");
	if(temp.value == "" || general.value == "" || music.value == "" || video.value == "" || image.value == "" || documentt.value == "" || program.value == "" || compressed.value == "" || torrent.value == "" || other.value == "") {
		swal.fire({
			icon: 'error',
			title: 'Oops...',
			text: 'Please fill all the fields!',
		});
	} else {
	settings_data.settings.location.temp = temp.value;
	settings_data.settings.location.general = general.value;
	settings_data.settings.location.music = music.value;
	settings_data.settings.location.video = video.value;
	settings_data.settings.location.image = image.value;
	settings_data.settings.location.document = documentt.value;
	settings_data.settings.location.program = program.value;
	settings_data.settings.location.compressed = compressed.value;
	settings_data.settings.location.torrent = torrent.value;
	settings_data.settings.location.other = other.value;
	fs.writeFileSync(settings_path, JSON.stringify(settings_data, null, 4));
	}
});


// Downloads Section

var max_connection = document.getElementById("max-connection"),
	max_download = document.getElementById("max-file-download"),
	user_agent = document.getElementById("user-agent"),
	max_retry = document.getElementById("max-retry"),
	max_delay = document.getElementById("retry-delay"),
	r_timeout = document.getElementById("r-timeout"),
	apply_download = document.getElementById("downloads-submit");

max_connection.value = settings_data.settings.threads;
max_download.value = settings_data.settings.max_download;
user_agent.value = settings_data.settings.user_agent;
max_retry.value = settings_data.settings.retry;
max_delay.value = settings_data.settings.retryDelay;
r_timeout.value = settings_data.settings.timeout;


apply_download.addEventListener("click", async () => {
	console.log("apply download clicked");
	if(max_connection.value == "" || max_download.value == "" || user_agent.value == "" || max_retry.value == "" || max_delay.value == "" || r_timeout.value == "") {
		swal.fire({
			icon: 'error',
			title: 'Oops...',
			text: 'Please fill all the fields!',
		});
	} else {
	settings_data.settings.threads = max_connection.value;
	settings_data.settings.max_download = max_download.value;
	settings_data.settings.user_agent = user_agent.value;
	settings_data.settings.retry = max_retry.value;
	settings_data.settings.retryDelay = max_delay.value;
	settings_data.settings.timeout = r_timeout.value;
	fs.writeFileSync(settings_path, JSON.stringify(settings_data, null, 4));
	}
});


// File Types

var file_types = document.getElementById("file-extension"),
	apply_file_types = document.getElementById("file-types-submit");



file_types.value="";
for(var i = 0; i < settings_data.settings.fileTypes.length; i++) {
	file_types.value += settings_data.settings.fileTypes[i]+" ";
}
console.log(file_types.value);
apply_file_types.addEventListener("click", async () => {
	console.log("apply file types clicked");
	if(file_types.value == "") {
		swal.fire({
			icon: 'error',
			title: 'Oops...',
			text: 'Please fill all the fields!',
		});
	} else {
	settings_data.settings.fileTypes = file_types.value.split(" ");
	for (var i = 0; i < settings_data.settings.fileTypes.length; i++) {
		if(settings_data.settings.fileTypes[i] == "") {
			delete settings_data.settings.fileTypes[i];
		}
	}
	settings_data.settings.fileTypes = settings_data.settings.fileTypes.filter((value, index, array) => array.indexOf(value) === index)
	file_types.value="";
	for(var i = 0; i < settings_data.settings.fileTypes.length; i++) {
		file_types.value += settings_data.settings.fileTypes[i]+" ";
	}
	fs.writeFileSync(settings_path, JSON.stringify(settings_data, null, 4));
	}
});
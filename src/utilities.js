const path = require('path');
function humanReadableByte(size){
	if(!isNaN(size)){
		return "Unknown";
	}

	if(size < 1024){
		return size + " Byte(s)";
	} else if(size < 1048576){
		return (size/1024).toFixed(2) + " KB";
	} else if (size < 1073741824){
		return (size/1048576).toFixed(2) + " MB";
	} else if(size < 1099511627776){
		return (size/1073741824).toFixed(2) + " GB";
	} else {
		return (size/1099511627776).toFixed(2) + " TB";
	}
}

function getEta(size, downloaded, speed){
	if(speed == 0){
		return "∞";
	} else {
		return humanReadableTime((size - downloaded)/speed);
	}
}

function humanReadableTime(seconds){
	if(seconds < 60){
		return seconds.toFixed(0) + " sec";
	} else if(seconds < 3600){
		return (seconds/60).toFixed(0) + " minute(s) " + (seconds%60).toFixed(0) + " sec";
	} else if(seconds < 86400){
		return (seconds/3600).toFixed(0) + " hr" + (seconds%3600).toFixed(0) + " minute(s)" ;
	} else if(seconds < 604800){
		return (seconds/86400).toFixed(0) + " day" + (seconds%86400).toFixed(0) + " hr";
	} else if(seconds < 2419200){
		return (seconds/604800).toFixed(0) + " week" + (seconds%604800).toFixed(0) + " day";
	} else if(seconds < 29030400){
		return (seconds/2419200).toFixed(0) + " month" + (seconds%2419200).toFixed(0) + " week";
	} else if(seconds < 2903040000){
		return (seconds/29030400).toFixed(0) + " year" + (seconds%29030400).toFixed(0) + " month";
	} else {
		return seconds.toFixed(0) + " sec";
	}
}

function pathToFilename(file_path){
	return path.basename(file_path);
}

function humanReadablePercent(percent){
	return percent.toFixed(2);
}

function filenameToExtention(filename){
	return path.extname(filename);
}

function nameToJsonIndex(data, name){
	for(var i = 0; i < data.length; i++){
		if(data[i].name == name){
			return i;
		}
	}
	return -1;
}



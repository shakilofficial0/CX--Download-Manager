const path = require('path');
const url = require('url');
const humanReadableByte=(size)=>{
	
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

const getEta=(size, downloaded, speed)=>{
	if(speed == 0){
		return "∞";
	} else {
		return humanReadableTime((size - downloaded)/speed);
	}
}

const humanReadableTime=(seconds)=>{
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

const pathToFilename=(file_path)=>{
	return path.basename(file_path);
}



const urlToFilename=(url_given)=>{
	a= path.basename(url.parse(url_given).pathname);
	// check extension has or not
	if(a.indexOf('.') == -1){
		a = a + '.unknown';
	}
	return a;
}

const humanReadablePercent=(percent)=>{
	return percent.toFixed(2);
}

const filenameToExtention=(filename)=>{
	return path.extname(filename);
}

const nameToJsonIndex=(data, name)=>{
	for(var i = 0; i < data.length; i++){
		if(data[i].name == name){
			return i;
		}
	}
	return -1;
}

const extToIcon=(ext)=>{
	ext = ext.toLowerCase();
	if(ext == ".ai"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'AI.png');
	} else if(ext == ".avi"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'AVI.png');
	} else if(ext == ".bmp"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'BMP.png');
	} else if(ext == ".crd"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'CRD.png');
	} else if(ext == ".csv" ){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'CSV.png');
	} else if(ext == ".dll"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'DLL.png');
	} else if(ext == ".doc"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'DOC.png');
	} else if(ext == ".docx"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'DOCX.png');
	} else if(ext == ".dwg"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'DWG.png');
	} else if(ext == ".eps"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'EPS.png');
	} else if(ext == ".exe"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'EXE.png');
	} else if(ext == ".flv"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'FLV.png');
	} else if(ext == ".gif"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'GIFF.png');
	} else if(ext == ".html"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'HTML.png');
	} else if(ext == ".iso"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'ISO.png');
	} else if(ext == ".java"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'JAVA.png');
	} else if(ext == ".jpg" || ext == ".jpeg"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'JPG.png');
	} else if(ext == ".mdb"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'MDB.png');
	} else if(ext == ".mid"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'MID.png');
	} else if(ext == ".mov"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'MOV.png');
	} else if(ext == ".mp3"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'MP3.png');
	} else if(ext == ".mp4" || ext == ".m4v" || ext == ".mkv"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'MP4.png');
	} else if(ext == ".mpg" || ext == ".mpeg"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'MPEG.png');
	} else if(ext == ".pdf"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'PDF.png');
	} else if(ext == ".png"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'PNG.png');
	} else if(ext == ".ppt" || ext == ".pptx"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'PPT.png');
	} else if(ext == ".ps"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'PS.png');
	} else if(ext == ".psd"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'PSD.png');
	} else if(ext == ".pub"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'PUB.png');
	} else if(ext == ".rar"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'RAR.png');
	} else if(ext == ".raw"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'RAW.png');
	} else if(ext == ".rss"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'RSS.png');
	} else if(ext == ".svg"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'SVG.png');
	} else if(ext == ".tiff"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'TIFF.png');
	} else if(ext == ".txt"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'TXT.png');
	} else if(ext == ".wav"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'WAV.png');
	} else if(ext == ".wma"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'WMA.png');
	} else if(ext == ".xml"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'XML.png');
	} else if(ext == ".xls" || ext == ".xlsx"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'XLS.png');
	} else if(ext == ".zip"){
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'ZIP.png');
	} else {
		return path.join(__dirname, 'assets', 'img', 'icons', 'extension-icons', 'Other.png');
	}
}




module.exports = { humanReadableByte, getEta, humanReadableTime, pathToFilename, humanReadablePercent, filenameToExtention, nameToJsonIndex, urlToFilename, extToIcon}
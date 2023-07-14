
var closeBtn = document.getElementById('closeBtn');
var minBtn = document.getElementById('minBtn');
var maxBtn = document.getElementById('maxBtn');

closeBtn.addEventListener('click', () => {
	console.log('closeBtn clicked');
	window.api.closeApp();
}
);

minBtn.addEventListener('click', () => {
	console.log('minBtn clicked');
	window.api.minimizeApp();
}
);

maxBtn.addEventListener('click', () => {
	console.log('maxBtn clicked');
	window.api.maximizeApp();
}
);


$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    window.api.openExternal(this.href);
});
// Path: src\js\preload.js
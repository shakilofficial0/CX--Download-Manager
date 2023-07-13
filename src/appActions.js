
var closeBtn = document.getElementById('closeBtn');
closeBtn.addEventListener('click', () => {
	console.log('closeBtn clicked');
	window.api.closeApp();
}
);
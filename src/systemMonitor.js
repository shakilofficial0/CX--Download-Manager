const systemmonitor = require('systeminformation');


setInterval(() => {
systemmonitor.cpu().then(data => {
	console.log(data);
});
}, 1000);
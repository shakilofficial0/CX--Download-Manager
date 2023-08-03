var tabNotification = document.getElementById('allNotification');

var notification_counter = document.getElementById('notification-counter');

var notification_list = path.join(__dirname, '..', '..', 'system', 'notification.json');

var notification_data = JSON.parse(fs.readFileSync(notification_list, 'utf8'));


var counter =0;
console.log(notification_data.notification);
for(var i = 0; i < notification_data.notification.length; i++){
	console.log(notification_data.notification[i]);
	if(notification_data.notification[i].read == false){
		counter+=1;
	}
	notificationMake(notification_data.notification[i]);
}

countNotification(counter);
function countNotification(counter){
	if(counter > 0){
		notification_counter.classList.remove('d-none');
		notification_counter.innerHTML = counter;
	} else {
		notification_counter.classList.add('d-none');
	}
}

function markasread(id){
	for (var i = 0; i < notification_data.notification.length; i++) {
		if(notification_data.notification[i].id == id){
			var element = document.getElementById('nfn-'+id);
			if(notification_data.notification[i].read){
				notification_data.notification[i].read = false;
				countNotification(counter+1);
				element.classList.remove('marked-as-read');
				counter+=1;
			} else {
				notification_data.notification[i].read = true;
				countNotification(counter-1);
				element.classList.add('marked-as-read');
				counter-=1;
			}
			
			updateNotificationFile();
			break;
		}
	}
}

function deleteNotification(id){
	for (var i = 0; i < notification_data.notification.length; i++) {
		if(notification_data.notification[i].id == id){
			notification_data.notification.pop(i);
			updateNotificationFile();
			break;
		}
	}
}

function updateNotificationFile(){
	fs.writeFileSync(notification_list, JSON.stringify(notification_data), 'utf8');
}


function notificationMake(data){
	var sub_html ="";
	if(data.read){
	sub_html += '<li class="list-group-item list-group-item-action dropdown-notifications-item marked-as-read" id="nfn-'+data.id+'">';
	}else{
		sub_html += '<li class="list-group-item list-group-item-action dropdown-notifications-item" id="nfn-'+data.id+'">';
	}
	sub_html += '<div class="d-flex">';
	sub_html += '<div class="flex-shrink-0 me-3">';
	sub_html += '<div class="avatar">';
	if(data.hasImage == true || data.hasImage == "true"){
		sub_html += '<img src="'+data.image_src+'" alt class="h-auto rounded-circle" />';
	} else if(data.hasIcon == true || data.hasIcon == "true"){
		sub_html += '<span class="avatar-initial rounded-circle '+data.background_icon_image+'">';
		sub_html += '<i class="'+data.icon_class+'"></i>';
		sub_html += '</span>';
	} else {
		sub_html += '<span class="avatar-initial rounded-circle '+data.background_icon_image+'">CX+</span>';
	}
	sub_html += '</div>';
	sub_html += '</div>';
	sub_html += '<div class="flex-grow-1">';
	sub_html += '<h6 class="mb-1">'+data.title+'</h6>';
	sub_html += '<p class="mb-0">'+data.body+'</p>';
	sub_html += '<small class="text-muted">'+utilities.timeToAgo(data.time)+'</small>';
	sub_html += '</div>';
	sub_html += '<div class="flex-shrink-0 dropdown-notifications-actions">';
	sub_html += '<a onclick="markasread('+data.id+')" class="dropdown-notifications-read"><span class="badge badge-dot"></span></a>';
	sub_html += '<a onclick="deleteNotification('+data.id+')" class="dropdown-notifications-archive"><span class="ti ti-x"></span></a>';
	sub_html += '</div>';
	sub_html += '</div>';
	sub_html += '</li>';

	tabNotification.innerHTML = sub_html + tabNotification.innerHTML;

}


setInterval(function(){}, 10000);



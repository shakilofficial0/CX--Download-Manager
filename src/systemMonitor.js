const path = require('path');
const systemmonitor = require('systeminformation');
const fs = require('fs');
const utilities = require('./utilities.js');
const { shell,ipcRenderer } = require('electron');
const request = require('request');
const { sys } = require('typescript');

// Cpu Started
var cpu_name = document.getElementById('cpuName');
var cpu_clock_speed = document.getElementById('cpuClockSpeed');
var cpu_clock_speed_mini = document.getElementById('cpuClockSpeedmini');
var cpu_clock_speed_maxi = document.getElementById('cpuClockSpeedmaxi');
var cpu_cores = document.getElementById('cpuCore');
var cpu_threads = document.getElementById('cpuThread');
var cpu_model = document.getElementById('cpuModel');
var cpu_family = document.getElementById('cpuFamily');
var cpu_stepping = document.getElementById('cpuStepping');
var cpu_virtualization = document.getElementById('cpuVirtualization');

systemmonitor.cpu().then(data => {
	for(var i in data){
		if (data[i] == "Default string") {
			data[i] = '-----';
		}
	}
	cpu_name.innerHTML = data.manufacturer + ' ' + data.brand;
	cpu_clock_speed.innerHTML = data.speed + ' GHz';
	cpu_clock_speed_mini.innerHTML = data.speedMin + ' GHz';
	cpu_clock_speed_maxi.innerHTML = data.speedMax + ' GHz';
	cpu_cores.innerHTML = data.physicalCores;
	cpu_threads.innerHTML = data.performanceCores;
	cpu_model.innerHTML = data.model;
	cpu_family.innerHTML = data.family;
	cpu_stepping.innerHTML = data.stepping;
	cpu_virtualization.innerHTML = data.virtualization;

});

// Cpu Ended

// System Started
var mbBrandName = document.getElementById('mbBrandName');
var mbModelName = document.getElementById('mbModelName');
var mbVersion = document.getElementById('mbVersion');
var mbSerial = document.getElementById('mbSerial');
var mbUuid = document.getElementById('mbUuid');
var mbSku = document.getElementById('mbSku');
systemmonitor.system().then(data => {
	for(var i in data){
		if (data[i] == "Default string") {
			data[i] = '-----';
		}
	}
	mbBrandName.innerHTML = data.manufacturer;
	mbModelName.innerHTML = data.model;
	mbVersion.innerHTML = data.version;
	mbSerial.innerHTML = data.serial;
	mbUuid.innerHTML = data.uuid;
	mbSku.innerHTML = data.sku;
});

var mbRamSlots = document.getElementById('mbRamSlot');
var mbMaxRam = document.getElementById('mbMaxRam');
systemmonitor.baseboard().then(data => {
	mbRamSlots.innerHTML = data.memSlots;
	mbMaxRam.innerHTML = utilities.humanReadableByte(data.memMax);
});

// System Ended

// OS Started

systemmonitor.osInfo().then(data => {
	console.log(data);
});







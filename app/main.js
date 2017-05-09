var view = "driver-dashboard";
var updateID;
autonCreatorStart();

tabButtons = {};

function init(){
	tabButtons.driverDashboard = document.getElementById("driver-dashboard-button");
	tabButtons.debugDashboard = document.getElementById("debug-dashboard-button");
	tabButtons.autonConfig = document.getElementById("auton-config-button");
	tabButtons.autonCreator = document.getElementById("auton-creator-button");
	updateID = setInterval(loop, 50);
}

function loop(){
	updateInput();
	var onColor = '#ffffff';
	var offColor = '#cccccc';
	tabButtons.driverDashboard.style.color = (view == "driver-dashboard")?onColor:offColor;
	tabButtons.debugDashboard.style.color = (view == "debug-dashboard")?onColor:offColor;
	tabButtons.autonConfig.style.color = (view == "auton-config")?onColor:offColor;
	tabButtons.autonCreator.style.color = (view == "auton-creator")?onColor:offColor;		
}

init();
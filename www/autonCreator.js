var field = new Image();
var robot = new Image();

var rotTarget = -1;
var moveTarget = -1;

//properties
var fieldWidthIn = 324;
var fieldHeightIn = 652;
var robotWidthIn = 39;
var robotCenterIn = 19;

var ratio = 1;

var splines = [];
var samples = 5;

var toolBarWidth = 100;
var fieldWidthPxl = 0;

function Robot(x, y, rot){
    this.x = parseFloat(x);
    this.y = parseFloat(y);
    this.rot = parseFloat(rot);
}

var robots = [];
var oldRobots = [];
var waypoints = [];

var ws;

function getTargetRobot() {
	var r = 20;
	ratio = (fieldWidthPxl) / fieldWidthIn;
	var mX = fieldMousePos.x / ratio;
	var mY = fieldMousePos.y / ratio;
    var closestRobot = -1;
    var currentLeastDistance = r;
    for(var i in robots){
        var distance = hypot(mX, mY, robots[i].x, robots[i].y);
        if(distance < currentLeastDistance) {
            closestRobot = i;
            currentLeastDistance = distance;
        }
    }
    return closestRobot;
}

function autonCreatorInit(){
    connectToRobot();
    splines = [];
    field.src = "images/field.png";
    robot.src = "images/robot.png";
    robots.push(new Robot(324/2, 75, 180*(Math.PI/180)));
    robots.push(new Robot(220, 45, 215*(Math.PI/180)));
    robots.push(new Robot(290, 75, 90*(Math.PI/180)));
    
}

function newRobot() {
    if(robots.length !== 0) {
        var last = robots[robots.length-1];
        robots.push(new Robot(last.x + 15, last.y + 15, 0));
    } else {
        robots.push(new Robot(0, 0, 0));
    }
}

function removeRobot() {
    if(robots.length > 2) {
        robots.pop();
    }
}

function autonCreatorLoop(){
    fieldWidthPxl = windowWidth - toolBarWidth;
    fieldContext.canvas.width = fieldWidthPxl;
    fieldContext.canvas.height = windowHeight - 32;

    creatorToolbar.style.width = String(toolBarWidth) + "px";
    creatorToolbar.style.height = String(windowHeight - 32) + "px";

    creatorToolbar.style.top = "0px";
    creatorToolbar.style.right = "0px";
    creatorToolbar.style.bottom = "0px";
    creatorToolbar.style.position = "absolute";

    ratio = fieldWidthPxl / fieldWidthIn;
    var robotWidthPxl = robotWidthIn * ratio;
    var robotHeightPxl = robotWidthPxl * (robot.height / robot.width);
    var robotCenterPxl = robotCenterIn * ratio;
    var fieldHeightPxl = fieldHeightIn * ratio;

    fieldContext.drawImage(field, 0, 0, fieldWidthPxl, fieldHeightPxl);

    if(fieldMouseRising.l){
    	moveTarget = getTargetRobot();
    }

    if(fieldMouseFalling.l){
    	moveTarget = -1;
    }

    if(fieldMouseRising.r){
    	rotTarget = getTargetRobot();
    }

    if(fieldMouseFalling.r){
    	rotTarget = -1;
    }

    if(moveTarget != -1){
    	robots[moveTarget].x = fieldMousePos.x / ratio;
    	robots[moveTarget].y = fieldMousePos.y / ratio;
    	fieldCanvas.style.cursor = cursors.move;
    }
    else if(rotTarget != -1){
    	var angle = Math.atan2((fieldMousePos.x - robots[rotTarget].x * ratio), (fieldMousePos.y - robots[rotTarget].y * ratio));
        if(fieldKeyboard.shift) {
            angle = Math.round(angle /(Math.PI/8.0)) * (Math.PI/8.0);
        }
        robots[rotTarget].rot = angle + Math.PI/2;
        while(robots[rotTarget].rot > Math.PI) {
            robots[rotTarget].rot -= Math.PI*2;
        }
    	var degrees = 360 - (angle * (180/Math.PI));

    	while(degrees >= 360 || degrees > 180) {
    	    degrees -= 360;
        }
        fieldContext.fillStyle = "#ffffff";
        fieldContext.fillText((degrees.toFixed(1) + "\xB0"), fieldMousePos.x + 8, fieldMousePos.y - 8);
    	fieldCanvas.style.cursor = cursors.crosshair;
    } else {
    	fieldCanvas.style.cursor = cursors.default;
    }

    fieldContext.fillStyle = "#ffffff";
    fieldContext.fillText("X: " + pixelsToFieldInches(fieldMousePos.x).toFixed(1)
        + " Y: " + pixelsToFieldInches(fieldMousePos.y).toFixed(1), 8, 8);

    waypoints = [];

    for(var i in robots) {
    	var robotPosXPxl = robots[i].x * ratio;
    	var robotPosYPxl = robots[i].y * ratio;
    	fieldContext.save();
    	fieldContext.translate(Math.floor(robotPosXPxl), Math.floor(robotPosYPxl));
    	fieldContext.rotate(-robots[i].rot - Math.PI/2);
    	fieldContext.drawImage(robot, Math.floor(-robotWidthPxl * .5),
    	Math.floor(-robotCenterPxl), Math.floor(robotWidthPxl), Math.floor(robotHeightPxl));
    	fieldContext.restore();

    	waypoints.push(new Waypoint(robots[i].x, robots[i].y, robots[i].rot));		
    }

    newSplines = [];
    for(var i = 0; i < waypoints.length-1; i++){
    	newSplines.push(new Spline(waypoints[i], waypoints[i+1]));
    }

    if(newSplines.length !== splines.length){
    	splines = newSplines;
    	samples = 5;
    } else {
    	for(var i in newSplines){
    		var n = newSplines[i];
    		var o = splines[i];
    		if((n.e != o.e || n.c != o.c) || n.d != o.d){
    			splines = newSplines;
    			samples = 5;
    			break;
    		}
    	}
    }

    if(newSplines !== splines){
    	if(samples < 15){
    		samples*=1.1;
    	}
    }

    //Draw spline
    var a = splines[0].coord(0);
    fieldContext.moveTo(a.x * ratio, a.y * ratio);
    fieldContext.beginPath();
    fieldContext.lineWidth = Math.floor(windowWidth * .005);
    fieldContext.strokeStyle = "#00ffff";
    var inc = 1 / samples;
    for(var s in splines){
    	var c = splines[s].coord(0);
    	fieldContext.moveTo(c.x * ratio, c.y * ratio);
    	for(var i = inc; i <1; i += inc){
    		c = splines[s].coord(i);
    		fieldContext.lineTo(Math.floor(c.x * ratio), Math.floor(c.y * ratio));
    	}
    	c = splines[s].coord(1);
    	fieldContext.lineTo(Math.floor(c.x * ratio), Math.floor(c.y * ratio));
    }
    fieldContext.stroke();

    oldRobots = robots;
}

function pathAsText() {
    var output = [];
    var inc = 1 / samples;
    for(var s in splines) {
        var c = splines[s].coord(0);
        var waypoint = {
            "name": "wp",
            "x": Number(fieldWidthIn - c.x.toFixed(2)),
            "y": Number(c.y.toFixed(2)),
            "theta": 0,
            "pathAngle": Number(splines[s].startTheta().toFixed(2))

        };
        output.push(waypoint);
        for(var i = inc; i <1; i += inc){
            c = splines[s].coord(i);
            var waypoint = {
                "name": "point",
                "x": Number(fieldWidthIn - c.x.toFixed(2)),
                "y": Number(c.y.toFixed(2))
            };
            output.push(waypoint);
        }
    }
    c = splines[splines.length-1].coord(1);
    var waypoint = {
        "name": "wp",
        "x": Number(fieldWidthIn - c.x.toFixed(2)),
        "y": Number(c.y.toFixed(2)),
        "theta": 0,
        "pathAngle": Number(splines[s].startTheta().toFixed(2))
    };
    output.push(waypoint);
    console.log("Path: ");
    console.log(output);
    return output;
}

function exportPath() {
    var file = new File([pathAsText()], "path.json", {type: "text/plain;charset=utf-8"});
    saveAs(file);
}

function sendPath() {
    ws.send(pathAsText());
}

function loadPath(path) {
	robots = [];
	splines = [];
	oldRobots = [];
    waypoints = [];
	rotTarget = -1;
    moveTarget = -1;
	samples = 5;
	var lines = path.split('\n');
	for(var i = 0; i < lines.length; i++){
		if (lines[i].indexOf("wp") !== -1) {
			var done = lines[i].split(', ');
			robots.push(new Robot(done[0], done[1], done[2]));
		} 
	}
}

function connectToRobot() {
    ws = new WebSocket('ws://' + document.location.host + '/path');
}
function pixelsToFieldInches(px) {
    var t = px /ratio;
    return t;
}